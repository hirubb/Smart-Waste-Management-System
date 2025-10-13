const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  collectionRequestId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CollectionRequest', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  paymentMethod: { 
    type: String, 
    enum: ['card', 'mobile-money', 'cash', 'bank-transfer'], 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'], 
    default: 'pending' 
  },
  transactionId: { 
    type: String,
    unique: true,
    sparse: true
  },
  paymentDate: { 
    type: Date, 
    default: Date.now 
  },
  cardDetails: {
    lastFourDigits: String,
    cardType: String,
    expiryDate: String
  },
  mobileMoneyDetails: {
    provider: String,
    phoneNumber: String,
    referenceNumber: String
  },
  billingAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  invoiceNumber: {
    type: String,
    unique: true
  },
  paidAt: Date,
  refundedAt: Date,
  refundReason: String,
  failureReason: String
}, { 
  timestamps: true 
});

// Generate invoice number
paymentSchema.pre('save', function(next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);