/**
 * Monthly Reports Component
 * 
 * Purpose: Generate and display monthly waste collection reports
 * Responsibilities:
 * - Allow waste manager to select month/year
 * - Generate comprehensive monthly report
 * - Display waste statistics and trends
 * - Show high waste generation areas
 * - Provide optimization recommendations
 * - Export report functionality
 * 
 * @component
 * @author Smart Waste Management System
 * @since 2025-10-15
 */

import React, { useState } from "react";
import { 
  FileText, 
  TrendingUp, 
  MapPin, 
  Package, 
  AlertCircle,
  Download,
  Calendar,
  BarChart3,
  Clock
} from "lucide-react";
import API from "../services/api";
import Colors from "../constants/colors";
import "../App.css";

/**
 * Monthly Reports Dashboard
 * Follows Single Responsibility Principle: Only handles report generation and display
 */
const MonthlyReports = () => {
  // Authentication context (for future use with permissions)
  // const { user } = useContext(AuthContext);
  
  // State management
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generates monthly report from API
   * Follows Single Responsibility Principle
   */
  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await API.get('/reports/monthly', {
        params: {
          month: selectedMonth,
          year: selectedYear
        }
      });

      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.response?.data?.message || 'Error generating report');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exports report data
   * Future enhancement: Generate PDF/Excel
   */
  const handleExportReport = () => {
    if (!reportData) return;

    // Convert report to JSON and download
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `waste-report-${selectedYear}-${selectedMonth}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Gets priority color for recommendations
   * @param {string} priority - Priority level
   * @returns {string} Color code
   */
  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#dc3545',
      high: '#fd7e14',
      medium: '#ffc107',
      low: '#28a745'
    };
    return colors[priority] || Colors.textSecondary;
  };

  // Generate month options
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div style={{ backgroundColor: Colors.background, minHeight: "100vh", padding: "2rem" }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: Colors.header,
          color: "#fff",
          padding: "1.5rem 2rem",
          borderRadius: "12px",
          marginBottom: "2rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileText size={32} />
            Monthly Waste Collection Reports
          </h1>
          <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
            Generate comprehensive waste management reports
          </p>
        </div>
      </header>

      {/* Report Generation Section */}
      <section
        style={{
          backgroundColor: Colors.card,
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginBottom: "2rem"
        }}
      >
        <h2 style={{ color: Colors.textPrimary, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Calendar size={24} />
          Select Report Period
        </h2>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          {/* Month Selector */}
          <div style={{ flex: "1", minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: Colors.textSecondary, fontWeight: "600" }}>
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              style={{
                width: "100%",
                padding: "0.8rem",
                borderRadius: "8px",
                border: `1px solid ${Colors.textSecondary}`,
                fontSize: "1rem",
                backgroundColor: "#fff",
                cursor: "pointer"
              }}
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div style={{ flex: "1", minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: Colors.textSecondary, fontWeight: "600" }}>
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
                width: "100%",
                padding: "0.8rem",
                borderRadius: "8px",
                border: `1px solid ${Colors.textSecondary}`,
                fontSize: "1rem",
                backgroundColor: "#fff",
                cursor: "pointer"
              }}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            style={{
              backgroundColor: Colors.primaryButton,
              color: "#fff",
              padding: "0.8rem 2rem",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              border: "none",
              opacity: loading ? 0.6 : 1,
              transition: "all 0.3s",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <BarChart3 size={20} />
            {loading ? "Generating..." : "Generate Report"}
          </button>

          {/* Export Button */}
          {reportData && (
            <button
              onClick={handleExportReport}
              style={{
                backgroundColor: Colors.secondaryButton,
                color: "#fff",
                padding: "0.8rem 2rem",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                border: "none",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <Download size={20} />
              Export Report
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "#fee",
              color: "#c33",
              borderRadius: "8px",
              border: "1px solid #fcc"
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}
      </section>

      {/* Report Display */}
      {reportData && (
        <>
          {/* Summary Statistics */}
          <section
            style={{
              marginBottom: "2rem"
            }}
          >
            <h2 style={{ color: Colors.textPrimary, marginBottom: "1rem" }}>
              Report Summary - {reportData.period.monthName} {reportData.period.year}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1rem"
              }}
            >
              {/* Total Collections */}
              <div
                style={{
                  backgroundColor: "#667eea",
                  color: "#fff",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <Package size={32} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: "2rem" }}>{reportData.summary.totalCollections}</h3>
                    <p style={{ margin: 0, opacity: 0.9 }}>Total Collections</p>
                  </div>
                </div>
              </div>

              {/* Completed Collections */}
              <div
                style={{
                  backgroundColor: "#28a745",
                  color: "#fff",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <Package size={32} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: "2rem" }}>{reportData.summary.completedCollections}</h3>
                    <p style={{ margin: 0, opacity: 0.9 }}>Completed ({reportData.trends.completionRate}%)</p>
                  </div>
                </div>
              </div>

              {/* Total Waste */}
              <div
                style={{
                  backgroundColor: "#17a2b8",
                  color: "#fff",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <TrendingUp size={32} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: "2rem" }}>{reportData.summary.totalWasteCollected} kg</h3>
                    <p style={{ margin: 0, opacity: 0.9 }}>Total Waste Collected</p>
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div
                style={{
                  backgroundColor: "#ffc107",
                  color: "#fff",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <TrendingUp size={32} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: "2rem" }}>Rs. {reportData.summary.revenueGenerated}</h3>
                    <p style={{ margin: 0, opacity: 0.9 }}>Revenue Generated</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Waste by Type */}
          <section
            style={{
              backgroundColor: Colors.card,
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              marginBottom: "2rem"
            }}
          >
            <h2 style={{ color: Colors.textPrimary, marginBottom: "1rem" }}>
              Waste Collection by Type
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              {Object.entries(reportData.wasteByType).map(([type, data]) => (
                <div
                  key={type}
                  style={{
                    padding: "1rem",
                    backgroundColor: Colors.background,
                    borderRadius: "8px",
                    textAlign: "center"
                  }}
                >
                  <h4 style={{ color: Colors.textPrimary, textTransform: "capitalize", marginBottom: "0.5rem" }}>
                    {type}
                  </h4>
                  <p style={{ fontSize: "1.5rem", color: Colors.primaryButton, fontWeight: "600", margin: "0.5rem 0" }}>
                    {data.count}
                  </p>
                  <p style={{ color: Colors.textSecondary, fontSize: "0.9rem" }}>
                    {data.totalWeight} kg ({data.percentage}%)
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* High Waste Areas */}
          <section
            style={{
              backgroundColor: Colors.card,
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              marginBottom: "2rem"
            }}
          >
            <h2 style={{ color: Colors.textPrimary, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <MapPin size={24} />
              High Waste Generation Areas
            </h2>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${Colors.border}`, textAlign: "left" }}>
                  <th style={{ padding: "0.75rem", color: Colors.textSecondary }}>Rank</th>
                  <th style={{ padding: "0.75rem", color: Colors.textSecondary }}>Area</th>
                  <th style={{ padding: "0.75rem", color: Colors.textSecondary }}>Collections</th>
                  <th style={{ padding: "0.75rem", color: Colors.textSecondary }}>Total Weight (kg)</th>
                  <th style={{ padding: "0.75rem", color: Colors.textSecondary }}>Dominant Type</th>
                </tr>
              </thead>
              <tbody>
                {reportData.highWasteAreas.map((area, index) => (
                  <tr key={index} style={{ borderBottom: `1px solid ${Colors.border}` }}>
                    <td style={{ padding: "0.75rem", fontWeight: "600" }}>#{index + 1}</td>
                    <td style={{ padding: "0.75rem", color: Colors.textPrimary }}>{area.area}</td>
                    <td style={{ padding: "0.75rem" }}>{area.totalCollections}</td>
                    <td style={{ padding: "0.75rem" }}>{area.wasteVolume}</td>
                    <td style={{ padding: "0.75rem", textTransform: "capitalize" }}>{area.dominantWasteType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Collection Trends */}
          <section
            style={{
              backgroundColor: Colors.card,
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              marginBottom: "2rem"
            }}
          >
            <h2 style={{ color: Colors.textPrimary, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Clock size={24} />
              Collection Trends
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
              <div>
                <p style={{ color: Colors.textSecondary, marginBottom: "0.5rem" }}>Daily Average</p>
                <p style={{ fontSize: "1.8rem", color: Colors.primaryButton, fontWeight: "600", margin: 0 }}>
                  {reportData.trends.dailyAverage}
                </p>
              </div>
              <div>
                <p style={{ color: Colors.textSecondary, marginBottom: "0.5rem" }}>Completion Rate</p>
                <p style={{ fontSize: "1.8rem", color: Colors.primaryButton, fontWeight: "600", margin: 0 }}>
                  {reportData.trends.completionRate}%
                </p>
              </div>
              <div>
                <p style={{ color: Colors.textSecondary, marginBottom: "0.5rem" }}>Avg Collection Time</p>
                <p style={{ fontSize: "1.8rem", color: Colors.primaryButton, fontWeight: "600", margin: 0 }}>
                  {reportData.trends.averageCollectionTime}h
                </p>
              </div>
              <div>
                <p style={{ color: Colors.textSecondary, marginBottom: "0.5rem" }}>Cancellation Rate</p>
                <p style={{ fontSize: "1.8rem", color: Colors.primaryButton, fontWeight: "600", margin: 0 }}>
                  {reportData.trends.cancellationRate}%
                </p>
              </div>
            </div>
          </section>

          {/* Recommendations */}
          <section
            style={{
              backgroundColor: Colors.card,
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          >
            <h2 style={{ color: Colors.textPrimary, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertCircle size={24} />
              Recommendations for Route Optimization
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {reportData.recommendations.map((rec, index) => (
                <div
                  key={index}
                  style={{
                    padding: "1rem",
                    backgroundColor: Colors.background,
                    borderRadius: "8px",
                    borderLeft: `4px solid ${getPriorityColor(rec.priority)}`,
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-start"
                  }}
                >
                  <AlertCircle size={20} color={getPriorityColor(rec.priority)} style={{ flexShrink: 0, marginTop: "0.2rem" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <strong style={{ color: Colors.textPrimary }}>{rec.category}</strong>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "12px",
                          backgroundColor: getPriorityColor(rec.priority),
                          color: "#fff",
                          textTransform: "uppercase",
                          fontWeight: "600"
                        }}
                      >
                        {rec.priority}
                      </span>
                    </div>
                    <p style={{ color: Colors.textSecondary, margin: "0.5rem 0" }}>{rec.message}</p>
                    <p style={{ color: Colors.textSecondary, fontSize: "0.9rem", fontStyle: "italic", margin: 0 }}>
                      Impact: {rec.impact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* No Report Message */}
      {!reportData && !loading && (
        <div
          style={{
            backgroundColor: Colors.card,
            padding: "3rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            textAlign: "center"
          }}
        >
          <FileText size={64} color={Colors.textSecondary} style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ color: Colors.textPrimary, marginBottom: "0.5rem" }}>
            No Report Generated
          </h3>
          <p style={{ color: Colors.textSecondary }}>
            Select a month and year above, then click "Generate Report" to view waste collection statistics.
          </p>
        </div>
      )}
    </div>
  );
};

export default MonthlyReports;
