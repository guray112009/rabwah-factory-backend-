import React, { useState } from "react";
import "../styles/Login.css";
import logo from "../assets/images/RabwahGroup.png";
import Layout from "../components/Layout";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/index";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

      // ✅ Save token & user info
      localStorage.setItem("rabwah_token", token);
      localStorage.setItem("rabwah_user", JSON.stringify(user));
      localStorage.setItem("rabwah_token_time", Date.now().toString());

      alert("✅ Login successful!");

      // ✅ Redirect based on role (case-insensitive)
      const role = user.role?.toLowerCase();
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "manager") {
        navigate("/manager");
      } else if (role === "staff") {
        navigate("/staff");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      alert(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="login-page">
        <div className="login-container">
          <img src={logo} alt="Rabwah Logo" className="login-logo" />
          <h1>Welcome Back</h1>
          <p className="login-subtext">Sign in to access your Rabwah dashboard</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="forgot-link">
            <Link to="/forgot-password">Forgot your password?</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
