import React, { useState } from "react";
import Layout from "../components/Layout";
import "../styles/Products.css";

// 🌿 Product images
import dcutBag from "../assets/images/dcut-bag.jpg";
import tshirtBag from "../assets/images/tshirt-bag.webp";
import loopHandleBag from "../assets/images/loop-handle-bag.jpg";
import ecoBag from "../assets/images/eco-bag.png";
import ucutBag from "../assets/images/ucut-bag.jpg";
import wcutBag from "../assets/images/wcut-bag.jpg";

const Products = () => {
  const products = [
    {
      id: 1,
      name: "D-Cut Bag",
      image: dcutBag,
      desc:
        "Strong, stylish, and reusable non-woven D-Cut bags ideal for retail, events, and packaging.",
      features: [
        "Custom logo printing",
        "Eco-friendly fabric",
        "Soft-touch handle",
      ],
    },
    {
      id: 2,
      name: "T-Shirt Bag",
      image: tshirtBag,
      desc:
        "Lightweight yet durable, designed to replace single-use plastics for groceries or takeaway.",
      features: [
        "Tear-resistant stitching",
        "Multiple color options",
        "Washable & reusable",
      ],
    },
    {
      id: 3,
      name: "Loop Handle Bag",
      image: loopHandleBag,
      desc:
        "Elegant loop-handle bags that combine comfort, strength, and premium presentation.",
      features: [
        "Soft handles",
        "Matte or glossy finish",
        "Fully customizable",
      ],
    },
    {
      id: 4,
      name: "Eco Bag",
      image: ecoBag,
      desc:
        "Rabwah’s eco bag made with non-woven biodegradable material — sustainable and strong.",
      features: [
        "Eco-certified material",
        "Reusable 50+ times",
        "Available in natural shades",
      ],
    },
    {
      id: 5,
      name: "U-Cut Bag",
      image: ucutBag,
      desc:
        "Simple and cost-effective U-Cut bags, ideal for supermarkets and daily retail use.",
      features: [
        "Reusable design",
        "Flexible U-cut handle",
        "10 kg carrying capacity",
      ],
    },
    {
      id: 6,
      name: "W-Cut Bag",
      image: wcutBag,
      desc:
        "W-Cut bags blend comfort with strength — perfect for takeaway and promotions.",
      features: [
        "Modern ergonomic grip",
        "Custom GSM thickness",
        "Logo branding supported",
      ],
    },
  ];

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    quantity: "",
    message: "",
  });

  const openModal = (product) => {
    setSelectedProduct(product);
    setShowForm(false);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setShowForm(false);
    setFormData({ name: "", email: "", quantity: "", message: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    alert(
      `✅ Thank you, ${formData.name}! Your quote request for "${selectedProduct.name}" has been sent successfully. (Backend integration coming soon.)`
    );
    closeModal();
  };

  return (
    <Layout>
      {/* 🌿 Hero Banner */}
      <section className="products-hero">
        <div className="hero-content">
          <h1>Our Products</h1>
          <p>
            Discover Rabwah’s premium non-woven bags — designed for durability,
            elegance, and sustainability. Crafted with care for businesses that
            value the planet.
          </p>
        </div>
      </section>

      {/* 👜 Product Grid */}
      <section className="products-gallery">
        <div className="product-grid">
          {products.map((product) => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => openModal(product)}
            >
              <img src={product.image} alt={product.name} />
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🌿 Product Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn" onClick={closeModal}>
              ✕
            </button>

            {!showForm ? (
              <>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="modal-image"
                />
                <h2>{selectedProduct.name}</h2>
                <p className="modal-desc">{selectedProduct.desc}</p>

                <ul className="feature-list">
                  {selectedProduct.features.map((f, idx) => (
                    <li key={idx}>✅ {f}</li>
                  ))}
                </ul>

                <button
                  className="quote-btn"
                  onClick={() => setShowForm(true)}
                >
                  Request Quote
                </button>
              </>
            ) : (
              <>
                <h2>Request a Quote</h2>
                <p className="modal-desc">
                  Please fill out the form below and we’ll contact you soon.
                </p>
                <form className="quote-form" onSubmit={handleQuoteSubmit}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="number"
                    name="quantity"
                    placeholder="Quantity (e.g., 500 pcs)"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                  <textarea
                    name="message"
                    rows="4"
                    placeholder="Additional details..."
                    value={formData.message}
                    onChange={handleInputChange}
                  ></textarea>
                  <button type="submit" className="quote-btn">
                    Send Request
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Products;
