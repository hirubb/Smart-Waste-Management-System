/**
 * Report Routes
 *
 * Purpose: Define API endpoints for waste management reports
 * Responsibilities:
 * - Route report generation requests
 * - Handle report retrieval
 * - Manage report exports
 *
 * @module reportRoutes
 * @author Smart Waste Management System
 * @since 2025-10-15
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  generateMonthlyReport,
  getCollectorPerformance,
  getAreaAnalysis,
  getReportById,
  getAllReports,
  generateCustomReport,
  getFilterOptions,
  getReportHistory,
  getReportDetails
} = require('../controllers/reportController');
//
// /**
//  * @route   GET /api/reports
//  * @desc    Get all reports with filters
//  * @access  Protected (Waste Manager, Admin)
//  * @query   reportType - Type of report (optional)
//  * @query   startDate - Start date filter (optional)
//  * @query   endDate - End date filter (optional)
router.get('/', auth(), getAllReports);
// // router.get('/', auth(), getAllReports);

/**
 * @route   GET /api/reports/monthly
 * @desc    Generate monthly waste collection report
 * @access  Protected (Waste Manager, Admin)
 * @query   month - Month number (1-12)
 * @query   year - Year (YYYY)
 */
router.get('/monthly', auth(), generateMonthlyReport);

/**
 * @route   GET /api/reports/collector-performance
 * @desc    Get collector performance report
 * @access  Protected (Waste Manager, Admin)
 */
router.get('/collector-performance', auth(), getCollectorPerformance);

/**
 * @route   GET /api/reports/area-analysis
 * @desc    Get area-wise waste analysis
 * @access  Protected (Waste Manager, Admin)
 */
router.get('/area-analysis', auth(), getAreaAnalysis);

/**
 * @route   GET /api/reports/filters/options
 * @desc    Get available filter options for custom reports
 * @access  Protected (Waste Manager, Admin)
 * @returns {Object} Available regions, waste types, collectors, and status options
 */
router.get('/filters/options', auth(), getFilterOptions);

/**
 * @route   POST /api/reports/custom
 * @desc    Generate customized report with filters
 * @access  Protected (Waste Manager, Admin)
 * @body    startDate - Start date for report period (required)
 * @body    endDate - End date for report period (required)
 * @body    regions - Array of regions to filter (optional)
 * @body    wasteTypes - Array of waste types to filter (optional)
 * @body    collectors - Array of collector IDs to filter (optional)
 * @body    status - Collection status filter (optional)
 * @body    reportName - Custom name for the report (optional)
 */
router.post('/custom', auth(), generateCustomReport);
/**
 * @route   GET /api/reports/history
 * @desc    Get report generation history with pagination
 * @access  Protected (Waste Manager, Admin)
 * @query   page - Page number (default: 1)
 * @query   limit - Reports per page (default: 10)
 * @query   reportType - Filter by report type (optional)
 * @query   startDate - Filter by start date (optional)
 * @query   endDate - Filter by end date (optional)
 */
router.get('/history', auth(), getReportHistory);

/**
 * @route   GET /api/reports/details/:reportId
 * @desc    Get detailed information about a specific report
 * @access  Protected (Waste Manager, Admin)
 * @param   reportId - Report ID
 */
router.get('/details/:reportId', auth(), getReportDetails);

/**
 * @route   GET /api/reports/:id
 * @desc    Get report by ID
 * @access  Protected
 */
router.get('/:id', auth(), getReportById);

module.exports = router;
