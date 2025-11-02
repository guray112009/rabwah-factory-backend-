import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    position: { type: String, required: true, trim: true },

    shift: {
      type: String,
      enum: ["Morning", "Afternoon", "Evening", "Night"],
      default: "Morning", // ✅ Added default for consistency
      required: true,
    },

    hourlyRate: { type: Number, required: true, min: 0 },
    hoursWorked: { type: Number, default: 0, min: 0 },

    salary: { type: Number, default: 0 }, // ✅ auto-calculated if hours present
    notes: { type: String, trim: true },

    createdBy: { type: String, required: true, trim: true }, // admin email
  },
  { timestamps: true }
);

/* ==========================================================
   🧮 Auto-calculate salary before save
   ========================================================== */
employeeSchema.pre("save", function (next) {
  if (this.isModified("hourlyRate") || this.isModified("hoursWorked")) {
    const rate = this.hourlyRate || 0;
    const hours = this.hoursWorked || 0;
    this.salary = rate * hours;
  }
  next();
});

/* ==========================================================
   🧮 Auto-update salary before updateOne / findOneAndUpdate
   (useful for PATCH operations)
   ========================================================== */
employeeSchema.pre(["updateOne", "findOneAndUpdate"], function (next) {
  const update = this.getUpdate();
  if (update.hourlyRate !== undefined || update.hoursWorked !== undefined) {
    const rate = update.hourlyRate ?? this._update.hourlyRate ?? 0;
    const hours = update.hoursWorked ?? this._update.hoursWorked ?? 0;
    update.salary = rate * hours;
    this.setUpdate(update);
  }
  next();
});

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
