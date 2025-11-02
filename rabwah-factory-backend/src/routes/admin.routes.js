// src/routes/admin.routes.js
import express from "express";
import { getAdminStats } from "../controllers/admin.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js"; // ✅ fixed to named import

const router = express.Router();

/**
 * @route   GET /api/admin/stats
 * @desc    Fetch admin stats (protected)
 * @access  Private (Admin, Manager)
 */
router.get(
  "/stats",
  verifyToken,
  requireRole(["admin", "manager"]),
  getAdminStats
);

export default router;
