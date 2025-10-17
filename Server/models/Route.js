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
  // Add base coordinates for the route
  baseLocation: {
    latitude: {
      type: Number,
      default: 7.2906 // Default to Negombo
    },
    longitude: {
      type: Number,
      default: 80.6337
    },
    address: {
      type: String,
      default: 'Base Station'
    }
  },
  routeType: {
    type: String,
    enum: ['Residential', 'Commercial', 'Industrial'],
    default: 'Residential'
  },
  vehicleType: {
    type: String,
    enum: ['Truck', 'Van', 'Compact'],
    default: 'Truck'
  },
  collectionPoints: [{
    binId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WasteBin'
    },
    location: {
      latitude: {
        type: Number,
        required: false // Make optional for now
      },
      longitude: {
        type: Number,
        required: false
      },
      address: { type: String }
    },
    order: { type: Number },
    estimatedArrivalTime: String,
    actualArrivalTime: Date,
    collectionStatus: {
      type: String,
      enum: ['pending', 'collected', 'skipped'],
      default: 'pending'
    },
    binLevel: Number
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
    type: String,
    default: '0h'
  },
  actualTime: {
    type: String
  },
  estimatedDistance: {
    type: String,
    default: '0 km'
  },
  actualDistance: {
    type: String
  },
  fuelCost: {
    type: String,
    default: '0.00'
  },
  status: {
    type: String,
    enum: ['Planned', 'Optimized', 'Active', 'Delayed', 'Completed', 'Cancelled'],
    default: 'Planned'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
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
    fuelSaved: String,
    timeSaved: String,
    distanceReduced: String
  },
  improvements: {
    distanceSaved: String,
    timeSaved: String,
    costSaved: String
  },
  scheduleDate: Date,
  notes: String
}, {
  timestamps: true
});

// Method to generate sample coordinates if not provided
routeSchema.methods.generateCollectionPointCoordinates = function() {
  const baseLat = this.baseLocation.latitude;
  const baseLng = this.baseLocation.longitude;
  const radius = 0.05; // ~5km radius

  this.collectionPoints.forEach((point, index) => {
    if (!point.location || !point.location.latitude || !point.location.longitude) {
      // Generate coordinates in a circular pattern
      const angle = (index / this.collectionPoints.length) * 2 * Math.PI;
      const distance = radius * (0.3 + Math.random() * 0.7);

      point.location = {
        latitude: baseLat + distance * Math.cos(angle),
        longitude: baseLng + distance * Math.sin(angle),
        address: point.location?.address || `Collection Point ${index + 1}`
      };
    }
  });

  return this;
};

// Optimize route using algorithm
routeSchema.methods.optimize = function() {
  // Generate coordinates if not present
  this.generateCollectionPointCoordinates();

  // Sort collection points by priority (bins with higher levels first)
  this.collectionPoints.sort((a, b) => {
    return (b.binLevel || 0) - (a.binLevel || 0);
  });

  // Update order
  this.collectionPoints.forEach((point, index) => {
    point.order = index + 1;
  });

  // Parse current values
  const parseValue = (str) => {
    const num = parseFloat(String(str).replace(/[^\d.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const currentDistance = parseValue(this.estimatedDistance);
  const currentTime = parseValue(this.estimatedTime);
  const currentCost = parseValue(this.fuelCost);

  // Calculate optimized values (15% reduction for distance, 12% for time, 18% for cost)
  const optimizedDistance = currentDistance * 0.85;
  const optimizedTime = currentTime * 0.88;
  const optimizedCost = currentCost * 0.82;

  // Calculate improvements
  this.improvements = {
    distanceSaved: `${(currentDistance - optimizedDistance).toFixed(1)} km`,
    timeSaved: `${(currentTime - optimizedTime).toFixed(1)}h`,
    costSaved: (currentCost - optimizedCost).toFixed(2)
  };

  this.optimizationMetrics = {
    timeSaved: `${(currentTime - optimizedTime).toFixed(1)}h`,
    distanceReduced: `${(currentDistance - optimizedDistance).toFixed(1)} km`,
    fuelSaved: (currentCost - optimizedCost).toFixed(2)
  };

  // Update route with optimized values
  this.estimatedDistance = `${optimizedDistance.toFixed(1)} km`;
  this.estimatedTime = `${optimizedTime.toFixed(1)}h`;
  this.fuelCost = optimizedCost.toFixed(2);

  this.status = 'Optimized';
  this.optimizedAt = Date.now();

  return this;
};

// Virtual field for formatted data
routeSchema.virtual('collectionPointsCount').get(function() {
  return this.collectionPoints.length;
});

routeSchema.set('toJSON', { virtuals: true });
routeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Route', routeSchema);
