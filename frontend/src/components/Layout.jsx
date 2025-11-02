import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/global.css"; // All layout styles are handled here

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      {/* 🌿 Navbar always on top */}
      <Navbar />

      {/* 🌿 Main content area */}
      <main className="layout-content">{children}</main>

      {/* 🌿 Footer always at bottom */}
      <Footer />
    </div>
  );
};

export default Layout;
