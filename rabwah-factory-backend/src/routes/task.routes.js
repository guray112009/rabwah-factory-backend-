// src/routes/task.routes.js
import express from "express";
import Task from "../models/Task.js";
import { requireRole } from "../middleware/requireRole.js";
import { verifyToken } from "../middleware/auth.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

/* =========================================================
   🟢 GET ALL TASKS — Managers/Admins only
========================================================= */
router.get(
  "/",
  verifyToken,
  requireRole(ROLES.ADMIN, ROLES.MANAGER),
  async (req, res) => {
    try {
      const tasks = await Task.find().sort({ createdAt: -1 });
      res.status(200).json(tasks);
    } catch (err) {
      console.error("❌ Error fetching tasks:", err);
      res.status(500).json({
        message: "Failed to fetch tasks",
        error: err.message,
      });
    }
  }
);

/* =========================================================
   🟢 GET MY TASKS — For logged-in staff or customer
========================================================= */
router.get(
  "/my",
  verifyToken,
  requireRole(ROLES.CUSTOMER, ROLES.STAFF),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      let filter = {};

      // ✅ Customers see their own requests
      if (userRole === ROLES.CUSTOMER) {
        filter = { customerId: userId, roleType: "customer" };
      }

      // ✅ Staff see tasks assigned to them by manager
      if (userRole === ROLES.STAFF) {
        filter = { assignedTo: userId, roleType: "staff" };
      }

      const tasks = await Task.find(filter).sort({ createdAt: -1 });
      res.status(200).json(tasks);
    } catch (err) {
      console.error("❌ Error fetching user tasks:", err);
      res.status(500).json({
        message: "Failed to fetch user tasks",
        error: err.message,
      });
    }
  }
);

/* =========================================================
   🟢 CREATE NEW TASK — Managers/Admins OR Customers
   ✅ Customers send service requests; managers assign staff tasks
========================================================= */
router.post("/", verifyToken, async (req, res) => {
  try {
    console.log("📥 Incoming Task Data:", req.body);

    const {
      title,
      description,
      dueDate,
      roleType,
      customerId: bodyCustomerId,
    } = req.body;

    const customerId =
      req.user.role === ROLES.CUSTOMER ? req.user.id : bodyCustomerId;

    if (!customerId || !title || !dueDate) {
      return res.status(400).json({ message: "⚠️ Missing required fields" });
    }

    const { default: User } = await import("../models/User.js");
    const user = await User.findById(customerId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isManagerOrAdmin =
      req.user.role === ROLES.ADMIN || req.user.role === ROLES.MANAGER;
    const isCustomer = req.user.role === ROLES.CUSTOMER;

    if (!isManagerOrAdmin && !isCustomer) {
      return res
        .status(403)
        .json({ message: "You don't have permission to perform this action." });
    }

    const newTask = new Task({
      customerId,
      customerName: user.fullName || user.name,
      title,
      description,
      dueDate,
      status: "pending",
      roleType: roleType || (isCustomer ? "customer" : "staff"),
      createdBy: req.user.email || "system@factory.com",
    });

    await newTask.save();

    res.status(201).json({
      message: isCustomer
        ? "✅ Your request has been sent to the manager!"
        : "✅ Task created successfully!",
      task: newTask,
    });
  } catch (err) {
    console.error("❌ Error creating task:", err);
    res
      .status(500)
      .json({ message: "Task creation failed", error: err.message });
  }
});

/* =========================================================
   📤 ASSIGN REQUEST → STAFF (Manager/Admin only)
========================================================= */
router.post(
  "/assign",
  verifyToken,
  requireRole(ROLES.ADMIN, ROLES.MANAGER),
  async (req, res) => {
    try {
      const { requestId, staffId, staffName } = req.body;

      if (!requestId || !staffId || !staffName) {
        return res.status(400).json({
          message: "⚠️ requestId, staffId, and staffName are required",
        });
      }

      const task = await Task.findById(requestId);
      if (!task) return res.status(404).json({ message: "Task not found" });

      // ✅ Update assignment fields
      task.assignedTo = staffId;
      task.assignedName = staffName;
      task.roleType = "staff";
      task.status = "assigned";

      await task.save();

      res.status(200).json({
        message: "✅ Request assigned to staff successfully",
        task,
      });
    } catch (err) {
      console.error("❌ Error assigning request:", err);
      res.status(500).json({
        message: "Failed to assign request",
        error: err.message,
      });
    }
  }
);

/* =========================================================
   🟡 UPDATE TASK STATUS — Mark completed, etc.
========================================================= */
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // 🔒 Permission check
    if ([ROLES.CUSTOMER, ROLES.STAFF].includes(req.user.role)) {
      const canUpdate =
        (req.user.role === ROLES.CUSTOMER &&
          task.customerId.toString() === req.user.id) ||
        (req.user.role === ROLES.STAFF &&
          task.assignedTo?.toString() === req.user.id);

      if (!canUpdate) {
        return res
          .status(403)
          .json({ message: "You don't have permission to modify this task." });
      }
    }

    // ✅ Customers/Staff can only mark as completed
    if (
      [ROLES.CUSTOMER, ROLES.STAFF].includes(req.user.role) &&
      status !== "completed"
    ) {
      return res.status(403).json({
        message: "Only managers can modify tasks other than marking complete.",
      });
    }

    task.status = status || task.status;
    await task.save();

    res.status(200).json({ message: "✅ Task updated successfully", task });
  } catch (err) {
    console.error("❌ Error updating task:", err);
    res.status(500).json({
      message: "Failed to update task",
      error: err.message,
    });
  }
});

/* =========================================================
   🔴 DELETE TASK — Managers/Admins only
========================================================= */
router.delete(
  "/:id",
  verifyToken,
  requireRole(ROLES.ADMIN, ROLES.MANAGER),
  async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Task.findByIdAndDelete(id);
      if (!deleted)
        return res.status(404).json({ message: "Task not found" });

      res.status(200).json({ message: "🗑️ Task deleted successfully" });
    } catch (err) {
      console.error("❌ Error deleting task:", err);
      res.status(500).json({
        message: "Failed to delete task",
        error: err.message,
      });
    }
  }
);

export default router;
