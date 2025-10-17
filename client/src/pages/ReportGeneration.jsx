/**
 * Report Generation Component
 * 
 * Purpose: Generate custom waste reports with filters and preview
 * Responsibilities:
 * - Allow users to configure report parameters
 * - Fetch available filter options from API
 * - Generate report preview
 * - Display and export generated reports
 * 
 * @component
 * @author Smart Waste Management System
 * @since 2025-10-17
 */

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Filter,
  MapPin,
  Trash2,
  Users,
  Download,
  Eye,
  Settings,
  TrendingUp,
  Package,
  AlertCircle,
  CheckCircle,
  FileDown,
  FileSpreadsheet,
  ChevronDown
} from "lucide-react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import API from "../services/api";
import Colors from "../constants/colors";
import "../App.css";

/**
 * Report Generation Dashboard
 * Provides interface for creating customized waste reports
 */
const ReportGeneration = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState("Daily");

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState({
    regions: [],
    wasteTypes: [],
    collectors: [],
    statusOptions: []
  });

  // Report configuration
  const [reportConfig, setReportConfig] = useState({
    timePeriod: "Last 7 Days",
    startDate: "",
    endDate: "",
    regions: [],
    wasteTypes: [],
    collectors: [],
    status: "",
    reportName: ""
  });

  // UI State
  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [error, setError] = useState(null);
  const [reportPreview, setReportPreview] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Ref for export menu
  const exportMenuRef = useRef(null);

  /**
   * Handle click outside to close export menu
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu]);

  /**
   * Fetch available filter options on mount and set initial dates
   */
  useEffect(() => {
    fetchFilterOptions();
    // Set initial date range for "Last 7 Days"
    handleTimePeriodChange("Last 7 Days");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Fetches filter options from backend
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
   * Handles time period preset selection
   */
  const handleTimePeriodChange = (period) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (period) {
      case "Last 7 Days":
        startDate.setDate(today.getDate() - 7);
        break;
      case "Last 30 Days":
        startDate.setDate(today.getDate() - 30);
        break;
      case "This Month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "Last Month":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return;
    }

    setReportConfig(prev => ({
      ...prev,
      timePeriod: period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }));
  };

  /**
   * Toggles selection in multi-select filters
   */
  const toggleSelection = (field, value) => {
    setReportConfig(prev => {
      const currentArray = prev[field];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  /**
   * Generates report preview
   */
  const handleGeneratePreview = async () => {
    console.log("🔍 Generate Preview clicked");
    console.log("Current reportConfig:", reportConfig);
    
    // Validate required fields
    if (!reportConfig.startDate || !reportConfig.endDate) {
      console.error("❌ Validation failed: Missing dates");
      setError("Start date and end date are required");
      return;
    }

    console.log("✅ Validation passed, generating report...");
    setLoading(true);
    setError(null);

    try {
      const requestData = {
        startDate: reportConfig.startDate,
        endDate: reportConfig.endDate,
        regions: reportConfig.regions.length > 0 ? reportConfig.regions : undefined,
        wasteTypes: reportConfig.wasteTypes.length > 0 ? reportConfig.wasteTypes : undefined,
        collectors: reportConfig.collectors.length > 0 ? reportConfig.collectors : undefined,
        status: reportConfig.status || undefined,
        reportName: reportConfig.reportName || "Generated Report"
      };

      console.log("📤 Sending request to /reports/custom:", requestData);

      const response = await API.post("/reports/custom", requestData);

      console.log("📥 Response received:", response.data);

      if (response.data.success) {
        console.log("✅ Report generated successfully");
        setReportPreview(response.data.data);
      } else {
        console.error("❌ Report generation failed:", response.data.message);
        setError(response.data.message || "Failed to generate report preview");
      }
    } catch (err) {
      console.error("❌ Error generating preview:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || "Error generating report preview");
    } finally {
      setLoading(false);
      console.log("🏁 Report generation completed");
    }
  };

  /**
   * Exports report data
   */
  const handleExportReport = () => {
    if (!reportPreview) return;

    const dataStr = JSON.stringify(reportPreview, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  /**
   * Exports report as PDF
   */
  const handleExportPDF = () => {
    if (!reportPreview) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text(reportPreview.reportName || 'Custom Report', pageWidth / 2, 20, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const periodText = `${new Date(reportPreview.period.startDate).toLocaleDateString()} - ${new Date(reportPreview.period.endDate).toLocaleDateString()}`;
    doc.text(periodText, pageWidth / 2, 28, { align: 'center' });
    
    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Summary Statistics', 14, 40);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    let yPos = 48;
    doc.text(`Total Collections: ${reportPreview.summary.totalCollections}`, 14, yPos);
    yPos += 6;
    doc.text(`Completed Collections: ${reportPreview.summary.completedCollections}`, 14, yPos);
    yPos += 6;
    doc.text(`Total Waste Collected: ${reportPreview.summary.totalWasteCollected} kg`, 14, yPos);
    yPos += 6;
    doc.text(`Revenue Generated: Rs. ${reportPreview.summary.revenueGenerated}`, 14, yPos);
    yPos += 6;
    doc.text(`Completion Rate: ${reportPreview.trends.completionRate}%`, 14, yPos);
    yPos += 12;

    // Waste by Type Table
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Waste Collection by Type', 14, yPos);
    yPos += 8;

    const wasteTypeData = Object.entries(reportPreview.wasteByType).map(([type, data]) => [
      type.charAt(0).toUpperCase() + type.slice(1),
      data.count,
      `${data.totalWeight} kg`,
      `${data.percentage}%`
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Waste Type', 'Collections', 'Total Weight', 'Percentage']],
      body: wasteTypeData,
      theme: 'grid',
      headStyles: { fillColor: [102, 126, 234], textColor: 255 },
      styles: { fontSize: 9 }
    });

    yPos = doc.lastAutoTable.finalY + 12;

    // High Waste Areas Table
    if (reportPreview.highWasteAreas && reportPreview.highWasteAreas.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('High Waste Generation Areas', 14, yPos);
      yPos += 8;

      const areaData = reportPreview.highWasteAreas.slice(0, 10).map((area, index) => [
        `#${index + 1}`,
        area.area,
        area.totalCollections,
        `${area.wasteVolume} kg`,
        area.dominantWasteType.charAt(0).toUpperCase() + area.dominantWasteType.slice(1)
      ]);

      doc.autoTable({
        startY: yPos,
        head: [['Rank', 'Area', 'Collections', 'Weight', 'Dominant Type']],
        body: areaData,
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234], textColor: 255 },
        styles: { fontSize: 9 }
      });

      yPos = doc.lastAutoTable.finalY + 12;
    }

    // Recommendations
    if (reportPreview.recommendations && reportPreview.recommendations.length > 0) {
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Recommendations', 14, yPos);
      yPos += 8;

      reportPreview.recommendations.forEach((rec, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`${index + 1}. ${rec.category} (${rec.priority.toUpperCase()})`, 14, yPos);
        yPos += 6;
        
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        const splitMessage = doc.splitTextToSize(rec.message, pageWidth - 28);
        doc.text(splitMessage, 14, yPos);
        yPos += splitMessage.length * 5 + 4;
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    doc.save(`report-${new Date().toISOString().split("T")[0]}.pdf`);
    setShowExportMenu(false);
  };

  /**
   * Exports report as Excel
   */
  const handleExportExcel = () => {
    if (!reportPreview) return;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      [reportPreview.reportName || 'Custom Report'],
      [`Period: ${reportPreview.period.duration}`],
      [],
      ['Summary Statistics'],
      ['Metric', 'Value'],
      ['Total Collections', reportPreview.summary.totalCollections],
      ['Completed Collections', reportPreview.summary.completedCollections],
      ['Pending Collections', reportPreview.summary.pendingCollections],
      ['Total Waste Collected (kg)', reportPreview.summary.totalWasteCollected],
      ['Revenue Generated (Rs.)', reportPreview.summary.revenueGenerated],
      [],
      ['Trends'],
      ['Metric', 'Value'],
      ['Daily Average Collections', reportPreview.trends.dailyAverage],
      ['Completion Rate (%)', reportPreview.trends.completionRate],
      ['Average Collection Time (hours)', reportPreview.trends.averageCollectionTime],
      ['Cancellation Rate (%)', reportPreview.trends.cancellationRate]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    // Waste by Type Sheet
    const wasteTypeData = [
      ['Waste Type', 'Collections', 'Total Weight (kg)', 'Percentage (%)'],
      ...Object.entries(reportPreview.wasteByType).map(([type, data]) => [
        type.charAt(0).toUpperCase() + type.slice(1),
        data.count,
        data.totalWeight,
        data.percentage
      ])
    ];

    const wasteTypeSheet = XLSX.utils.aoa_to_sheet(wasteTypeData);
    wasteTypeSheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wasteTypeSheet, 'Waste by Type');

    // High Waste Areas Sheet (if available)
    if (reportPreview.highWasteAreas && reportPreview.highWasteAreas.length > 0) {
      const areasData = [
        ['Rank', 'Area', 'Total Collections', 'Waste Volume (kg)', 'Dominant Waste Type'],
        ...reportPreview.highWasteAreas.map((area, index) => [
          index + 1,
          area.area,
          area.totalCollections,
          area.wasteVolume,
          area.dominantWasteType.charAt(0).toUpperCase() + area.dominantWasteType.slice(1)
        ])
      ];

      const areasSheet = XLSX.utils.aoa_to_sheet(areasData);
      areasSheet['!cols'] = [{ wch: 8 }, { wch: 40 }, { wch: 18 }, { wch: 20 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, areasSheet, 'High Waste Areas');
    }

    // Recommendations Sheet (if available)
    if (reportPreview.recommendations && reportPreview.recommendations.length > 0) {
      const recommendationsData = [
        ['Priority', 'Category', 'Message', 'Impact'],
        ...reportPreview.recommendations.map(rec => [
          rec.priority.toUpperCase(),
          rec.category,
          rec.message,
          rec.impact
        ])
      ];

      const recommendationsSheet = XLSX.utils.aoa_to_sheet(recommendationsData);
      recommendationsSheet['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 60 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(wb, recommendationsSheet, 'Recommendations');
    }

    // Save Excel file
    XLSX.writeFile(wb, `report-${new Date().toISOString().split("T")[0]}.xlsx`);
    setShowExportMenu(false);
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
          alignItems: "center"
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileText size={32} />
            Report Generation
          </h1>
          <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
            Create custom reports with specific filters and export options
          </p>
        </div>
        <button
          onClick={() => window.location.href = "/waste-manager-dashboard"}
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "#fff",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "600"
          }}
        >
          Back to Dashboard
        </button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Left Panel - Configure Report */}
        <section
          style={{
            backgroundColor: Colors.card,
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <Settings size={24} color={Colors.textPrimary} />
            <h2 style={{ color: Colors.textPrimary, margin: 0 }}>Configure Your Report</h2>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: `2px solid ${Colors.border}` }}>
            {["Daily", "Weekly", "Monthly", "Custom"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: activeTab === tab ? Colors.primaryButton : "transparent",
                  color: activeTab === tab ? "#fff" : Colors.textSecondary,
                  border: "none",
                  borderRadius: "8px 8px 0 0",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  transition: "all 0.3s"
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Time Period Selector */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: Colors.textSecondary, fontWeight: "600" }}>
              Time Period
            </label>
            <select
              value={reportConfig.timePeriod}
              onChange={(e) => handleTimePeriodChange(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: `1px solid ${Colors.border}`,
                fontSize: "1rem",
                backgroundColor: "#fff"
              }}
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="Custom">Custom Range</option>
            </select>
          </div>

          {/* Date Range */}
          {(activeTab === "Custom" || reportConfig.timePeriod === "Custom") && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: Colors.textSecondary, fontWeight: "600" }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={reportConfig.startDate}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: `1px solid ${Colors.border}`,
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
                    value={reportConfig.endDate}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, endDate: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: `1px solid ${Colors.border}`,
                      fontSize: "1rem"
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Filter Options Section */}
          <div
            style={{
              backgroundColor: Colors.background,
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1.5rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Filter size={20} color={Colors.textPrimary} />
              <h3 style={{ color: Colors.textPrimary, margin: 0, fontSize: "1.1rem" }}>Filter Options</h3>
            </div>

            {loadingFilters ? (
              <p style={{ color: Colors.textSecondary }}>Loading filters...</p>
            ) : (
              <>
                {/* Collectors Filter */}
                <details style={{ marginBottom: "1rem" }}>
                  <summary
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      color: Colors.textPrimary,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}
                  >
                    <Users size={18} />
                    Collectors ({reportConfig.collectors.length} selected)
                  </summary>
                  <div style={{ marginTop: "0.5rem", padding: "0.5rem", maxHeight: "150px", overflowY: "auto" }}>
                    {filterOptions.collectors.map((collector) => (
                      <label
                        key={collector.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem",
                          cursor: "pointer",
                          borderRadius: "4px",
                          backgroundColor: reportConfig.collectors.includes(collector.id) ? Colors.background : "transparent"
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={reportConfig.collectors.includes(collector.id)}
                          onChange={() => toggleSelection("collectors", collector.id)}
                          style={{ cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "0.9rem", color: Colors.textPrimary }}>{collector.name}</span>
                      </label>
                    ))}
                  </div>
                </details>

                {/* Areas Filter */}
                <details style={{ marginBottom: "1rem" }}>
                  <summary
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      color: Colors.textPrimary,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}
                  >
                    <MapPin size={18} />
                    Areas ({reportConfig.regions.length} selected)
                  </summary>
                  <div style={{ marginTop: "0.5rem", padding: "0.5rem", maxHeight: "150px", overflowY: "auto" }}>
                    {filterOptions.regions.slice(0, 10).map((region) => (
                      <label
                        key={region}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem",
                          cursor: "pointer",
                          borderRadius: "4px",
                          backgroundColor: reportConfig.regions.includes(region) ? Colors.background : "transparent"
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={reportConfig.regions.includes(region)}
                          onChange={() => toggleSelection("regions", region)}
                          style={{ cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "0.9rem", color: Colors.textPrimary }}>{region}</span>
                      </label>
                    ))}
                  </div>
                </details>

                {/* Waste Types Filter */}
                <details open style={{ marginBottom: "1rem" }}>
                  <summary
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      color: Colors.textPrimary,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}
                  >
                    <Trash2 size={18} />
                    Waste Types ({reportConfig.wasteTypes.length} selected)
                  </summary>
                  <div style={{ marginTop: "0.5rem", padding: "0.5rem" }}>
                    {filterOptions.wasteTypes.map((type) => (
                      <label
                        key={type}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem",
                          cursor: "pointer",
                          borderRadius: "4px",
                          backgroundColor: reportConfig.wasteTypes.includes(type) ? Colors.background : "transparent"
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={reportConfig.wasteTypes.includes(type)}
                          onChange={() => toggleSelection("wasteTypes", type)}
                          style={{ cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "0.9rem", color: Colors.textPrimary, textTransform: "capitalize" }}>{type}</span>
                      </label>
                    ))}
                  </div>
                </details>
              </>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGeneratePreview}
            disabled={loading || !reportConfig.startDate || !reportConfig.endDate}
            style={{
              width: "100%",
              backgroundColor: Colors.primaryButton,
              color: "#fff",
              padding: "1rem",
              borderRadius: "8px",
              border: "none",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading || !reportConfig.startDate || !reportConfig.endDate ? "not-allowed" : "pointer",
              opacity: loading || !reportConfig.startDate || !reportConfig.endDate ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "all 0.3s"
            }}
          >
            <Eye size={20} />
            {loading ? "Generating..." : "Generate Report Preview"}
          </button>

          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: "1rem", padding: "0.5rem", backgroundColor: "#f0f0f0", borderRadius: "4px", fontSize: "0.75rem" }}>
              <strong>Debug Info:</strong>
              <div>Start: {reportConfig.startDate || "Not set"}</div>
              <div>End: {reportConfig.endDate || "Not set"}</div>
              <div>Button Enabled: {(!loading && reportConfig.startDate && reportConfig.endDate) ? "Yes" : "No"}</div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginTop: "1rem",
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
        </section>

        {/* Right Panel - Report Preview */}
        <section
          style={{
            backgroundColor: Colors.card,
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FileText size={24} color={Colors.textPrimary} />
              <h2 style={{ color: Colors.textPrimary, margin: 0 }}>Report Preview</h2>
            </div>
            {reportPreview && (
              <div ref={exportMenuRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  style={{
                    backgroundColor: Colors.secondaryButton,
                    color: "#fff",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  <Download size={18} />
                  Export
                  <ChevronDown size={14} />
                </button>

                {/* Export Dropdown Menu */}
                {showExportMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      marginTop: "0.5rem",
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      overflow: "hidden",
                      zIndex: 1000,
                      minWidth: "180px"
                    }}
                  >
                    <button
                      onClick={handleExportPDF}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        backgroundColor: "transparent",
                        border: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.9rem",
                        color: Colors.textPrimary,
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = Colors.background}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <FileDown size={16} color="#dc3545" />
                      Export as PDF
                    </button>

                    <button
                      onClick={handleExportExcel}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        backgroundColor: "transparent",
                        border: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.9rem",
                        color: Colors.textPrimary,
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = Colors.background}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <FileSpreadsheet size={16} color="#28a745" />
                      Export as Excel
                    </button>

                    <button
                      onClick={handleExportReport}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        backgroundColor: "transparent",
                        border: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.9rem",
                        color: Colors.textPrimary,
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = Colors.background}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <FileText size={16} color="#17a2b8" />
                      Export as JSON
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {!reportPreview ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: Colors.textSecondary }}>
              <FileText size={64} color={Colors.textSecondary} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
              <h3 style={{ color: Colors.textPrimary, marginBottom: "0.5rem" }}>Report preview will appear here</h3>
              <p>Configure your report settings and click "Generate Report Preview"</p>
            </div>
          ) : (
            <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
              {/* Report Header */}
              <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: `2px solid ${Colors.border}` }}>
                <h3 style={{ color: Colors.textPrimary, margin: 0, marginBottom: "0.5rem" }}>
                  {reportPreview.reportName}
                </h3>
                <p style={{ color: Colors.textSecondary, fontSize: "0.9rem", margin: 0 }}>
                  Period: {new Date(reportPreview.period.startDate).toLocaleDateString()} - {new Date(reportPreview.period.endDate).toLocaleDateString()}
                  <br />
                  Duration: {reportPreview.period.duration}
                </p>
              </div>

              {/* Summary Statistics */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ color: Colors.textPrimary, marginBottom: "1rem" }}>Summary</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ backgroundColor: "#667eea", color: "#fff", padding: "1rem", borderRadius: "8px" }}>
                    <Package size={24} style={{ marginBottom: "0.5rem" }} />
                    <h3 style={{ margin: 0, fontSize: "1.5rem" }}>{reportPreview.summary.totalCollections}</h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: "0.9rem" }}>Total Collections</p>
                  </div>
                  <div style={{ backgroundColor: "#28a745", color: "#fff", padding: "1rem", borderRadius: "8px" }}>
                    <CheckCircle size={24} style={{ marginBottom: "0.5rem" }} />
                    <h3 style={{ margin: 0, fontSize: "1.5rem" }}>{reportPreview.summary.completedCollections}</h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: "0.9rem" }}>Completed</p>
                  </div>
                  <div style={{ backgroundColor: "#17a2b8", color: "#fff", padding: "1rem", borderRadius: "8px" }}>
                    <TrendingUp size={24} style={{ marginBottom: "0.5rem" }} />
                    <h3 style={{ margin: 0, fontSize: "1.5rem" }}>{reportPreview.summary.totalWasteCollected} kg</h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: "0.9rem" }}>Total Waste</p>
                  </div>
                  <div style={{ backgroundColor: "#ffc107", color: "#fff", padding: "1rem", borderRadius: "8px" }}>
                    <Package size={24} style={{ marginBottom: "0.5rem" }} />
                    <h3 style={{ margin: 0, fontSize: "1.5rem" }}>Rs. {reportPreview.summary.revenueGenerated}</h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: "0.9rem" }}>Revenue</p>
                  </div>
                </div>
              </div>

              {/* Waste by Type */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ color: Colors.textPrimary, marginBottom: "1rem" }}>Waste by Type</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {Object.entries(reportPreview.wasteByType).map(([type, data]) => (
                    <div key={type} style={{ padding: "0.75rem", backgroundColor: Colors.background, borderRadius: "8px" }}>
                      <h5 style={{ margin: 0, textTransform: "capitalize", color: Colors.textPrimary }}>{type}</h5>
                      <p style={{ margin: "0.25rem 0 0 0", color: Colors.textSecondary, fontSize: "0.85rem" }}>
                        {data.count} collections | {data.totalWeight} kg ({data.percentage}%)
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trends */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ color: Colors.textPrimary, marginBottom: "1rem" }}>Trends</h4>
                <div style={{ backgroundColor: Colors.background, padding: "1rem", borderRadius: "8px" }}>
                  <p style={{ margin: "0.5rem 0", color: Colors.textSecondary }}>
                    <strong>Completion Rate:</strong> {reportPreview.trends.completionRate}%
                  </p>
                  <p style={{ margin: "0.5rem 0", color: Colors.textSecondary }}>
                    <strong>Daily Average:</strong> {reportPreview.trends.dailyAverage} collections
                  </p>
                  <p style={{ margin: "0.5rem 0", color: Colors.textSecondary }}>
                    <strong>Avg Collection Time:</strong> {reportPreview.trends.averageCollectionTime}h
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              {reportPreview.recommendations && reportPreview.recommendations.length > 0 && (
                <div>
                  <h4 style={{ color: Colors.textPrimary, marginBottom: "1rem" }}>Recommendations</h4>
                  {reportPreview.recommendations.slice(0, 3).map((rec, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "0.75rem",
                        backgroundColor: Colors.background,
                        borderRadius: "8px",
                        marginBottom: "0.5rem",
                        borderLeft: `4px solid ${rec.priority === 'high' ? '#fd7e14' : rec.priority === 'critical' ? '#dc3545' : '#28a745'}`
                      }}
                    >
                      <p style={{ margin: 0, fontSize: "0.85rem", color: Colors.textPrimary }}>
                        <strong>{rec.category}:</strong> {rec.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ReportGeneration;
