const mongoose = require('mongoose');

const collectionRequestSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  binId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'WasteBin' 
  },
  quantity:{
    type: Number,
    default: 0
  },
  requestType: { 
    type: String, 
    enum: ['regular', 'special'], 
    required: true,
    default: 'regular'
  },
  wasteCategory: { 
    type: String, 
    enum: ['general', 'recyclable', 'organic', 'hazardous', 'bulky', 'electronic', 'medical'], 
    required: true 
  },
  scheduledDate: { 
    type: Date, 
    required: true 
  },
  scheduledTime: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  assignedCollector: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  estimatedCost: { 
    type: Number,
    default: 0
  },
  actualCost: { 
    type: Number 
  },
  weight: {
    type: Number,
    unit: {
      type: String,
      default: 'kg'
    }
  },
  notes: { 
    type: String 
  },
  pickupLocation: {
    address: String,
    latitude: Number,
    longitude: Number
  },
  completedAt: { 
    type: Date 
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: String,
  collectorNotes: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String
}, { 
  timestamps: true 
});

// Calculate cost based on waste type and weight
collectionRequestSchema.methods.calculateCost = function() {
  const basePrices = {
    general: 100,
    recyclable: 80,
    organic: 90,
    hazardous: 200,
    bulky: 150,
    electronic: 180,
    medical: 250
  };
  
  let cost = basePrices[this.wasteCategory] || 100;
  
  if (this.requestType === 'special') {
    cost *= 1.5;
  }
  
  if (this.weight) {
    cost += this.weight * 10;
  }
  
  this.estimatedCost = Math.round(cost);
  return this.estimatedCost;
};

module.exports = mongoose.model('CollectionRequest', collectionRequestSchema);