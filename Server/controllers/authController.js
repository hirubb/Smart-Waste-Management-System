const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


//generate token 
const generateToken = (user) => {
return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
expiresIn: process.env.JWT_EXPIRES_IN || '7d',
});
};


//register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, address, contactNumber, location } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'resident',
      address,
      contactNumber,
      location
    });

    await user.save();

    // Generate JWT
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        contactNumber: user.contactNumber
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration', 
      error: error.message 
    });
  }
};


//login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    // Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check account status
    if (user.accountStatus === 'inactive') {
      return res.status(403).json({ 
        success: false,
        message: 'Account is inactive. Please contact support.' 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        contactNumber: user.contactNumber
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login', 
      error: error.message 
    });
  }
};

exports.me = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        address: req.user.address,
        contactNumber: req.user.contactNumber
      }
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all collectors
exports.getAllCollectors = async (req, res) => {
  try {
    // Find all users with role "collector" and active status
    const collectors = await User.find({ role: "collector", accountStatus: "active" })
      .select("-password") // exclude password field for security
      .sort({ createdAt: -1 }); // newest first

    if (!collectors.length) {
      return res.status(404).json({
        success: false,
        message: "No collectors found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Collectors retrieved successfully",
      collectors,
    });
  } catch (error) {
    console.error("Error fetching collectors:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching collectors",
      error: error.message,
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, contactNumber, address } = req.body;
    
    // Get user ID from auth middleware
    const userId = req.user._id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use"
        });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (contactNumber) user.contactNumber = contactNumber;
    if (address) user.address = address;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        contactNumber: user.contactNumber
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: error.message
    });
  }
};