// src/routes/expense.routes.js
import express from "express";
import { Parser } from "json2csv";
import Expense from "../models/Expense.js";
import { requireRole } from "../middleware/requireRole.js";
import { ROLES } from "../constants/roles.js";
import { verifyToken } from "../middleware/auth.js"; // ✅ Correct middleware

const router = express.Router();

/* ==========================================================
   🧾 GET all active (non-deleted) expenses
========================================================== */
router.get("/", verifyToken, requireRole(ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
  try {
    const expenses = await Expense.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();
    res.json(expenses);
  } catch (err) {
    console.error("❌ Error fetching expenses:", err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
});

/* ==========================================================
   ➕ ADD new expense (auto-fill createdBy from logged-in user)
========================================================== */
router.post("/", verifyToken, requireRole(ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
  try {
    const { category, title, amount, description } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ message: "Title and amount are required." });
    }

    // ✅ Auto-fill createdBy — fallback to admin if not present
    const createdBy = req.user?.email || "admin@factory.com";

    const expense = new Expense({
      category,
      title,
      amount,
      description,
      createdBy,
      date: new Date(),
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    console.error("❌ Error adding expense:", err);
    res.status(500).json({ message: "Expense validation failed" });
  }
});

/* ==========================================================
   🗑️ DELETE expense (soft delete)
========================================================== */
router.delete("/:id", verifyToken, requireRole(ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // ✅ Mark as deleted instead of removing permanently
    expense.isDeleted = true;
    expense.deletedBy = req.user?.email || "admin@factory.com";
    expense.deletedAt = new Date();
    await expense.save();

    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting expense:", err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
});

/* ==========================================================
   📤 EXPORT expenses to CSV (non-deleted only)
========================================================== */
router.get("/export", verifyToken, requireRole(ROLES.ADMIN, ROLES.MANAGER), async (_req, res) => {
  try {
    const expenses = await Expense.find({ isDeleted: false }).sort({ date: -1 }).lean();

    if (expenses.length === 0) {
      return res.status(404).json({ message: "No expenses to export" });
    }

    const fields = ["category", "title", "amount", "description", "date", "createdBy"];
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(expenses);

    res.header("Content-Type", "text/csv");
    res.attachment("monthly_expenses.csv");
    return res.send(csv);
  } catch (err) {
    console.error("❌ Error exporting CSV:", err);
    res.status(500).json({ message: "Failed to export CSV" });
  }
});

/* ==========================================================
   🗃 VIEW DELETED EXPENSES (ARCHIVE)
========================================================== */
router.get("/deleted", verifyToken, requireRole(ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
  try {
    const deletedExpenses = await Expense.find({ isDeleted: true })
      .sort({ deletedAt: -1 })
      .lean();

    res.json(deletedExpenses);
  } catch (err) {
    console.error("❌ Error fetching deleted expenses:", err);
    res.status(500).json({ message: "Failed to fetch deleted expenses" });
  }
});

/* ==========================================================
   🔁 RESTORE DELETED EXPENSE
========================================================== */
router.patch("/:id/restore", verifyToken, requireRole(ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    expense.isDeleted = false;
    expense.deletedBy = "";
    expense.deletedAt = null;
    await expense.save();

    res.json({ message: "Expense restored successfully" });
  } catch (err) {
    console.error("❌ Error restoring expense:", err);
    res.status(500).json({ message: "Failed to restore expense" });
  }
});

/* ==========================================================
   ❌ PERMANENT DELETE (HARD DELETE)
========================================================== */
router.delete("/:id/hard", verifyToken, requireRole(ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    await Expense.deleteOne({ _id: req.params.id });
    res.json({ message: "Expense permanently deleted" });
  } catch (err) {
    console.error("❌ Error hard-deleting expense:", err);
    res.status(500).json({ message: "Failed to permanently delete expense" });
  }
});

export default router;
