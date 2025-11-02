import React from "react";
import Layout from "../components/Layout";
import "../styles/About.css";

// 🌿 Import images
import teamImage from "../assets/images/bag-workers.webp";
import ecoDisplay from "../assets/images/eco-bags-display.jpg";
import greenLeaf from "../assets/images/green-leaf-bg.jpg";
import founder from "../assets/images/founder.webp"; // 🧑 Replace with real image
import manager from "../assets/images/manager.jpg"; // 🧑 Replace with real image
import marketing from "../assets/images/marketing.jpeg"; // 🧑 Replace with real image

const About = () => {
  return (
    <Layout>
      {/* 🌿 Hero Section */}
      <section
        className="about-hero"
        style={{ backgroundImage: `url(${greenLeaf})` }}
      >
        <div className="hero-overlay">
          <h1>About Rabwah Bags</h1>
          <p>
            Proudly based in <strong>Hargeisa, Somaliland</strong>, Rabwah Bags
            is leading the change toward sustainable, non-woven bag production
            across East Africa.
          </p>
        </div>
      </section>

      {/* 🌍 Our Story Section */}
      <section className="about-content">
        <div className="about-text">
          <h2>🌿 Who We Are</h2>
          <p>
            Rabwah Bags is an environmentally conscious manufacturing company
            producing high-quality, durable, and elegant non-woven bags.
            Our mission is simple — to reduce plastic waste and offer businesses
            eco-friendly packaging alternatives that are both stylish and sustainable.
          </p>
          <p>
            Located in the heart of <strong>Hargeisa, Somaliland</strong>, our
            factory employs skilled local professionals who are passionate about
            innovation, sustainability, and community development.
          </p>
        </div>
        <img src={teamImage} alt="Rabwah Bag Workers" className="about-image" />
      </section>

      {/* ♻️ Our Mission Section */}
      <section className="about-values">
        <h2>♻️ Our Mission</h2>
        <p>
          To empower communities and businesses by providing eco-friendly
          non-woven products that help protect our environment for generations to come.
        </p>
        <div className="value-grid">
          <div className="value-card">
            <h3>🌱 Sustainability</h3>
            <p>
              Every bag we produce replaces hundreds of plastic ones. We’re proud
              to create long-lasting impact through environmentally responsible practices.
            </p>
          </div>
          <div className="value-card">
            <h3>🤝 Community</h3>
            <p>
              Rabwah Bags supports local employment, empowering men and women
              with skills in manufacturing, quality control, and logistics.
            </p>
          </div>
          <div className="value-card">
            <h3>🏭 Innovation</h3>
            <p>
              We continuously invest in better production technologies and materials
              to maintain top-tier quality and modern design standards.
            </p>
          </div>
        </div>
      </section>

      {/* 🕒 Company Journey / Timeline */}
      <section className="about-timeline">
        <h2>🏆 Our Journey</h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>2025 — Founded in Hargeisa, Somaliland 🇸🇴</h3>
              <p>
                Rabwah Bags officially launched with a clear mission — to create
                eco-friendly, reusable non-woven bags that reduce plastic waste and
                promote a cleaner future.
              </p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>2026 — Local Impact & Job Creation</h3>
              <p>
                Expanded production capacity and hired local staff, empowering
                the Hargeisa community and boosting green job opportunities.
              </p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>2027 — Regional Growth</h3>
              <p>
                Started exporting eco bags to neighboring East African countries,
                strengthening Rabwah’s reputation for quality and sustainability.
              </p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>2028 — Eco Innovation Center</h3>
              <p>
                Plan to establish a dedicated innovation unit for new materials
                and green packaging designs — paving the way for a circular economy in Somaliland.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 👥 Leadership Team Section */}
      <section className="about-team">
        <h2>👥 Our Leadership Team</h2>
        <p className="team-intro">
          Behind Rabwah Bags is a dedicated team of professionals passionate about sustainability,
          innovation, and empowering the local community.
        </p>

        <div className="team-grid">
          <div className="team-member">
            <img src={founder} alt="Founder" />
            <h3>Saharla Cabdirahman</h3>
            <p className="role">Founder & CEO</p>
            <p>
              Visionary leader with a mission to transform Somaliland’s packaging
              industry into an eco-conscious global example.
            </p>
          </div>

          <div className="team-member">
            <img src={manager} alt="Production Manager" />
            <h3>Mahad Mustafe</h3>
            <p className="role">Production Manager</p>
            <p>
              Oversees daily operations, ensuring that every Rabwah Bag meets
              our strict quality and sustainability standards.
            </p>
          </div>

          <div className="team-member">
            <img src={marketing} alt="Marketing Head" />
            <h3>Mohamed Ahmed</h3>
            <p className="role">Marketing & Partnerships</p>
            <p>
              Focuses on building lasting business relationships and raising
              awareness about eco-friendly packaging across the region.
            </p>
          </div>
        </div>
      </section>

      {/* 💚 Our Products Preview */}
      <section className="about-gallery">
        <h2>Our Factory & Eco Collections</h2>
        <div className="gallery-grid">
          <img src={ecoDisplay} alt="Eco Bags Display" />
          <img src={teamImage} alt="Rabwah Factory Team" />
        </div>
      </section>

      {/* 🌍 Contact CTA */}
      <section className="about-cta">
        <h2>Join Our Green Journey</h2>
        <p>
          Together, we can make Somaliland and the world a cleaner, greener place.
          Get in touch with us today to explore partnership and custom branding opportunities.
        </p>
        <a href="/contact" className="cta-btn">
          Contact Us
        </a>
      </section>
    </Layout>
  );
};

export default About;
