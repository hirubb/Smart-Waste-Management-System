/**
 * Data Analysis Component
 * 
 * Purpose: Comprehensive data analysis and visualization for waste management
 * Features:
 * - Advanced filtering by city, date range, waste type, collectors
 * - Interactive charts for waste volume trends and performance metrics
 * - Real-time data visualization with Chart.js
 * - Export capabilities for analysis results
 * 
 * @component
 * @author Smart Waste Management System
 * @since 2025-10-17
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Filter,
  Calendar,
  MapPin,
  Trash2,
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  RefreshCw,
  Search,
  ChevronDown,
  AlertCircle
} from "lucide-react";
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
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import Colors from "../constants/colors";
import "../css/DataAnalysis.css";

// Register Chart.js components
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
 * Data Analysis Dashboard Component
 */
const DataAnalysis = () => {
  // State for filters
  const [filters, setFilters] = useState({
    city: 'All Cities',
    startDate: '',
    endDate: '',
    bucketId: 'All Routes',
    dusthandName: 'All Dusthands',
    wasteType: 'All Types'
  });

  // State for filter options (loaded from API)
  const filterOptions = {
    cities: ['All Cities', 'Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna'],
    routes: ['All Routes', 'Route 1', 'Route 2', 'Route 3', 'Route 4', 'Route 5'],
    dusthands: ['All Dusthands', 'John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Brown'],
    wasteTypes: ['All Types', 'Recyclable', 'Organic', 'Hazardous', 'General']
  };

  // State for chart data
  const [chartData, setChartData] = useState({
    wasteVolumeOverTime: null,
    collectionPerformance: null
  });

  // State for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dropdown states
  const [dropdownStates, setDropdownStates] = useState({
    city: false,
    bucketId: false,
    dusthandName: false,
    wasteType: false
  });

  // Refs for click outside detection
  const dropdownRefs = {
    city: useRef(null),
    bucketId: useRef(null),
    dusthandName: useRef(null),
    wasteType: useRef(null)
  };

  /**
   * Initialize component and load initial data  
   */
  useEffect(() => {
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    setFilters(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }));
  }, []);

  // Separate effect to handle initial data loading
  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      handleApplyFilters();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate]);

  /**
   * Handle click outside dropdowns to close them
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs.current).forEach(key => {
        if (dropdownRefs.current[key] && !dropdownRefs.current[key].contains(event.target)) {
          setDropdownStates(prev => ({ ...prev, [key]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handle filter input changes
   */
  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  /**
   * Toggle dropdown visibility
   */
  const toggleDropdown = (dropdownKey) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdownKey]: !prev[dropdownKey]
    }));
  };

  /**
   * Generate sample waste volume over time data
   */
  const generateWasteVolumeData = useCallback(async () => {
    const labels = [];
    const data = [];
    
    // Generate last 30 days of data
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Generate realistic waste volume data (50-150 tons)
      const baseVolume = 80;
      const variation = Math.sin(i * 0.2) * 20 + Math.random() * 30;
      data.push(Math.max(50, baseVolume + variation));
    }

    return {
      labels,
      datasets: [
        {
          label: 'Waste Volume (tons)',
          data,
          borderColor: Colors.primary,
          backgroundColor: `${Colors.primary}20`,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: Colors.primary,
          pointBorderColor: Colors.white,
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };
  }, []);

  /**
   * Generate sample collection performance data
   */
  const generatePerformanceData = useCallback(async () => {
    return {
      labels: ['Completed', 'In Progress', 'Delayed', 'Cancelled'],
      datasets: [
        {
          data: [85, 10, 3, 2],
          backgroundColor: [
            Colors.success,
            Colors.warning,
            Colors.danger,
            Colors.secondary
          ],
          borderColor: Colors.white,
          borderWidth: 2,
          hoverOffset: 4
        }
      ]
    };
  }, []);

  /**
   * Apply filters and fetch data
   */
  const handleApplyFilters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Applying filters:', filters);

      // Simulate API call for waste volume data
      const wasteVolumeData = await generateWasteVolumeData();
      const performanceData = await generatePerformanceData();

      setChartData({
        wasteVolumeOverTime: wasteVolumeData,
        collectionPerformance: performanceData
      });

      console.log('✅ Data analysis loaded successfully');
    } catch (err) {
      console.error('❌ Error loading data analysis:', err);
      setError('Failed to load analysis data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, generateWasteVolumeData, generatePerformanceData]);

  /**
   * Reset all filters
   */
  const handleResetFilters = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    setFilters({
      city: 'All Cities',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      bucketId: 'All Routes',
      dusthandName: 'All Dusthands',
      wasteType: 'All Types'
    });

    // Reload data with reset filters
    setTimeout(handleApplyFilters, 100);
  };

  /**
   * Chart options for waste volume over time
   */
  const wasteVolumeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false
      },
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: Colors.dark,
        titleColor: Colors.white,
        bodyColor: Colors.white,
        borderColor: Colors.primary,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Volume: ${context.parsed.y.toFixed(1)} tons`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: Colors.textSecondary,
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: `${Colors.textSecondary}20`
        },
        ticks: {
          color: Colors.textSecondary,
          font: {
            size: 12
          },
          callback: function(value) {
            return value + 't';
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  /**
   * Chart options for collection performance pie chart
   */
  const performanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false
      },
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12
          },
          color: Colors.textPrimary
        }
      },
      tooltip: {
        backgroundColor: Colors.dark,
        titleColor: Colors.white,
        bodyColor: Colors.white,
        borderColor: Colors.primary,
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}%`;
          }
        }
      }
    }
  };

  /**
   * Render dropdown component
   */
  const renderDropdown = (key, label, icon, options) => (
    <div className="filter-field" ref={(el) => dropdownRefs.current[key] = el}>
      <label className="filter-label">
        {icon}
        {label}
      </label>
      <div className="custom-dropdown">
        <button
          className={`dropdown-trigger ${dropdownStates[key] ? 'active' : ''}`}
          onClick={() => toggleDropdown(key)}
        >
          <span>{filters[key]}</span>
          <ChevronDown size={16} />
        </button>
        {dropdownStates[key] && (
          <div className="dropdown-menu">
            {options.map((option, index) => (
              <div
                key={index}
                className={`dropdown-item ${filters[key] === option ? 'selected' : ''}`}
                onClick={() => {
                  handleFilterChange(key, option);
                  setDropdownStates(prev => ({ ...prev, [key]: false }));
                }}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="data-analysis-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">
              <BarChart3 size={32} />
              Data Analysis
            </h1>
          </div>
          <div className="header-right">
            <button className="icon-button" title="Filter and data for detailed insights">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-grid">
          {/* City Filter */}
          {renderDropdown('city', 'City', <MapPin size={16} />, filterOptions.cities)}

          {/* Start Date */}
          <div className="filter-field">
            <label className="filter-label">
              <Calendar size={16} />
              Start Date
            </label>
            <input
              type="date"
              className="filter-input"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          {/* End Date */}
          <div className="filter-field">
            <label className="filter-label">
              <Calendar size={16} />
              End Date
            </label>
            <input
              type="date"
              className="filter-input"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          {/* Bucket ID (Routes) */}
          {renderDropdown('bucketId', 'Bucket ID', <Trash2 size={16} />, filterOptions.routes)}

          {/* Dusthand Name */}
          {renderDropdown('dusthandName', 'Dusthand Name', <Users size={16} />, filterOptions.dusthands)}

          {/* Waste Type */}
          {renderDropdown('wasteType', 'Waste Type', <Trash2 size={16} />, filterOptions.wasteTypes)}
        </div>

        {/* Action Buttons */}
        <div className="filter-actions">
          <button
            className="btn btn-primary"
            onClick={handleApplyFilters}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="spinning" />
                Loading...
              </>
            ) : (
              <>
                <Search size={16} />
                Apply Filters
              </>
            )}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleResetFilters}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Data Visualization Section */}
      <div className="visualization-section">
        <div className="section-header">
          <h2>Data Visualization</h2>
          <div className="chart-actions">
            <button className="chart-action-btn active">
              <TrendingUp size={16} />
              Line Chart
            </button>
            <button className="chart-action-btn">
              <BarChart3 size={16} />
              Bar Chart
            </button>
          </div>
        </div>

        <div className="charts-grid">
          {/* Waste Volume Over Time Chart */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Waste Volume Over Time</h3>
              <div className="chart-info">
                <TrendingUp size={16} />
                <span>Sample data visualization</span>
              </div>
            </div>
            <div className="chart-content">
              {chartData.wasteVolumeOverTime ? (
                <div className="chart-wrapper">
                  <Line 
                    data={chartData.wasteVolumeOverTime} 
                    options={wasteVolumeOptions}
                  />
                </div>
              ) : (
                <div className="chart-placeholder">
                  <TrendingUp size={48} />
                  <p>Hover over data points for detailed information</p>
                </div>
              )}
            </div>
          </div>

          {/* Average Collection Performance Chart */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Average Collection Performance</h3>
              <div className="chart-info">
                <PieChart size={16} />
                <span>Collection efficiency metrics</span>
              </div>
            </div>
            <div className="chart-content">
              {chartData.collectionPerformance ? (
                <div className="chart-wrapper">
                  <Pie 
                    data={chartData.collectionPerformance} 
                    options={performanceOptions}
                  />
                </div>
              ) : (
                <div className="chart-placeholder">
                  <PieChart size={48} />
                  <p>Click chart elements to drill down into specific data</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataAnalysis;