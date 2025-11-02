import "dotenv/config.js";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import { ROLES } from "../constants/roles.js";

async function run() {
  await connectDB(process.env.MONGODB_URI);

  const email = "admin@rabwah.com";
  const existing = await User.findOne({ email });

  const plainPassword = "admin123"; // 🔑 Plain password (Mongoose will hash it)

  if (existing) {
    existing.fullName = "Rabwah Admin";
    existing.role = ROLES.ADMIN;
    existing.phone = existing.phone || "000-000-0000";
    existing.password = plainPassword; // ✅ plain — pre-save hook will hash
    await existing.save();

    console.log("🔄 Admin account updated successfully:");
    console.log({ email: existing.email, password: plainPassword });
    process.exit(0);
  }

  // ✅ Create new admin if not found
  const admin = await User.create({
    fullName: "Rabwah Admin",
    email,
    password: plainPassword, // ✅ plain — will be hashed automatically
    role: ROLES.ADMIN,
    phone: "000-000-0000",
  });

  console.log("✅ Admin created successfully:");
  console.log({ email: admin.email, password: plainPassword });
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Error creating/updating admin:", err.message);
  process.exit(1);
});
