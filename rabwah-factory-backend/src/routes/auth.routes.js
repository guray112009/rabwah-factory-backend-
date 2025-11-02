import express from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

// ✅ Helper to create JWT token
function signToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role?.toLowerCase(), // ✅ normalize role
      email: user.email,
      fullName: user.fullName,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/* ==========================================================
   🧩 REGISTER — new customer sign-up
   POST /api/auth/register
   ========================================================== */
router.post(
  "/register",
  [
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const email = req.body.email.toLowerCase(); // ✅ normalize email
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ message: "Email already in use" });

      const user = await User.create({
        fullName: req.body.fullName,
        email,
        password: req.body.password,
        role: ROLES.CUSTOMER,
      });

      const token = signToken(user);
      res.status(201).json({
        token,
        user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/* ==========================================================
   🔐 LOGIN — existing user (admin, staff, customer)
   POST /api/auth/login
   ========================================================== */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      // ✅ Always lowercase email for consistent lookup
      const email = req.body.email.toLowerCase();
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      // 🛑 Added check — block login if user is deactivated
      if (!user.isActive) {
        return res.status(403).json({
          message:
            "🚫 Your account has been deactivated by the manager. Please contact support.",
        });
      }

      const isMatch = await user.comparePassword(req.body.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

      const token = signToken(user);
      res.json({
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role?.toLowerCase(), // ✅ normalize role before sending
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

export default router;
