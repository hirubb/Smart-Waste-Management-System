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
import Colors from "../constants/colors";
import { FileText, BarChart3, Users, Map, Filter, Info, Clock } from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * WasteManagerDashboard - Main dashboard for waste manager
 * Follows Open/Closed Principle: Open for extension (adding features), closed for modification
 */
const WasteManagerDashboard = () => {
  // Destructure user from AuthContext following Dependency Inversion Principle
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [chartData, setChartData] = useState({
    wasteVolume: null,
    performance: null
  });

  /**
   * Load chart data on component mount
   */
  useEffect(() => {
    // Sample data for Waste Volume Over Time (Line Chart)
    const wasteVolumeData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      datasets: [
        {
          label: 'Waste Volume (tons)',
          data: [65, 72, 68, 80, 75, 85, 90, 88, 95, 92],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }
      ]
    };

    // Sample data for Average Collection Performance (Doughnut Chart)
    const performanceData = {
      labels: ['Completed', 'In Progress', 'Pending', 'Delayed'],
      datasets: [
        {
          label: 'Collection Status',
          data: [65, 20, 10, 5],
          backgroundColor: [
            '#28a745',
            '#17a2b8',
            '#ffc107',
            '#dc3545'
          ],
          borderColor: '#fff',
          borderWidth: 2,
          hoverOffset: 10
        }
      ]
    };

    setChartData({
      wasteVolume: wasteVolumeData,
      performance: performanceData
    });
  }, []);

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
      title: "Custom Reports",
      description: "Generate customized reports with advanced filters",
      icon: <Filter size={40} />,
      path: "/custom-reports",
      color: "#f093fb"
    },
    {
      title: "Report History",
      description: "View and manage all generated reports",
      icon: <Clock size={40} />,
      path: "/report-history",
      color: "#ff6b6b"
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

      {/* Welcome Section - Compact */}
      <section
        style={{
          backgroundColor: Colors.card,
          padding: "1.5rem 2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          maxWidth: "1200px",
          margin: "0 auto 2rem auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div>
          <h2 
            style={{ 
              color: Colors.textPrimary, 
              fontSize: "1.8rem", 
              marginBottom: "0.3rem",
              fontWeight: "700",
            }}
          >
            Welcome, {user?.name || "Waste Manager"}
          </h2>
          <p 
            style={{ 
              color: Colors.textSecondary, 
              fontSize: "0.95rem",
              margin: 0,
            }}
          >
            Your dashboard is ready for management operations.
          </p>
        </div>

        {/* User Role Badge */}
        <div
          style={{
            display: "inline-block",
            backgroundColor: Colors.primaryButton,
            color: "#fff",
            padding: "0.6rem 1.5rem",
            borderRadius: "25px",
            fontSize: "0.9rem",
            fontWeight: "600",
            letterSpacing: "0.5px",
          }}
        >
          {user?.role || "waste_manager"}
        </div>
      </section>

      {/* Analytics & Charts Section - Top Priority */}
      <section
        style={{
          marginBottom: "3rem",
        }}
      >
        <h3 style={{ color: Colors.textPrimary, marginBottom: "1.5rem", textAlign: "center" }}>
          Analytics Overview
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            gap: "1.5rem",
            maxWidth: "1200px",
            margin: "0 auto"
          }}
        >
          {/* Waste Volume Over Time Chart */}
          <div
            style={{
              backgroundColor: Colors.card,
              padding: "0",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              overflow: "hidden"
            }}
          >
            {/* Chart Header */}
            <div style={{ padding: "1.5rem", borderBottom: `1px solid ${Colors.border}` }}>
              <h4 style={{ color: Colors.textPrimary, margin: 0, fontSize: "1.1rem", fontWeight: "600" }}>
                Waste Volume Over Time
              </h4>
            </div>

            {/* Chart Content */}
            <div
              style={{
                padding: "2rem",
                minHeight: "300px",
                backgroundColor: "#fff"
              }}
            >
              {chartData.wasteVolume ? (
                <Line
                  data={chartData.wasteVolume}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                        labels: {
                          color: Colors.textPrimary,
                          font: {
                            size: 12,
                            weight: '600'
                          },
                          padding: 15
                        }
                      },
                      tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                          label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + ' tons';
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                          color: Colors.textSecondary,
                          callback: function(value) {
                            return value + ' t';
                          }
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          color: Colors.textSecondary
                        }
                      }
                    },
                    interaction: {
                      mode: 'index',
                      intersect: false,
                    }
                  }}
                />
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '250px' }}>
                  <p style={{ color: Colors.textSecondary }}>Loading chart...</p>
                </div>
              )}
            </div>

            {/* Chart Footer */}
            <div
              style={{
                padding: "1rem 1.5rem",
                backgroundColor: "#f8f9fa",
                borderTop: `1px solid ${Colors.border}`,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <Info size={16} color={Colors.textSecondary} />
              <p style={{ color: Colors.textSecondary, fontSize: "0.85rem", margin: 0 }}>
                Hover over data points for detailed information
              </p>
            </div>
          </div>

          {/* Average Collection Performance Chart */}
          <div
            style={{
              backgroundColor: Colors.card,
              padding: "0",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              overflow: "hidden"
            }}
          >
            {/* Chart Header */}
            <div style={{ padding: "1.5rem", borderBottom: `1px solid ${Colors.border}` }}>
              <h4 style={{ color: Colors.textPrimary, margin: 0, fontSize: "1.1rem", fontWeight: "600" }}>
                Average Collection Performance
              </h4>
            </div>

            {/* Chart Content */}
            <div
              style={{
                padding: "2rem",
                minHeight: "300px",
                backgroundColor: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              {chartData.performance ? (
                <div style={{ maxWidth: "300px", width: "100%" }}>
                  <Doughnut
                    data={chartData.performance}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          display: true,
                          position: 'bottom',
                          labels: {
                            color: Colors.textPrimary,
                            font: {
                              size: 11,
                              weight: '600'
                            },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                          }
                        },
                        tooltip: {
                          enabled: true,
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          padding: 12,
                          displayColors: true,
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const value = context.parsed || 0;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = ((value / total) * 100).toFixed(1);
                              return label + ': ' + percentage + '%';
                            }
                          }
                        }
                      },
                      cutout: '60%',
                      onClick: (event, elements) => {
                        if (elements.length > 0) {
                          const index = elements[0].index;
                          const label = chartData.performance.labels[index];
                          console.log('Clicked on:', label);
                          // Add navigation logic here if needed
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '250px' }}>
                  <p style={{ color: Colors.textSecondary }}>Loading chart...</p>
                </div>
              )}
            </div>

            {/* Chart Footer */}
            <div
              style={{
                padding: "1rem 1.5rem",
                backgroundColor: "#f8f9fa",
                borderTop: `1px solid ${Colors.border}`,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <Info size={16} color={Colors.textSecondary} />
              <p style={{ color: Colors.textSecondary, fontSize: "0.85rem", margin: 0 }}>
                Click chart elements to drill down into specific data
              </p>
            </div>
          </div>
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
