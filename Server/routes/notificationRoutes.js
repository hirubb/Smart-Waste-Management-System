const express = require('express');
const router = express.Router();
const {
  getAllNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
  markAllAsRead
} = require('../controllers/notificationController');

router.get('/', getAllNotifications);
router.post('/', createNotification);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;

