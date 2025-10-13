const mongoose = require('mongoose');

const wasteBinSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  binId: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  capacity: { 
    type: Number, 
    required: true,
    min: [1, 'Capacity must be at least 1 liter']
  },
  currentLevel: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
  },
  wasteType: { 
    type: String, 
    enum: ['general', 'recyclable', 'organic', 'hazardous'], 
    default: 'general' 
  },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String, required: true }
  },
  deviceStatus: { 
    type: String, 
    enum: ['active', 'inactive', 'maintenance'], 
    default: 'active' 
  },
  trackingDevice: {
    deviceId: String,
    lastSync: Date,
    batteryLevel: Number,
    signalStrength: String
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  alertThreshold: {
    type: Number,
    default: 80
  },
  lastCollectionDate: Date,
  collectionFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'bi-weekly', 'monthly'],
    default: 'weekly'
  }
}, { 
  timestamps: true 
});

// Alert when bin level exceeds threshold
wasteBinSchema.methods.needsCollection = function() {
  return this.currentLevel >= this.alertThreshold;
};

module.exports = mongoose.model('WasteBin', wasteBinSchema);