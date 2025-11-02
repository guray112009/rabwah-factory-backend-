import express from "express";
import { addSalary, getSalaries, deleteSalary } from "../controllers/salary.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Add new salary (Manager only)
router.post("/", verifyToken, addSalary);

// Get all salaries for logged-in manager
router.get("/", verifyToken, getSalaries);

// Delete salary record
router.delete("/:id", verifyToken, deleteSalary);

export default router;
