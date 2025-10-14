import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Colors from "../constants/colors";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Feature click handlers
  const handleFeatureClick = (feature) => {
    if (feature === "View bin alerts") {
      navigate("/alert-management");
    } else if (feature === "Schedule special collection") {
      navigate("/special");
    }
    // Add more navigation handlers as needed
  };

  // Features per role
  const roleFeatures = {
    resident: [
      "Schedule special collection",
      "View bin alerts",
      "Track your waste generation",
    ],
    business: [
      "Business-specific dashboard",
      "Manage multiple waste bins",
      "Generate waste reports",
    ],
    collector: [
      "View assigned routes",
      "Update collection status",
      "Access route history",
    ],
    wma_admin: [
      "Optimize collection routes",
      "View reports and analytics",
      "Manage users and collectors",
    ],
  };

  return (
    <div style={{ backgroundColor: Colors.background, minHeight: "100vh", padding: "2rem" }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: Colors.header,
          color: "#fff",
          padding: "1rem 2rem",
          borderRadius: "12px",
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Dashboard</h1>
        
      </header>

      {/* Welcome Section */}
      <section
        style={{
          textAlign: "center",
          marginBottom: "3rem",
        }}
      >
        <h2 style={{ color: Colors.textPrimary, fontSize: "2rem", marginBottom: "0.5rem" }}>
          Welcome, {user?.name}
        </h2>
        <p style={{ color: Colors.textSecondary, fontSize: "1.1rem" }}>
          Role: <strong>{user?.role}</strong>
        </p>
      </section>

      {/* Features Section */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {roleFeatures[user?.role]?.map((feature, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: Colors.card,
              padding: "1.8rem",
              borderRadius: "16px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
              textAlign: "center",
              transition: "transform 0.2s",
              cursor: "pointer",
            }}
            className="feature-card"
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            onClick={() => handleFeatureClick(feature)}
          >
            <h3 style={{ color: Colors.textPrimary, marginBottom: "0.5rem" }}>{feature}</h3>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Dashboard;
