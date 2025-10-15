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
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Colors from "../constants/colors";
import { FileText, BarChart3, Users, Map } from "lucide-react";

/**
 * WasteManagerDashboard - Main dashboard for waste manager
 * Follows Open/Closed Principle: Open for extension (adding features), closed for modification
 */
const WasteManagerDashboard = () => {
  // Destructure user from AuthContext following Dependency Inversion Principle
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  /**
   * Navigation handler for features
   * Follows Single Responsibility Principle
   */
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Available features for waste manager
  const features = [
    {
      title: "Monthly Reports",
      description: "Generate and view comprehensive waste collection reports",
      icon: <FileText size={40} />,
      path: "/monthly-reports",
      color: "#667eea"
    },
    {
      title: "Collection Analytics",
      description: "View waste collection trends and statistics",
      icon: <BarChart3 size={40} />,
      path: "/collection-summary",
      color: "#764ba2"
    },
    {
      title: "Collector Management",
      description: "Manage and monitor waste collectors",
      icon: <Users size={40} />,
      path: "/assign-collectors",
      color: "#17a2b8"
    },
    {
      title: "Route Optimization",
      description: "View and optimize collection routes",
      icon: <Map size={40} />,
      path: "/admin-routes",
      color: "#28a745"
    }
  ];

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
        }}
      >
        <h3 style={{ color: Colors.textPrimary, marginBottom: "1.5rem", textAlign: "center" }}>
          Management Tools
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            maxWidth: "1200px",
            margin: "0 auto"
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => handleNavigate(feature.path)}
              style={{
                backgroundColor: Colors.card,
                padding: "2rem",
                borderRadius: "16px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "transform 0.3s, box-shadow 0.3s",
                textAlign: "center",
                borderTop: `4px solid ${feature.color}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  padding: "1rem",
                  borderRadius: "50%",
                  backgroundColor: feature.color + "20",
                  color: feature.color,
                  marginBottom: "1rem"
                }}
              >
                {feature.icon}
              </div>
              <h4 style={{ color: Colors.textPrimary, marginBottom: "0.5rem", fontSize: "1.2rem" }}>
                {feature.title}
              </h4>
              <p style={{ color: Colors.textSecondary, fontSize: "0.95rem", lineHeight: "1.5" }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default WasteManagerDashboard;
