import React from "react";
import "../styles/ForgotPassword.css";
import logo from "../assets/images/RabwahGroup.png";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  return (
    <Layout>
      <div className="forgot-page">
        <div className="forgot-container">
          <img src={logo} alt="Rabwah Logo" className="forgot-logo" />
          <h1>Forgot Password</h1>
          <p className="forgot-subtext">
            Enter your registered email, and we’ll send a reset link once backend is connected.
          </p>

          <form className="forgot-form">
            <input type="email" placeholder="Enter your email" required />
            <button type="button" className="btn" disabled>
              Send Reset Link (Disabled)
            </button>
          </form>

          <p className="info-text">
            ⚠️ Password recovery is currently disabled until backend integration.
          </p>

          <p className="back-login">
            <Link to="/login">← Back to Login</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
