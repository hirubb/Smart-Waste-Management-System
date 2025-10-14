/**
 * Login Component
 * 
 * Purpose: User authentication interface
 * Responsibilities:
 * - Handle user login form
 * - Support both email and username authentication
 * - Redirect to appropriate dashboard based on role
 * 
 * @component
 * @author Smart Waste Management System
 * @since 2025-10-15
 */

import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Colors from "../constants/colors";
import "../App.css";

/**
 * Login Component
 * Supports authentication for all user types including waste manager
 */
const Login = () => {
  // Form state - supports both email and username
  const [form, setForm] = useState({ identifier: "", password: "" });
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  /**
   * Handles form submission
   * Routes user to appropriate dashboard based on role
   * 
   * @param {Event} e - Form submit event
   */
  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form.identifier, form.password);
      
      // Get user role from localStorage to determine redirect
      const role = localStorage.getItem("role");
      
      // Route based on role following Single Responsibility Principle
      if (role === "waste_manager") {
        nav("/waste-manager-dashboard");
      } else {
        nav("/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.background,
        padding: "2rem",
      }}
    >
      <div
        style={{
          backgroundColor: Colors.card,
          padding: "3rem",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: Colors.textPrimary, marginBottom: "1.5rem" }}>
          Login
        </h2>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column" }}>
          {/* Email or Username Input */}
          <input
            type="text"
            placeholder="Email or Username"
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            required
            style={{
              padding: "0.8rem 1rem",
              marginBottom: "1rem",
              borderRadius: "8px",
              border: `1px solid ${Colors.textSecondary}`,
              fontSize: "1rem",
              outline: "none",
              transition: "border 0.2s",
            }}
            onFocus={(e) => (e.target.style.border = `1px solid ${Colors.primaryButton}`)}
            onBlur={(e) => (e.target.style.border = `1px solid ${Colors.textSecondary}`)}
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            style={{
              padding: "0.8rem 1rem",
              marginBottom: "1.5rem",
              borderRadius: "8px",
              border: `1px solid ${Colors.textSecondary}`,
              fontSize: "1rem",
              outline: "none",
              transition: "border 0.2s",
            }}
            onFocus={(e) => (e.target.style.border = `1px solid ${Colors.primaryButton}`)}
            onBlur={(e) => (e.target.style.border = `1px solid ${Colors.textSecondary}`)}
          />

          <button
            type="submit"
            style={{
              backgroundColor: Colors.primaryButton,
              color: "#fff",
              padding: "0.8rem",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
              border: "none",
              transition: "background 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = Colors.secondaryButton)}
            onMouseLeave={(e) => (e.target.style.backgroundColor = Colors.primaryButton)}
          >
            Login
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", color: Colors.textSecondary }}>
          Don't have an account?{" "}
          <a href="/register" style={{ color: Colors.link, textDecoration: "none" }}>
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
