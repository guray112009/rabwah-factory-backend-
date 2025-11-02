import React, { useState } from "react";
import Layout from "../components/Layout";
import "../styles/Careers.css";
import careerImg from "../assets/images/bag-workers.webp";

const Careers = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `✅ Thank you, ${formData.name}! Your application for "${formData.position}" has been received. (Backend integration coming soon.)`
    );
    setFormData({ name: "", email: "", position: "", message: "" });
  };

  const jobs = [
    {
      title: "Factory Operator",
      type: "Full-Time",
      location: "Hargeisa, Somaliland",
      desc: "Assist in daily production of non-woven bags, maintain quality control, and ensure eco-friendly standards are met.",
    },
    {
      title: "Sales & Customer Assistant",
      type: "Full-Time",
      location: "Hargeisa Office",
      desc: "Engage customers, manage orders, and build relationships with retail and wholesale clients.",
    },
    {
      title: "Machine Maintenance Technician",
      type: "Full-Time",
      location: "Rabwah Factory",
      desc: "Maintain and troubleshoot production machinery to ensure continuous operation and safety compliance.",
    },
  ];

  return (
    <Layout>
      {/* 🌿 Hero Section */}
      <section
        className="careers-hero"
        style={{ backgroundImage: `url(${careerImg})` }}
      >
        <div className="hero-overlay">
          <h1>Join the Rabwah Family</h1>
          <p>
            Be part of a green movement in <strong>Hargeisa, Somaliland</strong> — where innovation, sustainability, and opportunity come together.
          </p>
        </div>
      </section>

      {/* 💼 Job Openings Section */}
      <section className="careers-jobs">
        <h2>💼 Current Job Openings</h2>
        <div className="job-list">
          {jobs.map((job, index) => (
            <div className="job-card" key={index}>
              <h3>{job.title}</h3>
              <p className="job-meta">
                📍 {job.location} | 🕓 {job.type}
              </p>
              <p className="job-desc">{job.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 📝 Application Form Section */}
      <section className="careers-form">
        <h2>📝 Apply Now</h2>
        <p>
          Fill in your details below and we’ll contact you if your profile matches our needs.
        </p>

        <form className="apply-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <select
            name="position"
            value={formData.position}
            onChange={handleChange}
            required
          >
            <option value="">Select a position</option>
            {jobs.map((job, index) => (
              <option key={index} value={job.title}>
                {job.title}
              </option>
            ))}
          </select>
          <textarea
            name="message"
            rows="4"
            placeholder="Tell us about yourself or share your experience..."
            value={formData.message}
            onChange={handleChange}
          ></textarea>

          <button type="submit" className="apply-btn">
            Submit Application
          </button>
        </form>
      </section>
    </Layout>
  );
};

export default Careers;
