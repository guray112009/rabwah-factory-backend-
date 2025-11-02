import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import "../styles/Home.css";
import { Link } from "react-router-dom";


// 🌿 Hero background images
import bg1 from "../assets/images/bag-workers.webp";
import bg2 from "../assets/images/eco-bags-display.jpg";
import bg3 from "../assets/images/green-leaf-bg.jpg";
import bg4 from "../assets/images/sunrise-nature-bg.jpg";

// 👜 Product images
import dcutBag from "../assets/images/dcut-bag.jpg";
import tshirtBag from "../assets/images/tshirt-bag.webp";
import loopHandleBag from "../assets/images/loop-handle-bag.jpg";
import ecoBag from "../assets/images/eco-bag.png";
import ucutBag from "../assets/images/ucut-bag.jpg";
import wcutBag from "../assets/images/wcut-bag.jpg";

// 🌱 Icons (inside your /assets/images folder)
import ecoIcon from "../assets/images/eco-friendly.png";
import recycleIcon from "../assets/images/recycle.png";
import biodegradableIcon from "../assets/images/biodegradable.png";
import qualityIcon from "../assets/images/quality.png";
import trustIcon from "../assets/images/trusted.png";

const Home = () => {
  const heroImages = [bg1, bg2, bg3, bg4];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ecoTextIndex, setEcoTextIndex] = useState(0);

  const ecoMessages = ["Sustainability", "Innovation", "Quality"];

  // 🌿 Rotate hero background
  useEffect(() => {
    const bgInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 7000);
    return () => clearInterval(bgInterval);
  }, [heroImages.length]);

  // 🌿 Rotate eco tagline
  useEffect(() => {
    const textInterval = setInterval(() => {
      setEcoTextIndex((prev) => (prev + 1) % ecoMessages.length);
    }, 3000);
    return () => clearInterval(textInterval);
  }, [ecoMessages.length]);

  return (
    <Layout>
      {/* 🌿 Hero Section */}
      <section
        className="hero"
        style={{
          backgroundImage: `url(${heroImages[currentIndex]})`,
        }}
      >
        <div className="hero-overlay">
          <h1>Welcome to Rabwah Bags</h1>
          <p className="eco-message">{ecoMessages[ecoTextIndex]}</p>
          <p>
            Eco-friendly, durable, and stylish non-woven bags designed for a
            sustainable future.
          </p>
          <Link to="/products" className="shop-btn">
            Explore Our Products
          </Link>
        </div>
      </section>

      {/* 👜 Product Preview Section */}
      <section className="products-preview">
        <h2>Our Bag Collections</h2>
        <div className="bag-grid">
          <Link to="/products" className="bag-card">
            <img src={dcutBag} alt="D-Cut Bag" />
            <h3>D-Cut Bag</h3>
          </Link>
          <Link to="/products" className="bag-card">
            <img src={tshirtBag} alt="T-Shirt Bag" />
            <h3>T-Shirt Bag</h3>
          </Link>
          <Link to="/products" className="bag-card">
            <img src={loopHandleBag} alt="Loop Handle Bag" />
            <h3>Loop Handle Bag</h3>
          </Link>
          <Link to="/products" className="bag-card">
            <img src={ecoBag} alt="Eco Bag" />
            <h3>Eco Bag</h3>
          </Link>
          <Link to="/products" className="bag-card">
            <img src={ucutBag} alt="U-Cut Bag" />
            <h3>U-Cut Bag</h3>
          </Link>
          <Link to="/products" className="bag-card">
            <img src={wcutBag} alt="W-Cut Bag" />
            <h3>W-Cut Bag</h3>
          </Link>
        </div>
      </section>

      {/* 🏭 About Factory Section */}
      <section className="about-factory">
        <div className="about-container">
          <h2>About Rabwah Factory</h2>
          <p>
            Established in <strong>2025</strong>, Rabwah Bags Factory is a
            proudly local Somaliland company based in{" "}
            <strong>Hargeisa, the capital city</strong>. Our mission is to
            reduce plastic waste and promote sustainable alternatives through
            non-woven, eco-friendly bag production.
          </p>
          <p>
            Our team produces over <strong>10,000 high-quality bags monthly</strong>,
            trusted by markets, hospitals, schools, and businesses across the
            region. Every Rabwah Bag is a step toward a cleaner, greener, and
            more sustainable future.
          </p>
          <Link to="/about" className="learn-more-btn">
            Learn More About Us
          </Link>
        </div>
      </section>

      {/* 🌍 Trust Section */}
      <section className="trust-section">
        <h2>Why Choose Rabwah Bags?</h2>
        <p>
          We are committed to sustainability, high quality, and eco-friendly
          innovation. Every bag we make is a step towards a cleaner, greener
          planet.
        </p>

        <div className="trust-icons">
          <div className="trust-card">
            <img src={ecoIcon} alt="Eco Friendly" />
            <h3>Eco Friendly</h3>
            <p>Made from recyclable, non-toxic materials.</p>
          </div>

          <div className="trust-card">
            <img src={recycleIcon} alt="Recyclable" />
            <h3>100% Recyclable</h3>
            <p>Designed to be reused and recycled responsibly.</p>
          </div>

          <div className="trust-card">
            <img src={biodegradableIcon} alt="Biodegradable" />
            <h3>Biodegradable</h3>
            <p>Our bags naturally decompose and protect nature.</p>
          </div>

          <div className="trust-card">
            <img src={qualityIcon} alt="Quality" />
            <h3>Premium Quality</h3>
            <p>Durable, strong, and perfect for all purposes.</p>
          </div>

          <div className="trust-card">
            <img src={trustIcon} alt="Trusted Brand" />
            <h3>Trusted Brand</h3>
            <p>Thousands of satisfied customers across Somaliland.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
