// routes/monitoringRoutes.js
const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');
// const auth = require('../middleware/auth'); // Uncomment if you want authentication

/**
 * @route   GET /api/monitoring/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Public (add auth middleware for protection)
 */
router.get('/dashboard/stats', monitoringController.getDashboardStats);

/**
 * @route   GET /api/monitoring/vehicles/live
 * @desc    Get live vehicle positions
 * @access  Public
 */
router.get('/vehicles/live', monitoringController.getLiveVehiclePositions);

/**
 * @route   GET /api/monitoring/routes/active
 * @desc    Get active routes with progress
 * @access  Public
 */
router.get('/routes/active', monitoringController.getActiveRoutes);

/**
 * @route   GET /api/monitoring/collector/:collectorId/performance
 * @desc    Get collector performance metrics
 * @access  Public
 */
router.get('/collector/:collectorId/performance', monitoringController.getCollectorPerformance);

/**
 * @route   PUT /api/monitoring/vehicle/:collectorId/location
 * @desc    Update vehicle GPS location
 * @access  Public (should be authenticated in production)
 */
router.put('/vehicle/:collectorId/location', monitoringController.updateVehicleLocation);

/**
 * @route   GET /api/monitoring/route/:routeId/tracking
 * @desc    Get detailed route tracking
 * @access  Public
 */
router.get('/route/:routeId/tracking', monitoringController.getRouteTracking);

/**
 * @route   GET /api/monitoring/alerts
 * @desc    Get system alerts and notifications
 * @access  Public
 */
router.get('/alerts', monitoringController.getAlerts);

module.exports = router;