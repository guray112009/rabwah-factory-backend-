import React from "react";
import Layout from "../components/Layout";
import "../styles/Contact.css";
import {
  FaFacebook,
  FaInstagram,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Contact = () => {
  return (
    <Layout>
      <section className="contact-page">
        <div className="contact-container">
          <h1>Contact Us</h1>
          <p>
            We’d love to hear from you! Whether you’re a customer, partner, or
            interested in eco-friendly collaboration, get in touch below.
          </p>

          <div className="contact-content">
            {/* 🌿 Contact Info */}
            <div className="contact-info">
              <h2>Get In Touch</h2>
              <p>
                <FaEnvelope className="icon" />{" "}
                <strong>Email:</strong> support@rabwahbags.com
              </p>
              <p>
                <FaPhoneAlt className="icon" /> <strong>Phone:</strong>{" "}
                +252 63 555 8899
              </p>
              <p>
                <FaMapMarkerAlt className="icon" />{" "}
                <strong>Address:</strong> Industrial Zone, Hargeisa, Somaliland
              </p>

              <div className="social-links">
                <a href="#" className="facebook" aria-label="Facebook">
                  <FaFacebook />
                </a>
                <a href="#" className="instagram" aria-label="Instagram">
                  <FaInstagram />
                </a>
              </div>
            </div>

            {/* ✉️ Contact Form */}
            <div className="contact-form">
              <h2>Send Us a Message</h2>
              <form>
                <input type="text" placeholder="Your Name" required />
                <input type="email" placeholder="Your Email" required />
                <textarea
                  placeholder="Your Message"
                  rows="5"
                  required
                ></textarea>
                <button type="submit" className="send-btn">
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* 🗺️ Google Map Section */}
          <div className="map-section">
            <h2>Find Us on the Map</h2>
            <iframe
              title="Rabwah Bags Factory Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.441554089078!2d44.061142674474205!3d9.563593991218318!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3d6aab8a5b2b2a71%3A0x9b07f2b402f9bdb3!2sHargeisa%2C%20Somaliland!5e0!3m2!1sen!2sso!4v1730000000000!5m2!1sen!2sso"
              width="100%"
              height="400"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
