import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly"],
      required: true,
      default: "Daily", // ✅ ensures consistent default
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: String, // admin email or ID
      required: true,
      trim: true,
    },

    /* ✅ Improvement: track soft-deletes for future restore */
    isDeleted: {
      type: Boolean,
      default: false,
    },

    /* ✅ Optional: who deleted it (for audit trail) */
    deletedBy: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

/* ✅ Helper: hide deleted expenses automatically when fetching */
expenseSchema.pre(/^find/, function (next) {
  if (!this.getFilter().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

/* ✅ Virtual field: formatted date for UI */
expenseSchema.virtual("formattedDate").get(function () {
  return this.date ? this.date.toISOString().split("T")[0] : "";
});

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;
