import mongoose from "mongoose";

const salarySchema = new mongoose.Schema(
  {
    // 🧩 Manager who created the record (linked from JWT)
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or "Manager" depending on your main user model
      required: true,
    },

    // 🧩 Employee / staff details
    staffId: { type: String }, // optional if not needed
    name: { type: String, required: true },
    jobTitle: { type: String, required: true },
    salary: { type: Number, required: true },
    month: { type: String, required: true },
    date: { type: String, default: () => new Date().toISOString() },
    contact: { type: String }, // ✅ optional new field
  },
  { timestamps: true }
);

export default mongoose.model("Salary", salarySchema);
