/**
 * ReportHistory Component
 * 
 * Purpose: Display report generation history with filtering and pagination
 * Responsibilities:
 * - Show list of previously generated reports
 * - Filter reports by type and date range
 * - Paginate through report history
 * - View detailed report information
 * 
 * @component
 * @author Smart Waste Management System
 * @since 2025-10-15
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Colors from "../constants/colors";
import { 
  FileText, 
  Calendar, 
  User, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import api from "../services/api";

const ReportHistory = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState({
    reportType: 'all',
    startDate: '',
    endDate: '',
    limit: 10
  });

  /**
   * Fetch report history from API
   */
  const fetchReportHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: filters.limit,
        ...(filters.reportType !== 'all' && { reportType: filters.reportType }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });
      
      const response = await api.get(`/reports/history?${queryParams}`);
      
      if (response.data.success) {
        setReports(response.data.data.reports);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalReports(response.data.data.pagination.totalReports);
      }
    } catch (err) {
      console.error('Error fetching report history:', err);
      setError(err.response?.data?.message || 'Failed to fetch report history');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load reports on component mount and when filters/page change
   */
  useEffect(() => {
    fetchReportHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);

  /**
   * Handle filter change
   */
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  /**
   * Handle page navigation
   */
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  /**
   * View report details
   */
  const handleViewReport = (reportId) => {
    navigate(`/report-details/${reportId}`);
  };

  /**
   * Format date string
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Get status icon and color
   */
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed':
        return { icon: <CheckCircle size={18} />, color: '#28a745', text: 'Completed' };
      case 'generating':
        return { icon: <Clock size={18} />, color: '#ffc107', text: 'Generating' };
      case 'failed':
        return { icon: <AlertCircle size={18} />, color: '#dc3545', text: 'Failed' };
      default:
        return { icon: <Clock size={18} />, color: Colors.textSecondary, text: status };
    }
  };

  /**
   * Get report type display name
   */
  const getReportTypeName = (type) => {
    const typeNames = {
      'monthly': 'Monthly Report',
      'custom': 'Custom Report',
      'weekly': 'Weekly Report',
      'yearly': 'Yearly Report',
      'collector-performance': 'Collector Performance',
      'area-analysis': 'Area Analysis'
    };
    return typeNames[type] || type;
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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <FileText size={32} />
          <div>
            <h1 style={{ margin: 0, fontSize: "2rem" }}>Report History</h1>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
              View and manage all generated reports
            </p>
          </div>
        </div>
      </header>

      {/* Filters Section */}
      <div
        style={{
          backgroundColor: Colors.card,
          padding: "1.5rem",
          borderRadius: "12px",
          marginBottom: "2rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Filter size={20} color={Colors.primaryButton} />
          <h3 style={{ margin: 0, color: Colors.textPrimary }}>Filters</h3>
        </div>
        
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          {/* Report Type Filter */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: Colors.textPrimary, fontWeight: "600" }}>
              Report Type
            </label>
            <select
              value={filters.reportType}
              onChange={(e) => handleFilterChange('reportType', e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: `1px solid ${Colors.border}`,
                backgroundColor: "#fff",
                color: Colors.textPrimary,
                cursor: "pointer"
              }}
            >
              <option value="all">All Types</option>
              <option value="monthly">Monthly Report</option>
              <option value="custom">Custom Report</option>
              <option value="weekly">Weekly Report</option>
              <option value="yearly">Yearly Report</option>
              <option value="collector-performance">Collector Performance</option>
              <option value="area-analysis">Area Analysis</option>
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: Colors.textPrimary, fontWeight: "600" }}>
              From Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: `1px solid ${Colors.border}`,
                backgroundColor: "#fff",
                color: Colors.textPrimary
              }}
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: Colors.textPrimary, fontWeight: "600" }}>
              To Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: `1px solid ${Colors.border}`,
                backgroundColor: "#fff",
                color: Colors.textPrimary
              }}
            />
          </div>

          {/* Items per page */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: Colors.textPrimary, fontWeight: "600" }}>
              Per Page
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: `1px solid ${Colors.border}`,
                backgroundColor: "#fff",
                color: Colors.textPrimary,
                cursor: "pointer"
              }}
            >
              <option value={5}>5 reports</option>
              <option value={10}>10 reports</option>
              <option value={20}>20 reports</option>
              <option value={50}>50 reports</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div
        style={{
          backgroundColor: Colors.card,
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          marginBottom: "2rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <TrendingUp size={20} color={Colors.primaryButton} />
          <span style={{ color: Colors.textPrimary, fontWeight: "600" }}>
            Total Reports: {totalReports}
          </span>
        </div>
        <div style={{ color: Colors.textSecondary, fontSize: "0.9rem" }}>
          Showing page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: Colors.textSecondary }}>
          <Clock size={48} style={{ marginBottom: "1rem", animation: "spin 2s linear infinite" }} />
          <p>Loading reports...</p>
        </div>
      ) : error ? (
        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            padding: "1.5rem",
            borderRadius: "12px",
            color: "#856404",
            textAlign: "center"
          }}
        >
          <AlertCircle size={32} style={{ marginBottom: "0.5rem" }} />
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      ) : reports.length === 0 ? (
        <div
          style={{
            backgroundColor: Colors.card,
            padding: "3rem",
            borderRadius: "12px",
            textAlign: "center",
            color: Colors.textSecondary
          }}
        >
          <FileText size={64} style={{ marginBottom: "1rem", opacity: 0.5 }} />
          <h3 style={{ color: Colors.textPrimary }}>No Reports Found</h3>
          <p>Try adjusting your filters or generate a new report.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {reports.map((report) => {
            const statusDisplay = getStatusDisplay(report.status);
            
            return (
              <div
                key={report._id}
                style={{
                  backgroundColor: Colors.card,
                  padding: "1.5rem",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                }}
                onClick={() => handleViewReport(report._id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "1rem" }}>
                  {/* Left Section */}
                  <div style={{ flex: 1, minWidth: "250px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <FileText size={24} color={Colors.primaryButton} />
                      <h3 style={{ margin: 0, color: Colors.textPrimary, fontSize: "1.2rem" }}>
                        {getReportTypeName(report.reportType)}
                      </h3>
                    </div>
                    
                    {report.period && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <Calendar size={16} color={Colors.textSecondary} />
                        <span style={{ color: Colors.textSecondary, fontSize: "0.9rem" }}>
                          {report.period.month && report.period.year 
                            ? `${new Date(report.period.year, report.period.month - 1).toLocaleString('default', { month: 'long' })} ${report.period.year}`
                            : `${new Date(report.period.startDate).toLocaleDateString()} - ${new Date(report.period.endDate).toLocaleDateString()}`
                          }
                        </span>
                      </div>
                    )}
                    
                    {report.generatedBy && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <User size={16} color={Colors.textSecondary} />
                        <span style={{ color: Colors.textSecondary, fontSize: "0.9rem" }}>
                          Generated by: {report.generatedBy.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Middle Section - Stats */}
                  <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                    <div>
                      <p style={{ margin: 0, color: Colors.textSecondary, fontSize: "0.85rem" }}>Collections</p>
                      <p style={{ margin: "0.25rem 0 0 0", color: Colors.textPrimary, fontSize: "1.4rem", fontWeight: "700" }}>
                        {report.summary.totalCollections}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, color: Colors.textSecondary, fontSize: "0.85rem" }}>Completed</p>
                      <p style={{ margin: "0.25rem 0 0 0", color: "#28a745", fontSize: "1.4rem", fontWeight: "700" }}>
                        {report.summary.completedCollections}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, color: Colors.textSecondary, fontSize: "0.85rem" }}>Waste (kg)</p>
                      <p style={{ margin: "0.25rem 0 0 0", color: Colors.textPrimary, fontSize: "1.4rem", fontWeight: "700" }}>
                        {report.summary.totalWasteCollected.toFixed(0)}
                      </p>
                    </div>
                  </div>

                  {/* Right Section - Status & Actions */}
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 1rem",
                        borderRadius: "20px",
                        backgroundColor: statusDisplay.color + "20",
                        color: statusDisplay.color,
                        marginBottom: "0.75rem"
                      }}
                    >
                      {statusDisplay.icon}
                      <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>{statusDisplay.text}</span>
                    </div>
                    
                    <p style={{ margin: "0.5rem 0", color: Colors.textSecondary, fontSize: "0.85rem" }}>
                      {formatDate(report.createdAt)}
                    </p>
                    
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.75rem" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewReport(report._id);
                        }}
                        style={{
                          padding: "0.5rem 1rem",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: Colors.primaryButton,
                          color: "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontWeight: "600",
                          transition: "opacity 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = "0.9"}
                        onMouseLeave={(e) => e.target.style.opacity = "1"}
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
            marginTop: "2rem",
            padding: "1rem",
            backgroundColor: Colors.card,
            borderRadius: "12px"
          }}
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: currentPage === 1 ? Colors.border : Colors.primaryButton,
              color: "#fff",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontWeight: "600"
            }}
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <span style={{ color: Colors.textPrimary, fontWeight: "600" }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: currentPage === totalPages ? Colors.border : Colors.primaryButton,
              color: "#fff",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontWeight: "600"
            }}
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportHistory;
