const express = require('express');
const router = express.Router();
const {
  getAllDustbins,
  getDustbinById,
  createDustbin,
  updateDustbin,
  deleteDustbin,
  getDustbinsByStatus
} = require('../controllers/dustbinController');
const auth = require('../middleware/auth');

// Public routes (or you can protect them with auth middleware)
router.get('/', getAllDustbins);
router.get('/status/:status', getDustbinsByStatus);
router.get('/:id', getDustbinById);

// Protected routes
router.post('/', auth(), createDustbin);
router.put('/:id', auth(), updateDustbin);
router.delete('/:id', auth(), deleteDustbin);

module.exports = router;

