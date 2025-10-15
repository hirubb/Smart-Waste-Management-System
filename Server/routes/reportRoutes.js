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
  getAllReports
} = require('../controllers/reportController');

/**
 * @route   GET /api/reports
 * @desc    Get all reports with filters
 * @access  Protected (Waste Manager, Admin)
 * @query   reportType - Type of report (optional)
 * @query   startDate - Start date filter (optional)
 * @query   endDate - End date filter (optional)
 */
router.get('/', auth(), getAllReports);

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
 * @route   GET /api/reports/:id
 * @desc    Get report by ID
 * @access  Protected
 */
router.get('/:id', auth(), getReportById);

module.exports = router;
