const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['dustbin', 'alert', 'system', 'status_update'],
    default: 'system'
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  },
  relatedId: {
    type: String // Can be dustbin ID, alert ID, etc.
  },
  binId: String,
  location: String,
  fillPercentage: Number,
  isRead: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);

