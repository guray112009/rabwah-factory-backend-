// src/routes/customers.routes.js
import express from "express";
import { body, validationResult } from "express-validator";
import { requireRole } from "../middleware/requireRole.js";
import { ELEVATED } from "../constants/roles.js";
import Customer from "../models/Customer.js";
import Order from "../models/Order.js"; // ✅ Ensure Order model is imported
import nodemailer from "nodemailer";
import { verifyToken } from "../middleware/auth.js"; // ✅ Correct import

const router = express.Router();

/* ==========================================================
   👀 GET ALL CUSTOMERS — staff / manager / admin
   GET /api/customers
   ========================================================== */
router.get("/", verifyToken, requireRole(...ELEVATED, "staff"), async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q
      ? { $or: [{ name: new RegExp(q, "i") }, { company: new RegExp(q, "i") }] }
      : {};

    const customers = await Customer.find(filter).sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    console.error("❌ Error loading customers:", err);
    res.status(500).json({ message: "Failed to load customers." });
  }
});

/* ==========================================================
   ➕ ADD NEW CUSTOMER — staff / manager / admin
   POST /api/customers
   ========================================================== */
router.post(
  "/",
  verifyToken,
  requireRole(...ELEVATED, "staff"),
  [body("name").notEmpty().withMessage("Customer name is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { email } = req.body;

      // 🛡️ Prevent duplicate customers
      const existing = await Customer.findOne({ email });
      if (existing)
        return res
          .status(400)
          .json({ message: "⚠️ A customer with this email already exists." });

      // ✅ Create new customer with empty tasks
      const customer = await Customer.create({
        ...req.body,
        tasks: [], // ✅ Every customer starts with their own empty task list
      });

      res.status(201).json(customer);
    } catch (err) {
      console.error("❌ Error adding customer:", err);
      res.status(500).json({ message: "Failed to add customer." });
    }
  }
);

/* ==========================================================
   ✏️ UPDATE CUSTOMER — staff / manager / admin
   PATCH /api/customers/:id
   ========================================================== */
router.patch("/:id", verifyToken, requireRole(...ELEVATED, "staff"), async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated)
      return res.status(404).json({ message: "Customer not found" });

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating customer:", err);
    res.status(500).json({ message: "Failed to update customer." });
  }
});

/* ==========================================================
   ❌ DELETE CUSTOMER — only admin / manager
   DELETE /api/customers/:id
   ========================================================== */
router.delete("/:id", verifyToken, requireRole(...ELEVATED), async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting customer:", err);
    res.status(500).json({ message: "Failed to delete customer." });
  }
});

/* ==========================================================
   🛍️ GET CUSTOMER'S OWN ORDERS
   GET /api/customers/my-orders
   ========================================================== */
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    // 🧾 Each customer sees only their own orders
    const orders = await Order.find({ customerEmail: req.user.email }).sort({
      createdAt: -1,
    });
    res.json({ orders });
  } catch (err) {
    console.error("❌ Error loading orders:", err);
    res.status(500).json({ message: "Failed to load orders." });
  }
});

/* ==========================================================
   ❌ DELETE CUSTOMER ORDER (Customer only)
   DELETE /api/customers/my-orders/:id
   ========================================================== */
router.delete("/my-orders/:id", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // 🛡️ Ensure order belongs to this customer
    if (order.customerEmail && order.customerEmail !== req.user.email) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this order." });
    }

    await order.deleteOne();
    res.json({ message: "🗑️ Order removed successfully." });
  } catch (err) {
    console.error("❌ Error deleting order:", err);
    res.status(500).json({ message: "Failed to delete order." });
  }
});

/* ==========================================================
   💬 CUSTOMER SEND MESSAGE — Contact Rabwah
   POST /api/customers/message
   ========================================================== */
router.post("/message", verifyToken, async (req, res) => {
  const { product, message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message text is required." });
  }

  try {
    // ✅ Setup mail transporter
    const transporter = nodemailer.createTransport({
      service: process.env.MAIL_SERVICE || "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // ✅ Send email to factory inbox
    await transporter.sendMail({
      from: req.user.email,
      to: process.env.MAIL_USER,
      subject: `New message from ${req.user.email}`,
      text: `Product: ${product || "N/A"}\n\nMessage: ${message}`,
    });

    res.status(201).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error("❌ Error sending message:", err);
    res.status(500).json({ message: "Failed to send message." });
  }
});

/* ==========================================================
   🚫 BLOCK CUSTOMERS FROM BUSINESS EXPENSE ROUTES
   ========================================================== */
router.all(/^\/expenses(\/.*)?$/, verifyToken, (req, res) => {
  return res
    .status(403)
    .json({ message: "Customers are not authorized for business expenses." });
});

export default router;
