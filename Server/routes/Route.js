const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');

router.get('/', routeController.getAllRoutes);

// GET single route
router.get('/:id', routeController.getRouteById);

// POST create route
router.post('/create', routeController.createRoute);

// POST optimize route
router.post('/:id/optimize', routeController.optimizeRoute);

// PUT accept optimized route
router.put('/:id/accept', routeController.acceptOptimizedRoute);

// POST assign collector to route
router.post('/:id/assign', routeController.assignCollector);

// POST start route
router.post('/:id/start', routeController.startRoute);

// POST complete route
router.post('/:id/complete', routeController.completeRoute);

// DELETE route
router.delete('/:id', routeController.deleteRoute);

module.exports = router;
