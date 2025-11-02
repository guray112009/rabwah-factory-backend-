// src/routes/users.routes.js
import express from "express";
import { body, validationResult } from "express-validator";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { requireRole } from "../middleware/requireRole.js";
import { ROLES, ELEVATED } from "../constants/roles.js";
import { sendEmail } from "../utils/sendEmail.js";
import { verifyToken } from "../middleware/auth.js"; // ✅ Correct middleware import

const router = express.Router();

/* ==========================================================
   ⚙️ Validate MongoDB ObjectId
   ========================================================== */
const validateObjectId = (req, res, next) => {
  if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }
  next();
};

/* ==========================================================
   👥 GET ALL USERS — Manager & Admin
   ========================================================== */
router.get("/", verifyToken, requireRole(ROLES.MANAGER, ROLES.ADMIN), async (req, res) => {
  try {
    let query = {};

    // Admins see staff/customers only
    if (req.user.role === ROLES.ADMIN) {
      query = { role: { $in: [ROLES.STAFF, ROLES.CUSTOMER] } };
    }

    // Managers can view all
    const users = await User.find(query).select("-password").sort({ createdAt: -1 });

    res.json({
      message: "User list loaded successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ==========================================================
   ➕ CREATE NEW USER — Admin & Manager
   ========================================================== */
router.post(
  "/",
  verifyToken,
  requireRole(ROLES.MANAGER, ROLES.ADMIN),
  [
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isString()
      .trim()
      .toLowerCase()
      .isIn([ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER])
      .withMessage("Invalid role provided"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { fullName, email, password, role, phone } = req.body;
      const normalizedEmail = email.toLowerCase();

      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) return res.status(409).json({ message: "Email already in use" });

      const user = await User.create({
        fullName,
        email: normalizedEmail,
        password,
        role: role.toLowerCase(),
        phone,
      });

      res.status(201).json({
        message: "✅ User created successfully",
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          isActive: user.isActive,
        },
      });
    } catch (error) {
      console.error("❌ Error creating user:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

/* ==========================================================
   👤 GET CURRENT USER PROFILE
   ========================================================== */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      joined: user.createdAt,
    });
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ==========================================================
   ✏️ UPDATE PROFILE (SELF)
   ========================================================== */
router.patch("/profile", verifyToken, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "✅ Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ==========================================================
   🔐 CHANGE PASSWORD (SELF)
   ========================================================== */
router.patch("/change-password", verifyToken, async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword)
    return res.status(400).json({ message: "All fields are required" });

  if (newPassword !== confirmPassword)
    return res.status(400).json({ message: "New passwords do not match" });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(400).json({ message: "Old password incorrect" });

    user.password = newPassword;
    await user.save();

    res.json({ message: "✅ Password changed successfully" });
  } catch (error) {
    console.error("❌ Error changing password:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ==========================================================
   📊 DASHBOARD STATS — Admin & Manager
   ========================================================== */
router.get("/admin-stats", verifyToken, requireRole(ROLES.MANAGER, ROLES.ADMIN), async (_req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const managers = await User.countDocuments({ role: ROLES.MANAGER });
    const staff = await User.countDocuments({ role: ROLES.STAFF });
    const customers = await User.countDocuments({ role: ROLES.CUSTOMER });

    res.json({
      totalUsers,
      managers,
      staff,
      customers,
      message: "Dashboard stats loaded successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ==========================================================
   ✏️ UPDATE STAFF INFO — Admin & Manager
   ========================================================== */
router.patch("/staff/:id", verifyToken, requireRole(ROLES.MANAGER, ROLES.ADMIN), validateObjectId, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    const { fullName, email, phone, role, password } = req.body;
    const updates = {};

    if (fullName) updates.fullName = fullName;
    if (email) updates.email = email.toLowerCase();
    if (phone) updates.phone = phone;
    if (role) updates.role = role.toLowerCase();
    if (password && password.trim() !== "") {
      updates.password = await bcrypt.hash(password, 10);
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select("fullName email phone role isActive updatedAt");

    res.json({ message: "✅ User updated successfully", staff: updated });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ==========================================================
   🔄 TOGGLE USER STATUS — Admin & Manager
   ========================================================== */
router.patch("/staff/:id/toggle", verifyToken, requireRole(ROLES.MANAGER, ROLES.ADMIN), validateObjectId, async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "User not found" });

    staff.isActive = !staff.isActive;
    await staff.save();

    res.json({
      message: `Status updated (${staff.isActive ? "Activated" : "Deactivated"})`,
      staff,
    });
  } catch (error) {
    console.error("❌ Error toggling user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ==========================================================
   ❌ DELETE USER — Admin & Manager
   ========================================================== */
router.delete("/staff/:id", verifyToken, requireRole(ROLES.MANAGER, ROLES.ADMIN), validateObjectId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: `🗑️ User "${user.fullName}" deleted successfully`, id: user._id });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
