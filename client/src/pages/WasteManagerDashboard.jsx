/**
 * WasteManagerDashboard Component
 * 
 * Purpose: Dashboard interface for waste manager role
 * Responsibilities:
 * - Display waste manager's name and role
 * - Provide clean, minimal interface following existing design patterns
 * 
 * @component
 * @author Smart Waste Management System
 * @since 2025-10-15
 */

import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Colors from "../constants/colors";

/**
 * WasteManagerDashboard - Main dashboard for waste manager
 * Follows Open/Closed Principle: Open for extension (adding features), closed for modification
 */
const WasteManagerDashboard = () => {
  // Destructure user from AuthContext following Dependency Inversion Principle
  const { user } = useContext(AuthContext);

  return (
    <div 
      style={{ 
        backgroundColor: Colors.background, 
        minHeight: "100vh", 
        padding: "2rem" 
      }}
    >
      {/* Header Section */}
      <header
        style={{
          backgroundColor: Colors.header,
          color: "#fff",
          padding: "1.5rem 2rem",
          borderRadius: "12px",
          marginBottom: "2rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "2rem" }}>
          Waste Manager Dashboard
        </h1>
      </header>

      {/* Welcome Section */}
      <section
        style={{
          backgroundColor: Colors.card,
          padding: "3rem",
          borderRadius: "16px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          textAlign: "center",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: Colors.primaryButton,
            color: "#fff",
            padding: "1rem 2rem",
            borderRadius: "50px",
            marginBottom: "2rem",
            fontSize: "1rem",
            fontWeight: "600",
            letterSpacing: "0.5px",
          }}
        >
          Waste Manager
        </div>

        <h2 
          style={{ 
            color: Colors.textPrimary, 
            fontSize: "2.5rem", 
            marginBottom: "1rem",
            fontWeight: "700",
          }}
        >
          Welcome, {user?.name || "Waste Manager"}
        </h2>

        <p 
          style={{ 
            color: Colors.textSecondary, 
            fontSize: "1.2rem",
            lineHeight: "1.6",
          }}
        >
          Your dashboard is ready for management operations.
        </p>

        {/* Divider */}
        <div
          style={{
            width: "60px",
            height: "4px",
            backgroundColor: Colors.primaryButton,
            margin: "2rem auto",
            borderRadius: "2px",
          }}
        />

        {/* User Information Card */}
        <div
          style={{
            display: "inline-block",
            backgroundColor: Colors.background,
            padding: "1.5rem 3rem",
            borderRadius: "12px",
            marginTop: "1rem",
          }}
        >
          <p 
            style={{ 
              color: Colors.textSecondary, 
              fontSize: "0.9rem",
              marginBottom: "0.5rem",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Role
          </p>
          <p 
            style={{ 
              color: Colors.textPrimary, 
              fontSize: "1.4rem",
              fontWeight: "600",
              margin: 0,
            }}
          >
            {user?.role || "waste_manager"}
          </p>
        </div>
      </section>

      {/* Placeholder for Future Features */}
      <section
        style={{
          marginTop: "3rem",
          textAlign: "center",
          color: Colors.textSecondary,
          fontSize: "0.95rem",
        }}
      >
        <p>Additional features coming soon...</p>
      </section>
    </div>
  );
};

export default WasteManagerDashboard;
