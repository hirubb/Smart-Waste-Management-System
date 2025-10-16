const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['resident', 'business', 'collector', 'authority', 'waste_manager'],
    default: 'resident'
  },
  address: {
    type: String,
    required: function() {
      return this.role === 'resident' || this.role === 'business';
    }
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required']
  },
  accountStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  // Remove collector-specific fields - they belong in CollectorProfile
  // assignedRoutes, workload should NOT be here
}, {
  timestamps: true
});

// Virtual to get collector profile if user is a collector
userSchema.virtual('collectorProfile', {
  ref: 'Collector',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

// Enable virtuals in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);