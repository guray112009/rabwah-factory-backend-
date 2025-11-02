import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// 🌿 Import Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Careers from "./pages/Careers";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard.jsx";
import StaffDashboard from "./pages/StaffDashboard.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx"; // ✅ newly added

// 🛡️ ProtectedRoute wrapper
import ProtectedRoute from "./components/ProtectedRoute";

const MainRouter = () => {
  return (
    <Router>
      <Routes>
        {/* 🏠 Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/careers" element={<Careers />} />

        {/* 👨‍💼 Manager Dashboard */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute requiredRole="Manager">
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        {/* 🧑‍💼 Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 👷 Staff Dashboard */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute requiredRole="Staff">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* 👤 Customer Dashboard — NEW ✅ */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute requiredRole="Customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* 🚫 Unknown Paths → Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default MainRouter;
