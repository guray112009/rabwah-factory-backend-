import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../constants/roles.js";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
    },
    phone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* ==========================================================
   🔐 HASH PASSWORD BEFORE SAVE
   ========================================================== */
UserSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    console.error("❌ Error hashing password:", err);
    next(err);
  }
});

/* ==========================================================
   🔍 SAFE PASSWORD COMPARISON (Improved)
   ========================================================== */
UserSchema.methods.comparePassword = async function (rawPassword) {
  try {
    if (!rawPassword || !this.password) {
      console.warn(`⚠️ Missing password data for user: ${this.email}`);
      return false;
    }

    const isMatch = await bcrypt.compare(rawPassword.trim(), this.password);

    if (isMatch) {
      console.log(`✅ Password matched for user: ${this.email}`);
    } else {
      console.warn(`⚠️ Invalid password attempt for: ${this.email}`);
    }

    return isMatch;
  } catch (err) {
    console.error("❌ Error comparing passwords:", err.message);
    return false;
  }
};

/* ==========================================================
   ✅ MODEL EXPORT
   ========================================================== */
export default mongoose.model("User", UserSchema);
