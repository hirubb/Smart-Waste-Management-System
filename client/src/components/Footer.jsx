// src/components/Footer.js
import React from "react";
import Colors from "../constants/colors";
import "../App.css";

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: Colors.header,
        color: "#fff",
        padding: "2rem",
        marginTop: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "2rem",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h4 style={{ marginBottom: "0.5rem" }}>Quick Links</h4>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li>
              <a href="/home" style={{ color: "#fff", textDecoration: "none" }}>
                Home
              </a>
            </li>
            <li>
              <a href="#features" style={{ color: "#fff", textDecoration: "none" }}>
                Features
              </a>
            </li>
            <li>
              <a href="/login" style={{ color: "#fff", textDecoration: "none" }}>
                Login
              </a>
            </li>
            <li>
              <a href="/register" style={{ color: "#fff", textDecoration: "none" }}>
                Register
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ marginBottom: "0.5rem" }}>Contact Us</h4>
          <p>Email: support@smartwaste.com</p>
          <p>Phone: +94 77 123 4567</p>
          <p>Address: Colombo, Sri Lanka</p>
        </div>

        <div>
          <h4 style={{ marginBottom: "0.5rem" }}>Follow Us</h4>
          <div style={{ display: "flex", gap: "1rem" }}>
            <a href="https://facebook.com" style={{ color: "#fff" }}>Facebook</a>
            <a href="https://twitter.com" style={{ color: "#fff" }}>Twitter</a>
            <a href="https://linkedin.com" style={{ color: "#fff" }}>LinkedIn</a>
          </div>
        </div>
      </div>

      <p style={{ fontSize: "0.85rem", textAlign: "center", marginTop: "1rem" }}>
        © 2025 Smart Waste Management System. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
