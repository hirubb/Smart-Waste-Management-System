const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeName: { 
    type: String, 
    required: true,
    trim: true
  },
  routeCode: {
    type: String,
    unique: true,
    required: true
  },
  area: { 
    type: String, 
    required: true 
  },
  collectionPoints: [{
    binId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'WasteBin' 
    },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String }
    },
    order: { type: Number },
    estimatedArrivalTime: String,
    actualArrivalTime: Date,
    collectionStatus: {
      type: String,
      enum: ['pending', 'collected', 'skipped'],
      default: 'pending'
    }
  }],
  assignedCollector: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  vehicleDetails: {
    vehicleId: String,
    vehicleType: String,
    capacity: Number,
    currentLoad: {
      type: Number,
      default: 0
    }
  },
  estimatedTime: { 
    type: Number,
    default: 0
  },
  actualTime: {
    type: Number
  },
  estimatedDistance: { 
    type: Number,
    default: 0
  },
  actualDistance: {
    type: Number
  },
  status: { 
    type: String, 
    enum: ['active', 'optimized', 'in-progress', 'completed', 'cancelled'], 
    default: 'active' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  optimizedAt: { 
    type: Date 
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  optimizationMetrics: {
    fuelSaved: Number,
    timeSaved: Number,
    distanceReduced: Number
  },
  scheduleDate: Date,
  notes: String
}, { 
  timestamps: true 
});

// Optimize route using simple algorithm
routeSchema.methods.optimize = function() {
  // Sort collection points by priority (bins with higher levels first)
  this.collectionPoints.sort((a, b) => {
    return (b.binLevel || 0) - (a.binLevel || 0);
  });
  
  // Update order
  this.collectionPoints.forEach((point, index) => {
    point.order = index + 1;
  });
  
  // Reduce estimated time by 15%
  const oldTime = this.estimatedTime;
  const oldDistance = this.estimatedDistance;
  
  this.estimatedTime = Math.floor(this.estimatedTime * 0.85);
  this.estimatedDistance = Math.floor(this.estimatedDistance * 0.9);
  
  this.optimizationMetrics = {
    timeSaved: oldTime - this.estimatedTime,
    distanceReduced: oldDistance - this.estimatedDistance,
    fuelSaved: Math.floor((oldDistance - this.estimatedDistance) * 0.1)
  };
  
  this.status = 'optimized';
  this.optimizedAt = Date.now();
  
  return this;
};

module.exports = mongoose.model('Route', routeSchema);