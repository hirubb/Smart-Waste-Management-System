// src/components/Header.js
import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import Colors from "../constants/colors";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  return (
    <header
      style={{
        backgroundColor: Colors.header,
        color: "#fff",
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* Logo */}
      <div style={{ flex: 1 }}>
        <Link
          to="/"
          style={{
            color: "#fff",
            textDecoration: "none",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          WasteWise
        </Link>
      </div>

      {/* Desktop Navigation - centered */}
      <nav
        className="desktop-nav"
        style={{
          flex: 2,
          display: "flex",
          justifyContent: "center", // center the nav items
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        <Link to="/home" style={{ color: "#fff", textDecoration: "none" }}>
          Dashboard
        </Link>
        <a href="#features" style={{ color: "#fff", textDecoration: "none" }}>
          Schedule Collection
        </a>
        {user && (
          <Link to="/dashboard" style={{ color: "#fff", textDecoration: "none" }}>
            Availability & Fees
          </Link>
        )}
        <a href="#contact" style={{ color: "#fff", textDecoration: "none" }}>
          Payment
        </a>
        <a href="#contact" style={{ color: "#fff", textDecoration: "none" }}>
          Confirmation
        </a>
      </nav>

      {/* User/Login */}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
        {user ? (
          <button
            onClick={logout}
            style={{
              backgroundColor: Colors.error,
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "0.4rem 1rem",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            style={{
              backgroundColor: Colors.primaryButton,
              color: "#fff",
              textDecoration: "none",
              padding: "0.4rem 1rem",
              borderRadius: "6px",
            }}
          >
            Login
          </Link>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="mobile-menu-btn"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={{
          display: "none",
          backgroundColor: "transparent",
          border: "none",
          color: "#fff",
          fontSize: "1.5rem",
          cursor: "pointer",
        }}
      >
        ☰
      </button>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div
          className="mobile-nav"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            backgroundColor: Colors.header,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem 0",
          }}
        >
          <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
            Home
          </Link>
          <a href="#features" style={{ color: "#fff", textDecoration: "none" }}>
            Features
          </a>
          {user && (
            <Link to="/dashboard" style={{ color: "#fff", textDecoration: "none" }}>
              Dashboard
            </Link>
          )}
          <a href="#contact" style={{ color: "#fff", textDecoration: "none" }}>
            Contact
          </a>
          {user ? (
            <button
              onClick={logout}
              style={{
                backgroundColor: Colors.error,
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "0.4rem 1rem",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              style={{
                backgroundColor: Colors.primaryButton,
                color: "#fff",
                textDecoration: "none",
                padding: "0.4rem 1rem",
                borderRadius: "6px",
              }}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
