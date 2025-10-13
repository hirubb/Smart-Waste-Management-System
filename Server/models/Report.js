const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    enum: ['monthly', 'weekly', 'yearly', 'custom', 'collector-performance', 'area-analysis'],
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  period: {
    startDate: Date,
    endDate: Date,
    month: Number,
    year: Number
  },
  data: {
    totalCollections: Number,
    completedCollections: Number,
    pendingCollections: Number,
    cancelledCollections: Number,
    totalWasteCollected: Number,
    wasteByType: Map,
    areaStats: Map,
    collectorPerformance: Array,
    revenueGenerated: Number,
    averageCollectionTime: Number,
    routeEfficiency: Number
  },
  highWasteAreas: [{
    area: String,
    totalCollections: Number,
    wasteVolume: Number,
    recommendations: String
  }],
  recommendations: [String],
  exportFormat: {
    type: String,
    enum: ['pdf', 'excel', 'json'],
    default: 'pdf'
  },
  filePath: String,
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);