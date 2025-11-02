import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/images/RabwahGroup.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Load user & handle scroll
  useEffect(() => {
    const storedUser = localStorage.getItem("rabwah_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("rabwah_user");
      }
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const userRole = user?.role?.toLowerCase();

  // ✅ Fixed Logout — redirect to home (not /login)
  const handleLogout = () => {
    // Clear storage safely
    localStorage.removeItem("rabwah_user");
    localStorage.removeItem("rabwah_token");
    sessionStorage.clear();

    // Optional friendly message
    alert("👋 You have been logged out successfully!");

    // Redirect home (works on Hostinger)
    navigate("/");
    window.location.reload(); // ensures UI resets cleanly
  };

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-left">
        <img src={logo} alt="Rabwah Logo" className="logo" />
        <span className="brand-name">Rabwah Bags</span>
      </div>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
          Home
        </Link>
        <Link
          to="/about"
          className={location.pathname === "/about" ? "active" : ""}
        >
          About
        </Link>
        <Link
          to="/products"
          className={location.pathname === "/products" ? "active" : ""}
        >
          Products
        </Link>
        <Link
          to="/contact"
          className={location.pathname === "/contact" ? "active" : ""}
        >
          Contact
        </Link>
        <Link
          to="/careers"
          className={location.pathname === "/careers" ? "active" : ""}
        >
          Careers
        </Link>

        {/* ✅ Role-based Dashboards */}
        {userRole === "admin" || userRole === "administrator" ? (
          <Link
            to="/admin"
            className={location.pathname === "/admin" ? "active" : ""}
          >
            Dashboard
          </Link>
        ) : userRole === "manager" ? (
          <Link
            to="/manager"
            className={location.pathname === "/manager" ? "active" : ""}
          >
            Manager Dashboard
          </Link>
        ) : userRole === "staff" ? (
          <Link
            to="/staff"
            className={location.pathname === "/staff" ? "active" : ""}
          >
            Staff Dashboard
          </Link>
        ) : userRole === "customer" ? (
          <Link
            to="/customer"
            className={location.pathname === "/customer" ? "active" : ""}
          >
            🛍️ My Account
          </Link>
        ) : null}

        {/* ✅ Login / Logout section */}
        {!user ? (
          <Link to="/login" className="login-btn">
            Login
          </Link>
        ) : (
          <div className="navbar-user">
            <span className="welcome-text">
              👋 Welcome, <strong>{user.fullName?.split(" ")[0]}</strong>
              <br />
              <small style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                {user.role}
              </small>
            </span>
            <button onClick={handleLogout} className="login-btn logout-btn">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
