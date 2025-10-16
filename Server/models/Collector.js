const mongoose = require('mongoose');

const collectorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Available', 'On Route', 'On Break', 'Offline'],
        default: 'Available'
    },
    currentLocation: {
        type: String,
        default: 'Base Station'
    },
    workload: {
        type: String,
        default: '0%'
    },
    assignedRoute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        default: null
    },
    vehicleId: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        enum: ['Truck', 'Van', 'Compact'],
        default: 'Truck'
    },
    assignedRoutes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route'
    }],
    completedRoutes: {
        type: Number,
        default: 0
    },
    totalDistance: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 5.0,
        min: 0,
        max: 5
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Update workload percentage
collectorSchema.methods.updateWorkload = function(routeCount) {
    const maxRoutes = 5; // Assume max 5 routes per collector
    const percentage = Math.min(100, (routeCount / maxRoutes) * 100);
    this.workload = `${Math.round(percentage)}%`;
    return this;
};

module.exports = mongoose.model('Collector', collectorSchema);
