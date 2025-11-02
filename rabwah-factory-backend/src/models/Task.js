// src/models/Task.js
import mongoose from "mongoose";

/* ==========================================================
   🧩 Task Schema — Handles both Customer Requests and Staff Tasks
   ========================================================== */
const taskSchema = new mongoose.Schema(
  {
    // 👤 The customer or staff linked to this task
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🧾 Display name for customer or staff
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    // 📝 Title of task or request
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // 💬 Optional description field
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // 📅 Deadline or due date
    dueDate: {
      type: Date,
      required: true,
    },

    // 🚦 Current task state
    // ✅ FIXED: Added "assigned" to handle manager → staff assignment
    status: {
      type: String,
      enum: ["pending", "assigned", "in progress", "completed"],
      default: "pending",
    },

    // 👥 Whether this is a staff task or customer request
    roleType: {
      type: String,
      enum: ["staff", "customer"],
      required: true,
      default: "staff", // visible under manager dashboard
    },

    // 🧑‍💼 Who created or assigned this task
    createdBy: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // 🧩 When a manager assigns a task to staff
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 🧩 Name of the staff assigned
    assignedName: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true, // ⏱️ Automatically adds createdAt and updatedAt
  }
);

/* ==========================================================
   🧠 Index or Future Enhancements (Optional)
   ========================================================== */
// Example: Auto-remove expired tasks
// taskSchema.index({ dueDate: 1 }, { expireAfterSeconds: 0 });

/* ==========================================================
   ✅ Model Export
   ========================================================== */
const Task = mongoose.model("Task", taskSchema);
export default Task;
