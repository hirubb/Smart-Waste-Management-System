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

import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { 
  FileText, 
  BarChart3,
  Map, 
  Clock, 
  TrendingUp,
  Recycle,
  MapPin,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Settings,
  History,
  Eye,
  FileBarChart,
  ChevronRight,
  LogOut
} from "lucide-react";

/**
 * WasteManagerDashboard - Main dashboard for waste manager
 * Follows Open/Closed Principle: Open for extension (adding features), closed for modification
 */
const WasteManagerDashboard = () => {
  // Destructure user and logout from AuthContext following Dependency Inversion Principle
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dateInfo, setDateInfo] = useState({
    greeting: "",
    date: ""
  });

  /**
   * Set greeting and date on component mount
   */
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    let greeting = "Good morning";
    
    if (hours >= 12 && hours < 17) {
      greeting = "Good afternoon";
    } else if (hours >= 17) {
      greeting = "Good evening";
    }

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-US', options);

    setDateInfo({ greeting, date: formattedDate });
  }, []);

  /**
   * Navigation handler for features
   * Follows Single Responsibility Principle
   */
  const handleNavigate = (path) => {
    navigate(path);
  };

  /**
   * Logout handler
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // KPI Data
  const kpiData = [
    {
      title: "Total Waste Collected",
      value: "12,500 tons",
      change: "+6.2%",
      isPositive: true,
      icon: <Recycle size={28} />,
      bgColor: "#e3f2fd",
      iconColor: "#1976d2"
    },
    {
      title: "CO2 Savings",
      value: "2,340 tons",
      change: "+12.5%",
      isPositive: true,
      icon: <TrendingUp size={28} />,
      bgColor: "#e8f5e9",
      iconColor: "#388e3c"
    },
    {
      title: "Routes Completed",
      value: "1,847",
      change: "+5.1%",
      isPositive: true,
      icon: <MapPin size={28} />,
      bgColor: "#fff3e0",
      iconColor: "#f57c00"
    },
    {
      title: "On-time Performance",
      value: "94.2%",
      change: "-2.1%",
      isPositive: false,
      icon: <CheckCircle size={28} />,
      bgColor: "#f3e5f5",
      iconColor: "#7b1fa2"
    }
  ];

  // Latest Activity Data
  const latestActivities = [
    {
      title: "Route #123 completed successfully",
      time: "2 minutes ago",
      icon: <CheckCircle size={20} />,
      iconColor: "#28a745"
    },
    {
      title: "Weekly performance report generated",
      time: "15 minutes ago",
      icon: <FileText size={20} />,
      iconColor: "#17a2b8"
    },
    {
      title: "Alert: Truck #456 idle for 30+ minutes",
      time: "1 hour ago",
      icon: <Clock size={20} />,
      iconColor: "#ffc107"
    },
    {
      title: "Route #789 started collection",
      time: "2 hours ago",
      icon: <Map size={20} />,
      iconColor: "#667eea"
    }
  ];

  // Quick Actions
  const quickActions = [
    {
      title: "Generate New Report",
      description: "Create performance reports",
      icon: <FileBarChart size={22} />,
      path: "/custom-reports"
    },
    {
      title: "View Analysis",
      description: "Detailed data insights",
      icon: <Eye size={22} />,
      path: "/collection-summary"
    },
    {
      title: "View Trends",
      description: "Performance trends",
      icon: <BarChart3 size={22} />,
      path: "/monthly-reports"
    },
    {
      title: "Report History",
      description: "Past reports",
      icon: <History size={22} />,
      path: "/report-history"
    },
    {
      title: "Open Settings",
      description: "Configure preferences",
      icon: <Settings size={22} />,
      path: "/manager-profile"
    }
  ];

  return (
    <div 
      style={{ 
        backgroundColor: "#f8f9fa", 
        minHeight: "100vh", 
        padding: "0",
        display: "flex"
      }}
    >
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: "200px",
          backgroundColor: "#fff",
          borderRight: "1px solid #e0e0e0",
          padding: "2rem 0",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh"
        }}
      >
        {/* Navigation Items */}
        <div style={{ flex: 1 }}>
          <div
            onClick={() => handleNavigate("/waste-manager-dashboard")}
            style={{
              padding: "0.75rem 1.5rem",
              cursor: "pointer",
              backgroundColor: "transparent",
              color: "#333",
              fontSize: "0.9rem",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              borderLeft: "3px solid transparent"
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.backgroundColor = "#f5f5f5"; 
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.backgroundColor = "transparent"; 
            }}
          >
            <div style={{ 
              width: "18px", 
              height: "18px", 
              border: "2px solid #666",
              borderRadius: "3px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <CheckCircle size={12} color="#666" />
            </div>
            Dashboard
          </div>

          <div
            onClick={() => handleNavigate("/collection-summary")}
            style={{
              padding: "0.75rem 1.5rem",
              cursor: "pointer",
              backgroundColor: "transparent",
              color: "#333",
              fontSize: "0.9rem",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              borderLeft: "3px solid transparent"
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.backgroundColor = "#f5f5f5"; 
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.backgroundColor = "transparent"; 
            }}
          >
            <div style={{ 
              width: "18px", 
              height: "18px", 
              border: "2px solid #666",
              borderRadius: "3px"
            }} />
            Data Analysis
          </div>

          <div
            onClick={() => handleNavigate("/custom-reports")}
            style={{
              padding: "0.75rem 1.5rem",
              cursor: "pointer",
              backgroundColor: "transparent",
              color: "#333",
              fontSize: "0.9rem",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              borderLeft: "3px solid transparent"
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.backgroundColor = "#f5f5f5"; 
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.backgroundColor = "transparent"; 
            }}
          >
            <div style={{ 
              width: "18px", 
              height: "18px", 
              border: "2px solid #666",
              borderRadius: "3px"
            }} />
            Monthly Reports
          </div>

          <div
            onClick={() => handleNavigate("/report-generation")}
            style={{
              padding: "0.75rem 1.5rem",
              cursor: "pointer",
              backgroundColor: "transparent",
              color: "#333",
              fontSize: "0.9rem",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              borderLeft: "3px solid transparent"
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.backgroundColor = "#f5f5f5"; 
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.backgroundColor = "transparent"; 
            }}
          >
            <div style={{ 
              width: "18px", 
              height: "18px", 
              border: "2px solid #666",
              borderRadius: "3px"
            }} />
            Report Generation
          </div>

          <div style={{ 
            marginTop: "2rem", 
            padding: "0 1.5rem",
            color: "#999",
            fontSize: "0.75rem",
            fontWeight: "600",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            marginBottom: "1rem"
          }}>
            TRENDS & INSIGHTS
          </div>

          <div
            onClick={() => handleNavigate("/report-history")}
            style={{
              padding: "0.75rem 1.5rem",
              cursor: "pointer",
              backgroundColor: "transparent",
              color: "#333",
              fontSize: "0.9rem",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              borderLeft: "3px solid transparent"
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.backgroundColor = "#f5f5f5"; 
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.backgroundColor = "transparent"; 
            }}
          >
            <div style={{ 
              width: "18px", 
              height: "18px", 
              border: "2px solid #666",
              borderRadius: "3px"
            }} />
            Report History
          </div>

          <div
            onClick={() => handleNavigate("/manager-profile")}
            style={{
              padding: "0.75rem 1.5rem",
              cursor: "pointer",
              backgroundColor: "transparent",
              color: "#333",
              fontSize: "0.9rem",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              borderLeft: "3px solid transparent"
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.backgroundColor = "#f5f5f5"; 
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.backgroundColor = "transparent"; 
            }}
          >
            <div style={{ 
              width: "18px", 
              height: "18px", 
              border: "2px solid #666",
              borderRadius: "3px"
            }} />
            Settings
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "2rem 3rem" }}>
          
          {/* Top Header with Greeting */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "2rem"
          }}>
            <div>
              <h1 style={{ 
                fontSize: "1.8rem", 
                fontWeight: "700", 
                color: "#333",
                margin: "0 0 0.25rem 0"
              }}>
                {dateInfo.greeting}, {user?.name || "Admin"}!
              </h1>
              <p style={{ 
                fontSize: "0.9rem", 
                color: "#999",
                margin: 0
              }}>
                Today, {dateInfo.date}
              </p>
            </div>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <button
                style={{
                  padding: "0.6rem 1.2rem",
                  backgroundColor: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  color: "#666",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                Data Range: Last 7 days ▼
              </button>

              <button
                onClick={handleLogout}
                style={{
                  padding: "0.6rem 1.2rem",
                  backgroundColor: "#dc3545",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: "600",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#c82333"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#dc3545"; }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>

          {/* Key Performance Indicators */}
          <h2 style={{ 
            fontSize: "1.3rem", 
            fontWeight: "700", 
            color: "#333",
            marginBottom: "1.5rem"
          }}>
            Key Performance Indicators
          </h2>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2.5rem"
          }}>
            {kpiData.map((kpi, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "#fff",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      backgroundColor: kpi.bgColor,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: kpi.iconColor
                    }}
                  >
                    {kpi.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: kpi.isPositive ? "#28a745" : "#dc3545",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontWeight: "600",
                      backgroundColor: kpi.isPositive ? "#e8f5e9" : "#ffebee",
                      padding: "0.3rem 0.6rem",
                      borderRadius: "6px"
                    }}
                  >
                    {kpi.isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    {kpi.change} vs last period
                  </div>
                </div>
                
                <div>
                  <p style={{ 
                    fontSize: "0.85rem", 
                    color: "#999", 
                    margin: "0 0 0.5rem 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}>
                    <CheckCircle size={14} style={{ color: kpi.iconColor }} />
                    {kpi.title}
                  </p>
                  <h3 style={{ 
                    fontSize: "1.8rem", 
                    fontWeight: "700", 
                    color: "#333",
                    margin: 0
                  }}>
                    {kpi.value}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Content Grid - Latest Activity & Quick Actions */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 400px",
            gap: "1.5rem",
            marginBottom: "2rem"
          }}>
            
            {/* Latest Activity Section */}
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                overflow: "hidden"
              }}
            >
              <div style={{ 
                padding: "1.5rem",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <h3 style={{ 
                  fontSize: "1.1rem", 
                  fontWeight: "700", 
                  color: "#333",
                  margin: 0
                }}>
                  Latest Activity
                </h3>
                <button
                  style={{
                    padding: "0.4rem 0.8rem",
                    backgroundColor: "transparent",
                    border: "1px solid #e0e0e0",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    color: "#666"
                  }}
                >
                  View all →
                </button>
              </div>

              <div style={{ padding: "1rem 1.5rem" }}>
                {latestActivities.map((activity, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1rem 0",
                      borderBottom: index < latestActivities.length - 1 ? "1px solid #f5f5f5" : "none"
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: activity.iconColor,
                        flexShrink: 0
                      }}
                    >
                      {activity.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ 
                        fontSize: "0.9rem", 
                        color: "#333",
                        margin: "0 0 0.25rem 0",
                        fontWeight: "500"
                      }}>
                        {activity.title}
                      </p>
                      <p style={{ 
                        fontSize: "0.8rem", 
                        color: "#999",
                        margin: 0
                      }}>
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* System Status at bottom */}
              <div style={{ 
                padding: "1rem 1.5rem",
                backgroundColor: "#f8f9fa",
                borderTop: "1px solid #e0e0e0",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
                color: "#666"
              }}>
                <div style={{ 
                  width: "8px", 
                  height: "8px", 
                  backgroundColor: "#28a745", 
                  borderRadius: "50%" 
                }} />
                System Online - Last updated: 2 min ago
              </div>
            </div>

            {/* Quick Actions Section */}
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                overflow: "hidden"
              }}
            >
              <div style={{ 
                padding: "1.5rem",
                borderBottom: "1px solid #f0f0f0"
              }}>
                <h3 style={{ 
                  fontSize: "1.1rem", 
                  fontWeight: "700", 
                  color: "#333",
                  margin: 0
                }}>
                  Quick Actions
                </h3>
              </div>

              <div style={{ padding: "1rem" }}>
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    onClick={() => handleNavigate(action.path)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1rem",
                      cursor: "pointer",
                      borderRadius: "8px",
                      transition: "background-color 0.2s",
                      marginBottom: "0.5rem"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f8f9fa"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <div
                      style={{
                        width: "45px",
                        height: "45px",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#666",
                        flexShrink: 0
                      }}
                    >
                      {action.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ 
                        fontSize: "0.9rem", 
                        color: "#333",
                        margin: "0 0 0.2rem 0",
                        fontWeight: "600"
                      }}>
                        {action.title}
                      </p>
                      <p style={{ 
                        fontSize: "0.8rem", 
                        color: "#999",
                        margin: 0
                      }}>
                        {action.description}
                      </p>
                    </div>
                    <ChevronRight size={18} color="#ccc" />
                  </div>
                ))}
              </div>
            </div>
          </div>

      </div>
    </div>
  );
};

export default WasteManagerDashboard;
