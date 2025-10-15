const mongoose = require('mongoose');

const dustbinSchema = new mongoose.Schema({
  binId: {
    type: String,
    required: [true, 'Bin ID is required'],
    unique: true,
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  fillPercentage: {
    type: Number,
    required: [true, 'Fill percentage is required'],
    min: 0,
    max: 150,
    default: 0
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required']
  },
  status: {
    type: String,
    enum: ['Empty', 'Half Full', 'Full', 'Overflow'],
    default: 'Empty'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Update status based on fill percentage before saving
dustbinSchema.pre('save', function(next) {
  if (this.fillPercentage <= 25) {
    this.status = 'Empty';
  } else if (this.fillPercentage <= 75) {
    this.status = 'Half Full';
  } else if (this.fillPercentage <= 100) {
    this.status = 'Full';
  } else {
    this.status = 'Overflow';
  }
  next();
});

module.exports = mongoose.model('Dustbin', dustbinSchema);

