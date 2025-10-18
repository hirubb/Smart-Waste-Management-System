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
import { 
  Search,
  Download,
  Eye,
  RefreshCw,
  X,
  Home,
  FileText,
  ChevronRight as ChevronRightIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import api from "../services/api";

const ReportHistory = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [reportType, setReportType] = useState('all');
  const [generator, setGenerator] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  /**
   * Fetch report history from API
   */
  const fetchReportHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page: 1,
        limit: 100
      });
      
      const response = await api.get(`/reports/history?${queryParams}`);
      
      if (response.data.success) {
        setReports(response.data.data.reports || []);
      } else {
        setError(response.data.message || 'Failed to fetch report history');
      }
    } catch (err) {
      console.error('Error fetching report history:', err);
      setError(err.response?.data?.message || 'Failed to fetch report history');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load reports on component mount
   */
  useEffect(() => {
    fetchReportHistory();
  }, []);

  /**
   * Client-side filtering
   */
  const [filteredReports, setFilteredReports] = useState([]);

  useEffect(() => {
    console.log('🔍 Filtering reports...');
    console.log('Original reports count:', reports.length);
    console.log('Filter values:', { searchQuery, reportType, generator, dateFilter });
    
    let filtered = reports;

    // Search filter
    if (searchQuery) {
      console.log('Applying search filter:', searchQuery);
      const beforeSearch = filtered.length;
      filtered = filtered.filter(report => 
        report._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reportType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.generatedBy?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log(`Search filter: ${beforeSearch} -> ${filtered.length}`);
    }

    // Type filter
    if (reportType && reportType !== 'All' && reportType !== 'all') {
      console.log('Applying type filter:', reportType);
      const beforeType = filtered.length;
      filtered = filtered.filter(report => 
        report.reportType.toLowerCase() === reportType.toLowerCase()
      );
      console.log(`Type filter: ${beforeType} -> ${filtered.length}`);
    }

    // Generator filter
    if (generator && generator !== 'All' && generator !== 'all') {
      console.log('Applying generator filter:', generator);
      const beforeGenerator = filtered.length;
      filtered = filtered.filter(report => 
        report.generatedBy?.name === generator
      );
      console.log(`Generator filter: ${beforeGenerator} -> ${filtered.length}`);
    }

    // Date filter
    if (dateFilter) {
      console.log('Applying date filter:', dateFilter);
      const beforeDate = filtered.length;
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.createdAt).toISOString().split('T')[0];
        return reportDate === dateFilter;
      });
      console.log(`Date filter: ${beforeDate} -> ${filtered.length}`);
    }

    console.log('Final filtered count:', filtered.length);
    setFilteredReports(filtered);
  }, [reports, searchQuery, reportType, generator, dateFilter]);

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchQuery('');
    setReportType('all');
    setGenerator('all');
    setDateFilter('');
    setCurrentPage(1);
  };

  /**
   * Generate a sample monthly report for testing
   */
  const generateSampleReport = async () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      await api.get(`/reports/monthly?month=${currentMonth}&year=${currentYear}`);
      
      // Refresh the report history
      fetchReportHistory();
      
      alert('Sample report generated successfully!');
    } catch (error) {
      console.error('Error generating sample report:', error);
      alert('Failed to generate sample report: ' + (error.response?.data?.message || error.message));
    }
  };

  /**
   * Action handlers
   */
  const handleDownload = (reportId, e) => {
    e.stopPropagation();
    console.log('Download report:', reportId);
    // Implement download functionality
  };

  const handleView = (reportId, e) => {
    e.stopPropagation();
    navigate(`/report-details/${reportId}`);
  };

  const handleRetry = (reportId, e) => {
    e.stopPropagation();
    console.log('Retry report:', reportId);
    // Implement retry functionality
  };

  const handleDelete = (reportId, e) => {
    e.stopPropagation();
    console.log('Delete report:', reportId);
    // Implement delete functionality
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
   * Get status style
   */
  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return { backgroundColor: '#d4edda', color: '#155724' };
      case 'processing':
        return { backgroundColor: '#fff3cd', color: '#856404' };
      case 'failed':
        return { backgroundColor: '#f8d7da', color: '#721c24' };
      default:
        return { backgroundColor: '#d4edda', color: '#155724' };
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

  // Pagination calculations
  const indexOfLastItem = currentPage * 10;
  const indexOfFirstItem = indexOfLastItem - 10;
  const currentReports = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReports.length / 10);

  // Get unique generators for filter
  const uniqueGenerators = ['All', ...new Set(reports.map(r => r.generatedBy?.name).filter(Boolean))];

  return (
    <div style={{ 
      backgroundColor: "#f5f6fa", 
      minHeight: "100vh", 
      padding: "0",
      marginLeft: "0"
    }}>
      {/* Breadcrumb */}
      <div style={{
        backgroundColor: "#fff",
        padding: "1rem 2rem",
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "0.9rem",
        color: "#666"
      }}>
        <Home size={16} />
        <span>Dashboard</span>
        <ChevronRightIcon size={16} />
        <FileText size={16} />
        <span>Reports</span>
        <ChevronRightIcon size={16} />
        <span style={{ color: "#333", fontWeight: "600" }}>Report History</span>
      </div>

      {/* Main Content */}
      <div style={{ padding: "2rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ 
            margin: "0 0 0.5rem 0", 
            fontSize: "1.8rem", 
            color: "#1a1a1a",
            fontWeight: "700"
          }}>
            Report History
          </h1>
          <p style={{ 
            margin: 0, 
            color: "#666", 
            fontSize: "0.95rem" 
          }}>
            A comprehensive record of all previously generated reports. Search, filter, and access your documents with ease.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div style={{
          backgroundColor: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
            gap: "1rem",
            alignItems: "end"
          }}>
            {/* Search Input */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.85rem",
                color: "#666",
                fontWeight: "500"
              }}>
                Search Reports
              </label>
              <div style={{ position: "relative" }}>
                <Search 
                  size={18} 
                  style={{ 
                    position: "absolute", 
                    left: "12px", 
                    top: "50%", 
                    transform: "translateY(-50%)",
                    color: "#999"
                  }} 
                />
                <input
                  type="text"
                  placeholder="Search by Report ID, Type, Generator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.75rem 0.65rem 2.5rem",
                    border: "1px solid #e0e0e0",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                    outline: "none"
                  }}
                />
              </div>
            </div>

            {/* Report Type Filter */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.85rem",
                color: "#666",
                fontWeight: "500"
              }}>
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.75rem",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                <option>All</option>
                <option>Monthly</option>
                <option>Weekly</option>
                <option>Daily</option>
                <option>Custom</option>
              </select>
            </div>

            {/* Generator Filter */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.85rem",
                color: "#666",
                fontWeight: "500"
              }}>
                Generator
              </label>
              <select
                value={generator}
                onChange={(e) => setGenerator(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.75rem",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                {uniqueGenerators.map(gen => (
                  <option key={gen}>{gen}</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.85rem",
                color: "#666",
                fontWeight: "500"
              }}>
                Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.75rem",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  outline: "none"
                }}
              />
            </div>

            {/* Clear Filters & Generate Button */}
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button
                onClick={clearFilters}
                style={{
                  padding: "0.65rem 1rem",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  backgroundColor: "#fff",
                  color: "#666",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  whiteSpace: "nowrap"
                }}
                title="Clear Filters"
              >
                <X size={16} />
                Clear Filters
              </button>
              <button
                onClick={generateSampleReport}
                style={{
                  padding: "0.65rem 1rem",
                  border: "1px solid #28a745",
                  borderRadius: "6px",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  whiteSpace: "nowrap"
                }}
                title="Generate Sample Report"
              >
                <RefreshCw size={16} />
                Generate Sample
              </button>
              <button
                onClick={() => navigate('/custom-reports')}
                style={{
                  padding: "0.65rem 1.25rem",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: "#2c3e50",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  whiteSpace: "nowrap"
                }}
              >
                <FileText size={16} />
                Generate New Report
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}>
          {loading ? (
            <div style={{ 
              padding: "3rem", 
              textAlign: "center", 
              color: "#666" 
            }}>
              <RefreshCw size={32} style={{ animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: "1rem" }}>Loading reports...</p>
            </div>
          ) : error ? (
            <div style={{ 
              padding: "3rem", 
              textAlign: "center", 
              color: "#dc3545" 
            }}>
              <p>{error}</p>
              <button
                onClick={fetchReportHistory}
                style={{
                  marginTop: "1rem",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: "#2c3e50",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                Retry
              </button>
            </div>
          ) : currentReports.length === 0 ? (
            <div style={{ 
              padding: "3rem", 
              textAlign: "center", 
              color: "#666" 
            }}>
              <FileText size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
              <p>No reports found</p>
            </div>
          ) : (
            <>
              <table style={{ 
                width: "100%", 
                borderCollapse: "collapse",
                fontSize: "0.9rem"
              }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #e0e0e0"
                  }}>
                    <th style={{ 
                      padding: "1rem", 
                      textAlign: "left", 
                      fontWeight: "600",
                      color: "#666",
                      fontSize: "0.85rem"
                    }}>
                      Report ID
                    </th>
                    <th style={{ 
                      padding: "1rem", 
                      textAlign: "left", 
                      fontWeight: "600",
                      color: "#666",
                      fontSize: "0.85rem"
                    }}>
                      Type
                    </th>
                    <th style={{ 
                      padding: "1rem", 
                      textAlign: "left", 
                      fontWeight: "600",
                      color: "#666",
                      fontSize: "0.85rem"
                    }}>
                      Generator
                    </th>
                    <th style={{ 
                      padding: "1rem", 
                      textAlign: "left", 
                      fontWeight: "600",
                      color: "#666",
                      fontSize: "0.85rem"
                    }}>
                      Date
                    </th>
                    <th style={{ 
                      padding: "1rem", 
                      textAlign: "left", 
                      fontWeight: "600",
                      color: "#666",
                      fontSize: "0.85rem"
                    }}>
                      Status
                    </th>
                    <th style={{ 
                      padding: "1rem", 
                      textAlign: "center", 
                      fontWeight: "600",
                      color: "#666",
                      fontSize: "0.85rem"
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentReports.map((report, index) => (
                    <tr 
                      key={report._id}
                      style={{ 
                        borderBottom: "1px solid #f0f0f0",
                        backgroundColor: index % 2 === 0 ? "#fff" : "#fafbfc",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#fff" : "#fafbfc"}
                    >
                      <td style={{ padding: "1rem", color: "#333", fontFamily: "monospace" }}>
                        {`REP-${report._id.slice(-8).toUpperCase()}`}
                      </td>
                      <td style={{ padding: "1rem", color: "#333" }}>
                        {getReportTypeName(report.reportType)}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: report.generatedBy?.name === 'System' ? "#6c757d" : "#2c3e50",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: "600"
                          }}>
                            {report.generatedBy?.name?.substring(0, 2).toUpperCase() || 'SY'}
                          </div>
                          <span style={{ color: "#333" }}>
                            {report.generatedBy?.name || 'System'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "1rem", color: "#666" }}>
                        {formatDate(report.createdAt)}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{
                          ...getStatusStyle(report.status),
                          padding: "0.35rem 0.75rem",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: "500",
                          display: "inline-block"
                        }}>
                          {report.status?.charAt(0).toUpperCase() + report.status?.slice(1) || 'Completed'}
                        </span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ 
                          display: "flex", 
                          gap: "0.5rem", 
                          justifyContent: "center",
                          alignItems: "center"
                        }}>
                          <button
                            onClick={(e) => handleDownload(report._id, e)}
                            style={{
                              padding: "0.5rem",
                              border: "none",
                              borderRadius: "6px",
                              backgroundColor: "transparent",
                              color: "#666",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              transition: "background-color 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={(e) => handleView(report._id, e)}
                            style={{
                              padding: "0.5rem",
                              border: "none",
                              borderRadius: "6px",
                              backgroundColor: "transparent",
                              color: "#666",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              transition: "background-color 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          {report.status === 'failed' && (
                            <>
                              <button
                                onClick={(e) => handleRetry(report._id, e)}
                                style={{
                                  padding: "0.5rem",
                                  border: "none",
                                  borderRadius: "6px",
                                  backgroundColor: "transparent",
                                  color: "#17a2b8",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  transition: "background-color 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e8f4f8"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                title="Retry"
                              >
                                <RefreshCw size={18} />
                              </button>
                              <button
                                onClick={(e) => handleDelete(report._id, e)}
                                style={{
                                  padding: "0.5rem",
                                  border: "none",
                                  borderRadius: "6px",
                                  backgroundColor: "transparent",
                                  color: "#dc3545",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  transition: "background-color 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8d7da"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                title="Delete"
                              >
                                <X size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1.5rem",
                  borderTop: "1px solid #e0e0e0",
                  backgroundColor: "#f8f9fa"
                }}>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: "0.5rem",
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      backgroundColor: currentPage === 1 ? "#f0f0f0" : "#fff",
                      color: currentPage === 1 ? "#ccc" : "#333",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          style={{
                            padding: "0.5rem 0.75rem",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                            backgroundColor: currentPage === pageNum ? "#2c3e50" : "#fff",
                            color: currentPage === pageNum ? "#fff" : "#333",
                            cursor: "pointer",
                            fontWeight: currentPage === pageNum ? "600" : "normal",
                            minWidth: "40px"
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return <span key={pageNum} style={{ color: "#999" }}>...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "0.5rem",
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      backgroundColor: currentPage === totalPages ? "#f0f0f0" : "#fff",
                      color: currentPage === totalPages ? "#ccc" : "#333",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>



        {/* System Status */}
        <div style={{
          marginTop: "1rem",
          padding: "0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.85rem",
          color: "#666"
        }}>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#28a745"
          }} />
          <span>System Online</span>
          <span style={{ marginLeft: "auto" }}>Last updated: 2 min ago</span>
        </div>
      </div>

      {/* Add spin animation for loading icon */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ReportHistory;
