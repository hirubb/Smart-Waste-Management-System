const express = require('express');
const router = express.Router();
const collectorController = require('../controllers/Collector');

// GET all collectors
router.get('/', collectorController.getAllCollectors);

// GET single collector
router.get('/:id', collectorController.getCollectorById);

// POST create collector
router.post('/create', collectorController.createCollector);

// PUT update collector
router.put('/:id', collectorController.updateCollector);

// DELETE collector
router.delete('/:id', collectorController.deleteCollector);

module.exports = router;
