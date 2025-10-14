import React, { useEffect, useState } from "react";
import {
  User,
  Users,
  Trash2,
  CheckCircle,
  Clock,
} from "lucide-react";
import API from "../services/api";
import Colors from "../constants/colors";
import "../App.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCollectors: 0,
    totalCollections: 0,
    completedCollections: 0,
  });

  const [recentCollections, setRecentCollections] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersRes = await API.get("/auth/users");
        const collectorsRes = await API.get("/auth/collectors");
        const collectionsRes = await API.get("/collections");

        const collectionsData = Array.isArray(collectionsRes.data)
          ? collectionsRes.data
          : [];

        setStats({
          totalUsers: Array.isArray(usersRes.data) ? usersRes.data.length : 0,
          totalCollectors: Array.isArray(collectorsRes.data.collectors)
            ? collectorsRes.data.collectors.length
            : 0,
          totalCollections: collectionsData.length,
          completedCollections: collectionsData.filter(
            (c) => c.status === "completed"
          ).length,
        });

        setRecentCollections(collectionsData.slice(-5).reverse());
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <User size={24} color="#fff" />,
      color: "#667eea",
      textColor: "#fff",
    },
    {
      title: "Total Collectors",
      value: stats.totalCollectors,
      icon: <Users size={24} color="#fff" />,
      color: "#764ba2",
      textColor: "#fff",
    },
    {
      title: "Total Collections",
      value: stats.totalCollections,
      icon: <Trash2 size={24} color="#fff" />,
      color: "#17a2b8",
      textColor: "#fff",
    },
    {
      title: "Completed Collections",
      value: stats.completedCollections,
      icon: <CheckCircle size={24} color="#fff" />,
      color: "#28a745",
      textColor: "#fff",
    },
  ];

  return (
    <div style={{ backgroundColor: Colors.background, minHeight: "100vh" }}>
      {/* Hero Section */}
      <section
        style={{
          textAlign: "center",
          padding: "4rem 2rem",
          background: `linear-gradient(135deg, ${Colors.primaryButton}80, ${Colors.primaryButton})`,
          color: "#fff",
        }}
      >
        <h2 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          Admin Dashboard
        </h2>
        <p style={{ fontSize: "1.2rem", opacity: 0.9 }}>
          Monitor users, collectors, and waste collection activities
        </p>
      </section>

      {/* Stats Cards */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "2rem",
        }}
      >
        {statCards.map((card, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "2rem",
              borderRadius: "12px",
              background: card.color,
              color: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "transform 0.2s",
              cursor: "default",
            }}
            className="feature-card"
          >
            <div style={{ marginRight: "1rem" }}>{card.icon}</div>
            <div>
              <h4 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600,color: card.textColor }}>
                {card.value}
              </h4>
              <p style={{ margin: 0, opacity: 0.9,color: card.textColor }}>{card.title}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Recent Collections Table */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "2rem auto",
          padding: "2rem",
          backgroundColor: Colors.card,
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ marginBottom: "1rem" }}>Recent Collection Requests</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: `2px solid ${Colors.border}` }}>
              <th style={{ padding: "0.75rem" }}>User</th>
              <th style={{ padding: "0.75rem" }}>Waste Type</th>
              <th style={{ padding: "0.75rem" }}>Status</th>
              <th style={{ padding: "0.75rem" }}>Scheduled Date</th>
            </tr>
          </thead>
          <tbody>
            {recentCollections.map((col) => (
              <tr key={col._id} style={{ borderBottom: `1px solid ${Colors.border}` }}>
                <td style={{ padding: "0.75rem" }}>{col.userId?.name || "N/A"}</td>
                <td style={{ padding: "0.75rem" }}>{col.wasteCategory}</td>
                <td style={{ padding: "0.75rem", color: getStatusColor(col.status) }}>{col.status}</td>
                <td style={{ padding: "0.75rem" }}>{new Date(col.scheduledDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

// Helper function for table status color
const getStatusColor = (status) => {
  const colors = {
    pending: "#ffc107",
    confirmed: "#17a2b8",
    assigned: "#007bff",
    "in-progress": "#6c757d",
    completed: "#28a745",
    cancelled: "#dc3545",
  };
  return colors[status] || "#6c757d";
};

export default AdminDashboard;
