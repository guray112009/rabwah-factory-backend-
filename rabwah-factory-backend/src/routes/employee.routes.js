// src/routes/employee.routes.js
import express from "express";
import Employee from "../models/Employee.js";
import { requireRole } from "../middleware/requireRole.js";
import { ROLES } from "../constants/roles.js";
import { Parser } from "json2csv";
import { verifyToken } from "../middleware/auth.js"; // ✅ Correct middleware

const router = express.Router();

/* ----------------------------------------------------------
   Helper: Only proceed on valid Mongo ObjectId, else skip route
---------------------------------------------------------- */
const ensureObjectIdParam = (req, _res, next) => {
  const { id } = req.params;
  if (/^[0-9a-fA-F]{24}$/.test(id)) return next();
  return next("route");
};

/* ==========================================================
   👥 GET All Employees — Admin & Manager
========================================================== */
router.get("/", verifyToken, requireRole(ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (err) {
    console.error("❌ Error loading employees:", err);
    res.status(500).json({ message: "Failed to fetch employees", error: err.message });
  }
});

/* ==========================================================
   🔍 GET Single Employee by ID
========================================================== */
router.get("/:id", ensureObjectIdParam, verifyToken, requireRole(ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    res.status(200).json({ message: "✅ Employee details loaded successfully", employee });
  } catch (err) {
    console.error("❌ Error fetching employee:", err);
    res.status(500).json({ message: "Failed to fetch employee", error: err.message });
  }
});

/* ==========================================================
   ➕ ADD New Employee — Admin only
========================================================== */
router.post("/", verifyToken, requireRole(ROLES.ADMIN), async (req, res) => {
  try {
    const { fullName, phone, position, shift, hourlyRate, hoursWorked, notes } = req.body;

    if (!fullName || !position || hourlyRate == null || hoursWorked == null) {
      return res.status(400).json({
        message: "⚠️ Missing required fields: fullName, position, hourlyRate, hoursWorked",
      });
    }

    const rate = Number(hourlyRate) || 0;
    const hours = Number(hoursWorked) || 0;
    const createdBy = req.user?.email || "admin@factory.com";
    const salary = rate * hours;

    const newEmployee = new Employee({
      fullName,
      phone,
      position,
      shift,
      hourlyRate: rate,
      hoursWorked: hours,
      salary,
      notes,
      createdBy,
    });

    await newEmployee.save();
    res.status(201).json({ message: "✅ Employee added successfully", employee: newEmployee });
  } catch (err) {
    console.error("❌ Error adding employee:", err);
    res.status(500).json({ message: "Failed to add employee", error: err.message });
  }
});

/* ==========================================================
   ✏️ UPDATE Employee Info or Hours — Admin only
========================================================== */
router.patch("/:id", ensureObjectIdParam, verifyToken, requireRole(ROLES.ADMIN), async (req, res) => {
  try {
    const updates = { ...req.body };

    if ("hourlyRate" in updates || "hoursWorked" in updates) {
      const employee = await Employee.findById(req.params.id);
      if (!employee) return res.status(404).json({ message: "Employee not found" });

      const newRate =
        updates.hourlyRate !== undefined ? Number(updates.hourlyRate) || 0 : employee.hourlyRate;
      const newHours =
        updates.hoursWorked !== undefined ? Number(updates.hoursWorked) || 0 : employee.hoursWorked;

      updates.hourlyRate = newRate;
      updates.hoursWorked = newHours;
      updates.salary = newRate * newHours;
    }

    const updated = await Employee.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "Employee not found" });

    res.json({ message: "✅ Employee updated successfully", employee: updated });
  } catch (err) {
    console.error("❌ Error updating employee:", err);
    res.status(500).json({ message: "Failed to update employee", error: err.message });
  }
});

/* ==========================================================
   💰 UPDATE Employee Payroll Only — Admin only
========================================================== */
router.patch("/:id/payroll", ensureObjectIdParam, verifyToken, requireRole(ROLES.ADMIN), async (req, res) => {
  try {
    const hasRate = req.body.hourlyRate !== undefined;
    const hasHours = req.body.hoursWorked !== undefined;
    if (!hasRate && !hasHours)
      return res.status(400).json({ message: "Provide hourlyRate or hoursWorked" });

    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const newRate = hasRate ? Number(req.body.hourlyRate) || 0 : employee.hourlyRate;
    const newHours = hasHours ? Number(req.body.hoursWorked) || 0 : employee.hoursWorked;

    employee.hourlyRate = newRate;
    employee.hoursWorked = newHours;
    employee.salary = newRate * newHours;

    await employee.save();
    res.json({ message: "✅ Payroll updated successfully", employee });
  } catch (err) {
    console.error("❌ Error updating payroll:", err);
    res.status(500).json({ message: "Failed to update payroll", error: err.message });
  }
});

/* ==========================================================
   📊 EMPLOYEE STATS — Admin & Manager
========================================================== */
router.get("/stats", verifyToken, requireRole(ROLES.ADMIN, ROLES.MANAGER), async (_req, res) => {
  try {
    const employees = await Employee.find();
    const total = employees.length;
    const totalSalary = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
    const avgSalary = total > 0 ? (totalSalary / total).toFixed(2) : "0.00";

    res.json({
      message: "✅ Employee stats generated successfully",
      totalEmployees: total,
      totalSalary: totalSalary.toFixed(2),
      avgSalary,
    });
  } catch (err) {
    console.error("❌ Error fetching stats:", err);
    res.status(500).json({ message: "Failed to fetch employee stats", error: err.message });
  }
});

/* ==========================================================
   🗑️ DELETE Employee — Admin only
========================================================== */
router.delete("/:id", ensureObjectIdParam, verifyToken, requireRole(ROLES.ADMIN), async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "✅ Employee removed successfully" });
  } catch (err) {
    console.error("❌ Error deleting employee:", err);
    res.status(500).json({ message: "Failed to delete employee", error: err.message });
  }
});

/* ==========================================================
   📤 EXPORT Payroll as CSV — Admin only
========================================================== */
router.get("/export", verifyToken, requireRole(ROLES.ADMIN), async (_req, res) => {
  try {
    const employees = await Employee.find().sort({ fullName: 1 });
    if (employees.length === 0)
      return res.status(404).json({ message: "No employees to export" });

    const fields = [
      "fullName",
      "phone",
      "position",
      "shift",
      "hourlyRate",
      "hoursWorked",
      "salary",
      "createdBy",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(employees);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment("employee_payroll.csv");
    res.send(csv);
  } catch (err) {
    console.error("❌ Error exporting payroll CSV:", err);
    res.status(500).json({ message: "Failed to export payroll", error: err.message });
  }
});

export default router;
