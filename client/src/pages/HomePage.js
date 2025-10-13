import React from "react";
import Colors from "../constants/colors";
import "../App.css";

const features = [
  {
    title: "Track Your Waste",
    description:
      "Monitor waste levels with smart digital tracking devices installed in bins.",
  },
  {
    title: "Schedule Collection",
    description:
      "Easily schedule special waste pickups for bulky or hazardous items.",
  },
  {
    title: "Flexible Billing",
    description:
      "Choose between weight-based or flat-rate billing for waste collection.",
  },
  {
    title: "Data Analytics",
    description:
      "Authorities can optimize routes and plan resources efficiently.",
  },
];

const HomePage = () => {
  return (
    <div
      style={{ backgroundColor: Colors.background, minHeight: "100vh" }}
    >
      {/* Hero Section */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "4rem 2rem",
          backgroundColor: Colors.primaryButton + "20", // light transparency
        }}
      >
        <h2 style={{ color: Colors.textPrimary, fontSize: "2.5rem" }}>
          Efficient Waste Management for Smart Cities
        </h2>
        <p style={{ color: Colors.textSecondary, fontSize: "1.2rem", maxWidth: "600px", margin: "1rem 0" }}>
          Monitor, track, and schedule waste collection with our digital solutions.
        </p>
        <button
          style={{
            backgroundColor: Colors.primaryButton,
            color: "#fff",
            padding: "0.8rem 2rem",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            cursor: "pointer",
            marginTop: "1rem",
          }}
        >
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section
        id="features"
        style={{
          padding: "4rem 2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "2rem",
        }}
      >
        {features.map((feature, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: Colors.card,
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "transform 0.2s",
            }}
            className="feature-card"
          >
            <h3 style={{ color: Colors.textPrimary }}>{feature.title}</h3>
            <p style={{ color: Colors.textSecondary }}>{feature.description}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer
        id="contact"
        style={{
          backgroundColor: Colors.header,
          color: "#fff",
          textAlign: "center",
          padding: "2rem",
          marginTop: "auto",
        }}
      >
        <p>© 2025 Smart Waste Management System</p>
      </footer>
    </div>
  );
};

export default HomePage;
