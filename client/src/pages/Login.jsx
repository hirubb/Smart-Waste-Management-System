import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Colors from "../constants/colors";
import "../App.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      nav("/dashboard");
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
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
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
