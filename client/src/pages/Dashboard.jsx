import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Colors from "../constants/colors";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { 
  FaBell, 
  FaMapMarkedAlt, 
  FaExclamationTriangle, 
  FaFileAlt,
  FaChartBar,
  FaMapMarkerAlt
} from "react-icons/fa";
import axios from "axios";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State for dashboard metrics
  const [dashboardData, setDashboardData] = useState({
    totalBins: 0,
    binsNeedingAttention: 0,
    averageFillRate: 0,
    totalAlerts24h: 0,
    binStatus: {
      empty: 0,
      halfFull: 0,
      full: 0,
      overflow: 0
    }
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        console.log("=== Fetching Dashboard Data ===");
        console.log("User:", user);
        console.log("User Role:", user?.role);
        
        // Fetch dustbins data
        let bins = [];
        try {
          const binsResponse = await axios.get("http://localhost:4000/api/dustbins");
          
          // Backend returns { success: true, message: '...', dustbins: [...] }
          if (binsResponse.data.success && binsResponse.data.dustbins) {
            bins = binsResponse.data.dustbins;
            console.log("✅ Bins fetched successfully:", bins.length, "bins");
          } else {
            console.warn("⚠️ Unexpected bins response format:", binsResponse.data);
          }
        } catch (binError) {
          console.error("❌ Error fetching bins:", binError.message);
          bins = [];
        }
        
        // Fetch alerts data (fetch all alerts without pagination)
        let alerts = [];
        try {
          const alertsResponse = await axios.get("http://localhost:4000/api/alerts?limit=1000");
          
          // Backend returns { success: true, alerts: [...], pagination: {...} }
          if (alertsResponse.data.success && alertsResponse.data.alerts) {
            alerts = alertsResponse.data.alerts;
            console.log("✅ Alerts fetched successfully:", alerts.length, "alerts");
          } else {
            console.warn("⚠️ Unexpected alerts response format:", alertsResponse.data);
          }
        } catch (alertError) {
          console.error("❌ Error fetching alerts:", alertError.message);
          alerts = [];
        }
        
        // Calculate bin status distribution
        const empty = bins.filter(b => b.fillPercentage < 25).length;
        const halfFull = bins.filter(b => b.fillPercentage >= 25 && b.fillPercentage < 75).length;
        const full = bins.filter(b => b.fillPercentage >= 75 && b.fillPercentage < 90).length;
        const overflow = bins.filter(b => b.fillPercentage >= 90).length;
        
        // Calculate average fill rate
        const avgFill = bins.length > 0 
          ? Math.round(bins.reduce((sum, b) => sum + b.fillPercentage, 0) / bins.length) 
          : 0;
        
        // Calculate alerts in last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentAlerts = alerts.filter(alert => {
          const alertDate = new Date(alert.createdAt);
          return alertDate >= twentyFourHoursAgo;
        });
        
        const newData = {
          totalBins: bins.length || 0,
          binsNeedingAttention: full + overflow,
          averageFillRate: avgFill,
          totalAlerts24h: recentAlerts.length,
          binStatus: { empty, halfFull, full, overflow }
        };
        
        console.log("📊 Dashboard data calculated:", newData);
        setDashboardData(newData);
        setLoading(false);
      } catch (error) {
        console.error("❌ Unexpected error:", error);
        // Set default values on error
        setDashboardData({
          totalBins: 0,
          binsNeedingAttention: 0,
          averageFillRate: 0,
          totalAlerts24h: 0,
          binStatus: { empty: 0, halfFull: 0, full: 0, overflow: 0 }
        });
        setLoading(false);
      }
    };

    // Only fetch if user is loaded and has the right role
    if (user) {
      const eligibleRoles = ["collector", "wma_admin", "authority", "resident"];
      if (eligibleRoles.includes(user.role)) {
        console.log("✅ User eligible for EcoMonitor dashboard:", user.role);
        fetchDashboardData();
      } else {
        console.log("⚠️ User role not eligible for EcoMonitor:", user.role);
        setLoading(false);
      }
    } else {
      console.log("⏳ Waiting for user data...");
    }
  }, [user]);

  // Feature click handlers
  const handleFeatureClick = (feature) => {
    if (feature === "View bin alerts") {
      navigate("/alert-management");
    } else if (feature === "Schedule special collection") {
      navigate("/special");
    } else if (feature === "View assigned routes") {
      // Navigate to different routes page based on role
      if (user?.role === "collector") {
        navigate("/assigned-routes");
      } else if (user?.role === "wma_admin" || user?.role === "authority") {
        navigate("/admin-routes");
      }
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
      "View assigned routes",
      "Optimize collection routes",
      "View reports and analytics",
      "Manage users and collectors",
    ],
    authority: [
      "View assigned routes",
      "Optimize collection routes",
      "View reports and analytics",
      "Manage users and collectors",
    ],
  };

  // Chart data for bin status
  const chartData = {
    labels: ['Empty', 'Half-Full', 'Full', 'Overflow'],
    datasets: [{
      data: [
        dashboardData.binStatus.empty,
        dashboardData.binStatus.halfFull,
        dashboardData.binStatus.full,
        dashboardData.binStatus.overflow
      ],
      backgroundColor: ['#22c55e', '#fbbf24', '#f97316', '#ef4444'],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  // Render EcoMonitor UI for collectors, admins, and residents
  if (user?.role === "collector" || user?.role === "wma_admin" || user?.role === "authority" || user?.role === "resident") {
    return (
      <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        {/* Dashboard Content */}
        <Container fluid style={{ padding: "2rem" }}>
          {/* Dashboard Overview */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "600", marginBottom: "0.5rem", color: "#1f2937" }}>
              Dashboard Overview
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
              Monitor your waste management system at a glance. Track bin status, alerts, and key performance metrics in real-time.
            </p>
            
            <Row className="g-4">
              {/* Total Bins Monitored */}
              <Col md={3}>
                <Card style={{ 
                  border: "none", 
                  borderRadius: "12px",
                  backgroundColor: "#fff",
                  padding: "1.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                        Total Bins Monitored
                      </p>
                      <h3 style={{ fontSize: "2rem", fontWeight: "700", color: "#1f2937", margin: 0 }}>
                        {loading ? <Spinner animation="border" size="sm" /> : dashboardData.totalBins}
                      </h3>
                      <p style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                        Across all locations
                      </p>
                    </div>
                    <FaMapMarkerAlt style={{ fontSize: "2rem", color: "#9ca3af" }} />
                  </div>
                </Card>
              </Col>

              {/* Bins Needing Attention */}
              <Col md={3}>
                <Card style={{ 
                  border: "none", 
                  borderRadius: "12px",
                  backgroundColor: "#fff",
                  padding: "1.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                        Bins Needing Attention
                      </p>
                      <h3 style={{ fontSize: "2rem", fontWeight: "700", color: "#f59e0b", margin: 0 }}>
                        {loading ? <Spinner animation="border" size="sm" /> : dashboardData.binsNeedingAttention}
                      </h3>
                      <p style={{ color: "#f59e0b", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                        Requires immediate action
                      </p>
                    </div>
                    <FaExclamationTriangle style={{ fontSize: "2rem", color: "#fbbf24" }} />
                  </div>
                </Card>
              </Col>

              {/* Average Fill Rate */}
              <Col md={3}>
                <Card style={{ 
                  border: "none", 
                  borderRadius: "12px",
                  backgroundColor: "#fff",
                  padding: "1.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                        Average Fill Rate
                      </p>
                      <h3 style={{ fontSize: "2rem", fontWeight: "700", color: "#3b82f6", margin: 0 }}>
                        {loading ? <Spinner animation="border" size="sm" /> : `${dashboardData.averageFillRate}%`}
                      </h3>
                      <p style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                        System-wide average
                      </p>
                    </div>
                    <FaChartBar style={{ fontSize: "2rem", color: "#93c5fd" }} />
                  </div>
                </Card>
              </Col>

              {/* Total Alerts (24H) */}
              <Col md={3}>
                <Card style={{ 
                  border: "none", 
                  borderRadius: "12px",
                  backgroundColor: "#fff",
                  padding: "1.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                        Total Alerts (24H)
                      </p>
                      <h3 style={{ fontSize: "2rem", fontWeight: "700", color: "#ef4444", margin: 0 }}>
                        {loading ? <Spinner animation="border" size="sm" /> : dashboardData.totalAlerts24h}
                      </h3>
                      <p style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                        Last 24 hours
                      </p>
                    </div>
                    <FaBell style={{ fontSize: "2rem", color: "#fca5a5" }} />
                  </div>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Current Bin Status */}
          <Card style={{ 
            border: "none", 
            borderRadius: "12px",
            backgroundColor: "#fff",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem", color: "#1f2937" }}>
              Current Bin Status
            </h3>
            <Row>
              <Col md={5}>
                <div style={{ maxWidth: "300px", margin: "0 auto" }}>
                  {loading ? (
                    <div style={{ textAlign: "center", padding: "3rem" }}>
                      <Spinner animation="border" />
                      <p style={{ marginTop: "1rem", color: "#6b7280" }}>Loading bin status...</p>
                    </div>
                  ) : dashboardData.totalBins === 0 ? (
                    <div style={{ textAlign: "center", padding: "3rem" }}>
                      <p style={{ color: "#6b7280" }}>No bins data available</p>
                    </div>
                  ) : (
                    <Pie data={chartData} options={chartOptions} />
                  )}
                </div>
              </Col>
              <Col md={7}>
                <Row className="g-3">
                  <Col md={6}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ 
                        width: "12px", 
                        height: "12px", 
                        borderRadius: "50%", 
                        backgroundColor: "#22c55e" 
                      }}></div>
                      <div>
                        <p style={{ margin: 0, fontWeight: "600", color: "#1f2937" }}>Empty</p>
                        <p style={{ margin: 0, color: "#6b7280", fontSize: "0.875rem" }}>
                          {loading ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            `${dashboardData.binStatus.empty} bins (${dashboardData.totalBins > 0 ? Math.round(dashboardData.binStatus.empty / dashboardData.totalBins * 100) : 0}%)`
                          )}
                        </p>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ 
                        width: "12px", 
                        height: "12px", 
                        borderRadius: "50%", 
                        backgroundColor: "#fbbf24" 
                      }}></div>
                      <div>
                        <p style={{ margin: 0, fontWeight: "600", color: "#1f2937" }}>Half-Full</p>
                        <p style={{ margin: 0, color: "#6b7280", fontSize: "0.875rem" }}>
                          {loading ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            `${dashboardData.binStatus.halfFull} bins (${dashboardData.totalBins > 0 ? Math.round(dashboardData.binStatus.halfFull / dashboardData.totalBins * 100) : 0}%)`
                          )}
                        </p>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ 
                        width: "12px", 
                        height: "12px", 
                        borderRadius: "50%", 
                        backgroundColor: "#f97316" 
                      }}></div>
                      <div>
                        <p style={{ margin: 0, fontWeight: "600", color: "#1f2937" }}>Full</p>
                        <p style={{ margin: 0, color: "#6b7280", fontSize: "0.875rem" }}>
                          {loading ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            `${dashboardData.binStatus.full} bins (${dashboardData.totalBins > 0 ? Math.round(dashboardData.binStatus.full / dashboardData.totalBins * 100) : 0}%)`
                          )}
                        </p>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ 
                        width: "12px", 
                        height: "12px", 
                        borderRadius: "50%", 
                        backgroundColor: "#ef4444" 
                      }}></div>
                      <div>
                        <p style={{ margin: 0, fontWeight: "600", color: "#1f2937" }}>Overflow</p>
                        <p style={{ margin: 0, color: "#6b7280", fontSize: "0.875rem" }}>
                          {loading ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            `${dashboardData.binStatus.overflow} bins (${dashboardData.totalBins > 0 ? Math.round(dashboardData.binStatus.overflow / dashboardData.totalBins * 100) : 0}%)`
                          )}
                        </p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>

          {/* Quick Actions */}
          <div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem", color: "#1f2937" }}>
              Quick Actions
            </h3>
            <Row className="g-4">
              <Col md={4}>
                <Card 
                  onClick={() => navigate("/live-monitor")}
                  style={{ 
                    border: "none", 
                    borderRadius: "12px",
                    backgroundColor: "#fff",
                    padding: "2rem",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    transition: "transform 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <div style={{ 
                    width: "60px", 
                    height: "60px", 
                    borderRadius: "50%", 
                    backgroundColor: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem"
                  }}>
                    <FaMapMarkedAlt style={{ fontSize: "1.5rem", color: "#6b7280" }} />
                  </div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1f2937", marginBottom: "0.5rem" }}>
                    View Live Map
                  </h4>
                </Card>
              </Col>

              <Col md={4}>
                <Card 
                  onClick={() => navigate("/alert-management")}
                  style={{ 
                    border: "none", 
                    borderRadius: "12px",
                    backgroundColor: "#fff",
                    padding: "2rem",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    transition: "transform 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <div style={{ 
                    width: "60px", 
                    height: "60px", 
                    borderRadius: "50%", 
                    backgroundColor: "#fef3c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem"
                  }}>
                    <FaExclamationTriangle style={{ fontSize: "1.5rem", color: "#f59e0b" }} />
                  </div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1f2937", marginBottom: "0.5rem" }}>
                    Manage Alerts
                  </h4>
                </Card>
              </Col>

              <Col md={4}>
                <Card 
                  onClick={() => navigate("/monthly-reports")}
                  style={{ 
                    border: "none", 
                    borderRadius: "12px",
                    backgroundColor: "#fff",
                    padding: "2rem",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    transition: "transform 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <div style={{ 
                    width: "60px", 
                    height: "60px", 
                    borderRadius: "50%", 
                    backgroundColor: "#dbeafe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem"
                  }}>
                    <FaFileAlt style={{ fontSize: "1.5rem", color: "#3b82f6" }} />
                  </div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1f2937", marginBottom: "0.5rem" }}>
                    Generate Reports
                  </h4>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Original Features Section */}
          <div style={{ marginTop: "3rem" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem", color: "#1f2937" }}>
              Additional Features
            </h3>
            <Row className="g-4">
              {roleFeatures[user?.role]?.map((feature, idx) => (
                <Col key={idx} md={4}>
                  <Card
                    onClick={() => handleFeatureClick(feature)}
                    style={{
                      border: "none",
                      borderRadius: "12px",
                      backgroundColor: "#fff",
                      padding: "1.5rem",
                      textAlign: "center",
                      cursor: "pointer",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      transition: "transform 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    <h5 style={{ color: "#1f2937", marginBottom: "0.5rem", fontWeight: "500" }}>
                      {feature}
                    </h5>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </div>
    );
  }

  // Default dashboard for residents and business users
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
