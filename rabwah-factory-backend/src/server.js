import "dotenv/config.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/db.js";

/* ==========================
   🧩 Import Routes
   ========================== */
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import customersRoutes from "./routes/customers.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import salaryRoutes from "./routes/salary.routes.js"; // ✅ Salary management (new)
import taskRoutes from "./routes/task.routes.js";

/* ==========================
   🚀 Express App Setup
   ========================== */
const app = express();

/* ==========================
   🧰 Global Middleware Setup
   ========================== */
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "5mb" })); // Increased limit for salary uploads if needed
app.use(morgan("dev"));

/* ==========================
   🧩 API Routes
   ========================== */
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/salaries", salaryRoutes); // ✅ Salary routes connected
app.use("/api/tasks", taskRoutes);

/* ==========================
   🩺 Health Check Route
   ========================== */
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
    message: "Rabwah Factory backend running successfully 🚀",
  });
});

/* ==========================
   🛡️ Prevent Invalid ObjectId Errors
   ========================== */
app.use((req, res, next) => {
  if (
    req.originalUrl.includes("/api/users/change-password") ||
    req.originalUrl.includes("/api/users/profile")
  ) {
    if (req.params && req.params.id) delete req.params.id;
  }
  next();
});

/* ==========================
   ⚠️ Handle Unknown Routes
   ========================== */
app.use((_req, res) => {
  res.status(404).json({ message: "⚠️ Route not found" });
});

/* ==========================
   🌐 MongoDB + Server Startup
   ========================== */
const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log("✅ MongoDB connected successfully");
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
