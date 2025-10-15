/**
 * Custom Reports Component
 * 
 * Purpose: Generate customized waste collection reports with filters
 * Responsibilities:
 * - Allow waste manager to select custom filters
 * - Fetch available filter options from API
 * - Generate customized reports based on selections
 * - Display filtered waste statistics and trends
 * - Export custom reports
 * 
 * @component
 * @author Smart Waste Management System
 * @since 2025-10-15
 */

import React, { useState, useEffect } from "react";
import {
  FileText,
  TrendingUp,
  MapPin,
  Package,
  AlertCircle,
  Download,
  Calendar,
  BarChart3,
  Clock,
  Filter,
  Users,
  Trash2,
  X,
  CheckCircle
} from "lucide-react";
import API from "../services/api";
import Colors from "../constants/colors";
import "../App.css";

/**
 * Custom Reports Dashboard
 * Allows filtering by regions, waste types, collectors, status, and date range
 */
const CustomReports = () => {
  // Filter options from API
  const [filterOptions, setFilterOptions] = useState({
    regions: [],
    wasteTypes: [],
    collectors: [],
    statusOptions: []
  });

  // Selected filters
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    regions: [],
    wasteTypes: [],
    collectors: [],
    status: "",
    reportName: ""
  });

  // Report data
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch available filter options on component mount
   */
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  /**
   * Fetches available filter options from API
   */
  const fetchFilterOptions = async () => {
    setLoadingFilters(true);
    try {
      const response = await API.get("/reports/filters/options");
      if (response.data.success) {
        setFilterOptions(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching filter options:", err);
      setError("Failed to load filter options");
    } finally {
      setLoadingFilters(false);
    }
  };

  /**
   * Handles filter changes
   */
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Toggles multi-select filters (regions, wasteTypes, collectors)
   */
  const toggleArrayFilter = (field, value) => {
    setFilters((prev) => {
      const currentArray = prev[field];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  /**
   * Clears all filters
   */
  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      regions: [],
      wasteTypes: [],
      collectors: [],
      status: "",
      reportName: ""
    });
    setReportData(null);
    setError(null);
  };

  /**
   * Generates custom report from API
   */
  const handleGenerateReport = async () => {
    // Validate required fields
    if (!filters.startDate || !filters.endDate) {
      setError("Start date and end date are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await API.post("/reports/custom", {
        startDate: filters.startDate,
        endDate: filters.endDate,
        regions: filters.regions.length > 0 ? filters.regions : undefined,
        wasteTypes: filters.wasteTypes.length > 0 ? filters.wasteTypes : undefined,
        collectors: filters.collectors.length > 0 ? filters.collectors : undefined,
        status: filters.status || undefined,
        reportName: filters.reportName || undefined
      });

      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        setError(response.data.message || "Failed to generate report");
      }
    } catch (err) {
      console.error("Error generating report:", err);
      setError(err.response?.data?.message || "Error generating report");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exports report data
   */
  const handleExportReport = () => {
    if (!reportData) return;

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `custom-report-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Gets priority color for recommendations
   */
  const getPriorityColor = (priority) => {
    const colors = {
      critical: "#dc3545",
      high: "#fd7e14",
      medium: "#ffc107",
      low: "#28a745"
    };
    return colors[priority] || Colors.textSecondary;
  };

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
            <Filter size={32} />
            Custom Waste Collection Reports
          </h1>
          <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
            Generate tailored reports with advanced filters
          </p>
        </div>
      </header>

      {/* Filter Section */}
      <section
        style={{
          backgroundColor: Colors.card,
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginBottom: "2rem"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ color: Colors.textPrimary, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar size={24} />
            Report Filters
          </h2>
          <button
            onClick={clearFilters}
            style={{
              backgroundColor: "transparent",
              color: Colors.dangerButton,
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
              border: `1px solid ${Colors.dangerButton}`,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <X size={16} />
            Clear All
          </button>
        </div>

        {loadingFilters ? (
          <p style={{ color: Colors.textSecondary }}>Loading filter options...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Date Range */}
            <div>
              <h3 style={{ color: Colors.textPrimary, marginBottom: "1rem", fontSize: "1.1rem" }}>
                Date Range (Required)
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: Colors.textSecondary, fontWeight: "600" }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      borderRadius: "8px",
                      border: `1px solid ${Colors.textSecondary}`,
                      fontSize: "1rem"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: Colors.textSecondary, fontWeight: "600" }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      borderRadius: "8px",
                      border: `1px solid ${Colors.textSecondary}`,
                      fontSize: "1rem"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Report Name */}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: Colors.textSecondary, fontWeight: "600" }}>
                Report Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Q1 2025 Recyclables Analysis"
                value={filters.reportName}
                onChange={(e) => handleFilterChange("reportName", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  borderRadius: "8px",
                  border: `1px solid ${Colors.textSecondary}`,
                  fontSize: "1rem"
                }}
              />
            </div>

            {/* Regions Filter */}
            <div>
              <h3 style={{ color: Colors.textPrimary, marginBottom: "1rem", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MapPin size={20} />
                Regions (Optional) - {filters.regions.length} selected
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {filterOptions.regions.length === 0 ? (
                  <p style={{ color: Colors.textSecondary }}>No regions available</p>
                ) : (
                  filterOptions.regions.slice(0, 10).map((region) => (
                    <button
                      key={region}
                      onClick={() => toggleArrayFilter("regions", region)}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "20px",
                        border: `2px solid ${filters.regions.includes(region) ? Colors.primaryButton : Colors.textSecondary}`,
                        backgroundColor: filters.regions.includes(region) ? Colors.primaryButton : "transparent",
                        color: filters.regions.includes(region) ? "#fff" : Colors.textPrimary,
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        transition: "all 0.3s"
                      }}
                    >
                      {filters.regions.includes(region) && <CheckCircle size={16} />}
                      {region}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Waste Types Filter */}
            <div>
              <h3 style={{ color: Colors.textPrimary, marginBottom: "1rem", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Trash2 size={20} />
                Waste Types (Optional) - {filters.wasteTypes.length} selected
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {filterOptions.wasteTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleArrayFilter("wasteTypes", type)}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "20px",
                      border: `2px solid ${filters.wasteTypes.includes(type) ? Colors.primaryButton : Colors.textSecondary}`,
                      backgroundColor: filters.wasteTypes.includes(type) ? Colors.primaryButton : "transparent",
                      color: filters.wasteTypes.includes(type) ? "#fff" : Colors.textPrimary,
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      textTransform: "capitalize",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      transition: "all 0.3s"
                    }}
                  >
                    {filters.wasteTypes.includes(type) && <CheckCircle size={16} />}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Collectors Filter */}
            <div>
              <h3 style={{ color: Colors.textPrimary, marginBottom: "1rem", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Users size={20} />
                Collectors (Optional) - {filters.collectors.length} selected
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {filterOptions.collectors.length === 0 ? (
                  <p style={{ color: Colors.textSecondary }}>No collectors available</p>
                ) : (
                  filterOptions.collectors.map((collector) => (
                    <button
                      key={collector.id}
                      onClick={() => toggleArrayFilter("collectors", collector.id)}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "20px",
                        border: `2px solid ${filters.collectors.includes(collector.id) ? Colors.primaryButton : Colors.textSecondary}`,
                        backgroundColor: filters.collectors.includes(collector.id) ? Colors.primaryButton : "transparent",
                        color: filters.collectors.includes(collector.id) ? "#fff" : Colors.textPrimary,
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        transition: "all 0.3s"
                      }}
                    >
                      {filters.collectors.includes(collector.id) && <CheckCircle size={16} />}
                      {collector.name}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: Colors.textSecondary, fontWeight: "600" }}>
                Collection Status (Optional)
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  padding: "0.8rem",
                  borderRadius: "8px",
                  border: `1px solid ${Colors.textSecondary}`,
                  fontSize: "1rem",
                  backgroundColor: "#fff",
                  cursor: "pointer"
                }}
              >
                <option value="">All Statuses</option>
                {filterOptions.statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button
                onClick={handleGenerateReport}
                disabled={loading || !filters.startDate || !filters.endDate}
                style={{
                  backgroundColor: Colors.primaryButton,
                  color: "#fff",
                  padding: "1rem 2rem",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: loading || !filters.startDate || !filters.endDate ? "not-allowed" : "pointer",
                  border: "none",
                  opacity: loading || !filters.startDate || !filters.endDate ? 0.6 : 1,
                  transition: "all 0.3s",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <BarChart3 size={20} />
                {loading ? "Generating..." : "Generate Custom Report"}
              </button>

              {reportData && (
                <button
                  onClick={handleExportReport}
                  style={{
                    backgroundColor: Colors.secondaryButton,
                    color: "#fff",
                    padding: "1rem 2rem",
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
                  padding: "1rem",
                  backgroundColor: "#fee",
                  color: "#c33",
                  borderRadius: "8px",
                  border: "1px solid #fcc",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <AlertCircle size={20} />
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Report Display */}
      {reportData && (
        <>
          {/* Report Header */}
          <section
            style={{
              backgroundColor: Colors.card,
              padding: "1.5rem 2rem",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              marginBottom: "2rem"
            }}
          >
            <h2 style={{ color: Colors.textPrimary, margin: 0, marginBottom: "0.5rem" }}>
              {reportData.reportName}
            </h2>
            <p style={{ color: Colors.textSecondary, margin: 0 }}>
              Period: {new Date(reportData.period.startDate).toLocaleDateString()} - {new Date(reportData.period.endDate).toLocaleDateString()} ({reportData.period.duration})
            </p>
            <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {Array.isArray(reportData.filters.regions) && reportData.filters.regions.length > 0 && (
                <span style={{ padding: "0.3rem 0.8rem", backgroundColor: Colors.background, borderRadius: "12px", fontSize: "0.85rem" }}>
                  Regions: {reportData.filters.regions.join(", ")}
                </span>
              )}
              {Array.isArray(reportData.filters.wasteTypes) && reportData.filters.wasteTypes.length > 0 && (
                <span style={{ padding: "0.3rem 0.8rem", backgroundColor: Colors.background, borderRadius: "12px", fontSize: "0.85rem" }}>
                  Types: {reportData.filters.wasteTypes.join(", ")}
                </span>
              )}
              {reportData.filters.status && reportData.filters.status !== "All statuses" && (
                <span style={{ padding: "0.3rem 0.8rem", backgroundColor: Colors.background, borderRadius: "12px", fontSize: "0.85rem" }}>
                  Status: {reportData.filters.status}
                </span>
              )}
            </div>
          </section>

          {/* Summary Statistics */}
          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: Colors.textPrimary, marginBottom: "1rem" }}>Report Summary</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
              <div style={{ backgroundColor: "#667eea", color: "#fff", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <Package size={32} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: "2rem" }}>{reportData.summary.totalCollections}</h3>
                    <p style={{ margin: 0, opacity: 0.9 }}>Total Collections</p>
                  </div>
                </div>
              </div>
              <div style={{ backgroundColor: "#28a745", color: "#fff", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <Package size={32} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: "2rem" }}>{reportData.summary.completedCollections}</h3>
                    <p style={{ margin: 0, opacity: 0.9 }}>Completed ({reportData.trends.completionRate}%)</p>
                  </div>
                </div>
              </div>
              <div style={{ backgroundColor: "#17a2b8", color: "#fff", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <TrendingUp size={32} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: "2rem" }}>{reportData.summary.totalWasteCollected} kg</h3>
                    <p style={{ margin: 0, opacity: 0.9 }}>Total Waste</p>
                  </div>
                </div>
              </div>
              <div style={{ backgroundColor: "#ffc107", color: "#fff", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <TrendingUp size={32} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: "2rem" }}>Rs. {reportData.summary.revenueGenerated}</h3>
                    <p style={{ margin: 0, opacity: 0.9 }}>Revenue</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Waste by Type */}
          <section style={{ backgroundColor: Colors.card, padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: "2rem" }}>
            <h2 style={{ color: Colors.textPrimary, marginBottom: "1rem" }}>Waste Collection by Type</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              {Object.entries(reportData.wasteByType).map(([type, data]) => (
                <div key={type} style={{ padding: "1rem", backgroundColor: Colors.background, borderRadius: "8px", textAlign: "center" }}>
                  <h4 style={{ color: Colors.textPrimary, textTransform: "capitalize", marginBottom: "0.5rem" }}>{type}</h4>
                  <p style={{ fontSize: "1.5rem", color: Colors.primaryButton, fontWeight: "600", margin: "0.5rem 0" }}>{data.count}</p>
                  <p style={{ color: Colors.textSecondary, fontSize: "0.9rem" }}>{data.totalWeight} kg ({data.percentage}%)</p>
                </div>
              ))}
            </div>
          </section>

          {/* High Waste Areas */}
          {reportData.highWasteAreas.length > 0 && (
            <section style={{ backgroundColor: Colors.card, padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: "2rem" }}>
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
          )}

          {/* Collector Analysis */}
          {reportData.collectorAnalysis && reportData.collectorAnalysis.length > 0 && (
            <section style={{ backgroundColor: Colors.card, padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: "2rem" }}>
              <h2 style={{ color: Colors.textPrimary, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Users size={24} />
                Collector Performance
              </h2>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${Colors.border}`, textAlign: "left" }}>
                    <th style={{ padding: "0.75rem", color: Colors.textSecondary }}>Collector</th>
                    <th style={{ padding: "0.75rem", color: Colors.textSecondary }}>Total Assigned</th>
                    <th style={{ padding: "0.75rem", color: Colors.textSecondary }}>Completed</th>
                    <th style={{ padding: "0.75rem", color: Colors.textSecondary }}>Pending</th>
                    <th style={{ padding: "0.75rem", color: Colors.textSecondary }}>Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.collectorAnalysis.map((collector, index) => (
                    <tr key={index} style={{ borderBottom: `1px solid ${Colors.border}` }}>
                      <td style={{ padding: "0.75rem", color: Colors.textPrimary }}>{collector.name}</td>
                      <td style={{ padding: "0.75rem" }}>{collector.totalAssigned}</td>
                      <td style={{ padding: "0.75rem" }}>{collector.completed}</td>
                      <td style={{ padding: "0.75rem" }}>{collector.pending}</td>
                      <td style={{ padding: "0.75rem", fontWeight: "600", color: Colors.primaryButton }}>{collector.completionRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Collection Trends */}
          <section style={{ backgroundColor: Colors.card, padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: "2rem" }}>
            <h2 style={{ color: Colors.textPrimary, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Clock size={24} />
              Collection Trends
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
              <div>
                <p style={{ color: Colors.textSecondary, marginBottom: "0.5rem" }}>Daily Average</p>
                <p style={{ fontSize: "1.8rem", color: Colors.primaryButton, fontWeight: "600", margin: 0 }}>{reportData.trends.dailyAverage}</p>
              </div>
              <div>
                <p style={{ color: Colors.textSecondary, marginBottom: "0.5rem" }}>Completion Rate</p>
                <p style={{ fontSize: "1.8rem", color: Colors.primaryButton, fontWeight: "600", margin: 0 }}>{reportData.trends.completionRate}%</p>
              </div>
              <div>
                <p style={{ color: Colors.textSecondary, marginBottom: "0.5rem" }}>Avg Collection Time</p>
                <p style={{ fontSize: "1.8rem", color: Colors.primaryButton, fontWeight: "600", margin: 0 }}>{reportData.trends.averageCollectionTime}h</p>
              </div>
              <div>
                <p style={{ color: Colors.textSecondary, marginBottom: "0.5rem" }}>Cancellation Rate</p>
                <p style={{ fontSize: "1.8rem", color: Colors.primaryButton, fontWeight: "600", margin: 0 }}>{reportData.trends.cancellationRate}%</p>
              </div>
            </div>
          </section>

          {/* Recommendations */}
          <section style={{ backgroundColor: Colors.card, padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <h2 style={{ color: Colors.textPrimary, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertCircle size={24} />
              Recommendations
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
                    <p style={{ color: Colors.textSecondary, fontSize: "0.9rem", fontStyle: "italic", margin: 0 }}>Impact: {rec.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* No Report Message */}
      {!reportData && !loading && (
        <div style={{ backgroundColor: Colors.card, padding: "3rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textAlign: "center" }}>
          <FileText size={64} color={Colors.textSecondary} style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ color: Colors.textPrimary, marginBottom: "0.5rem" }}>No Report Generated</h3>
          <p style={{ color: Colors.textSecondary }}>
            Configure your filters above and click "Generate Custom Report" to view customized waste collection statistics.
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomReports;
