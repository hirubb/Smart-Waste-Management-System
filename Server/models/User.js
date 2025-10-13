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
    enum: ['resident', 'business', 'collector', 'authority'], 
    default: 'resident' 
  },
  address: { 
    type: String,
    // required: function() {
    //   return this.role === 'resident' || this.role === 'business';
    // }
  },
  contactNumber: { 
    type: String,
    // required: [true, 'Contact number is required']
  },
  accountStatus: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  assignedRoutes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  }],
  workload: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);