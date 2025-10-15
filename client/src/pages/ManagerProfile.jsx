import React, { useContext } from "react";
import Colors from "../constants/colors";
import "../App.css";
import { AuthContext } from "../context/AuthContext";

const ManagerProfile = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div style={{ backgroundColor: Colors.background, minHeight: "100vh" }}>
      {/* Profile Header */}
      <section
        style={{
          backgroundColor: Colors.primaryButton + "20",
          padding: "4rem 2rem",
          textAlign: "center",
        }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="Profile Avatar"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            border: `4px solid ${Colors.primaryButton}`,
            marginBottom: "1rem",
          }}
        />
        <h2 style={{ color: Colors.textPrimary, fontSize: "2rem" }}>
          {user ? user.name : "Manager Name"}
        </h2>
        <p style={{ color: Colors.textSecondary, fontSize: "1.1rem" }}>
          {user ? user.email : "manager@email.com"}
        </p>
        <p
          style={{
            color: Colors.textSecondary,
            backgroundColor: Colors.card,
            display: "inline-block",
            padding: "0.4rem 1rem",
            borderRadius: "8px",
            marginTop: "0.5rem",
          }}
        >
          Role: {user?.role || "Manager"}
        </p>
      </section>

      {/* Profile Details Section */}
      <section
        style={{
          padding: "4rem 2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
        }}
      >
        {/* Personal Info */}
        <div
          style={{
            backgroundColor: Colors.card,
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ color: Colors.textPrimary, marginBottom: "1rem" }}>
            Personal Information
          </h3>
          <p style={{ color: Colors.textSecondary }}>
            <strong>Name:</strong> {user?.name || "N/A"}
          </p>
          <p style={{ color: Colors.textSecondary }}>
            <strong>Email:</strong> {user?.email || "N/A"}
          </p>
          <p style={{ color: Colors.textSecondary }}>
            <strong>Contact:</strong> {user?.contact || "+94 77 123 4567"}
          </p>
          <p style={{ color: Colors.textSecondary }}>
            <strong>Address:</strong> {user?.address || "Colombo, Sri Lanka"}
          </p>
        </div>

        {/* System Overview */}
        <div
          style={{
            backgroundColor: Colors.card,
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ color: Colors.textPrimary, marginBottom: "1rem" }}>
            System Overview
          </h3>
          <p style={{ color: Colors.textSecondary }}>
            You have full administrative access to manage users, track waste
            collection, and oversee billing operations.
          </p>
          <button
            style={{
              backgroundColor: Colors.primaryButton,
              color: "#fff",
              padding: "0.8rem 1.5rem",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              cursor: "pointer",
              marginTop: "1.5rem",
            }}
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </section>
    </div>
  );
};

export default ManagerProfile;
