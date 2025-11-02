import React from "react";
import { Link } from "react-router-dom"; // ✅ Import React Router Link
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import "../styles/Footer.css";
import factoryBg from "../assets/images/factory-bg.jpg";

const Footer = () => {
  return (
    <footer
      className="footer"
      style={{ backgroundImage: `url(${factoryBg})` }}
    >
      <div className="footer-overlay">
        {/* 🌿 Company Info */}
        <div className="footer-section">
          <h2>Rabwah Bags</h2>
          <p>
            High-quality, eco-friendly non-woven bags made with care in
            <strong> Hargeisa, Somaliland</strong>.
          </p>
          <div className="footer-contact">
            <p>
              <MapPin size={16} /> Hargeisa, Somaliland
            </p>
            <p>
              <Phone size={16} /> +252 63 123 4567
            </p>
            <p>
              <Mail size={16} /> info@rabwahbags.com
            </p>
          </div>
        </div>

        {/* 🌐 Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* 🌿 Social Media */}
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" title="Facebook">
              <Facebook size={22} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" title="Instagram">
              <Instagram size={22} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" title="LinkedIn">
              <Linkedin size={22} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" title="YouTube">
              <Youtube size={22} />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Rabwah Bags. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
