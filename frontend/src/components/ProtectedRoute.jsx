// ✅ src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("rabwah_token");
  const user = JSON.parse(localStorage.getItem("rabwah_user") || "{}");

  if (!token) {
    alert("⚠️ Please login first.");
    return <Navigate to="/login" replace />;
  }

  // If role is restricted (e.g., admin only)
  if (requiredRole && user.position && user.position !== requiredRole) {
    alert("🚫 Access denied. You are not authorized to view this page.");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
