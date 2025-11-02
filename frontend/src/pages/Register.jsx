import React, { useEffect, useState } from "react";
import "../styles/Register.css";
import logo from "../assets/images/RabwahGroup.png";
import api from "../api/index";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Staff",
  });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // 🌿 Load logged-in user info
  useEffect(() => {
    const user = localStorage.getItem("rabwah_user");
    if (user) {
      const parsed = JSON.parse(user);
      setCurrentUser(parsed);

      // ❌ Restrict access if not admin or manager
      if (parsed.role !== "Admin" && parsed.role !== "Manager") {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // 🧾 Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🧩 Handle register submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, password, confirmPassword, role } = formData;

    if (password !== confirmPassword) {
      return setMessage("⚠️ Passwords do not match!");
    }

    try {
      const res = await api.post("/users", {
        fullName,
        email,
        password,
        role,
      });

      setMessage(`✅ User "${fullName}" created successfully as ${role}.`);
      setSuccess(true);
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "Staff",
      });
    } catch (error) {
      console.error("Error creating user:", error);
      setMessage("❌ Failed to create user. Please try again.");
      setSuccess(false);
    }
  };

  // 🚫 While user is loading
  if (!currentUser) return null;

  return (
    <div className="register-page">
      <div className="register-container">
        <img src={logo} alt="Rabwah Logo" className="register-logo" />
        <h1>Create New User</h1>
        <p className="register-subtext">
          👑 Only <strong>Admins</strong> and <strong>Managers</strong> can add new users.
        </p>

        {message && (
          <div className={`register-alert ${success ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="role-select"
          >
            <option value="Staff">Staff</option>
            <option value="Customer">Customer</option>
            <option value="Manager">Manager</option>
          </select>

          <button type="submit" className="btn">
            Create Account
          </button>
        </form>

        <p className="notice">
          🏭 Rabwah user management — for authorized admins and managers only.
        </p>
      </div>
    </div>
  );
};

export default Register;
