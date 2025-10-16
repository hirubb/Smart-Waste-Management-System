/**
 * Authentication Controller
 * 
 * Purpose: Handle authentication operations
 * Responsibilities:
 * - User registration and login
 * - Token generation and validation
 * - Hardcoded waste manager authentication
 * 
 * @module authController
 * @author Smart Waste Management System
 * @since 2025-10-15
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Hardcoded waste manager credentials
 * Following Single Responsibility Principle: Credential validation separate from auth logic
 * @constant
 * @type {Object}
 */
const WASTE_MANAGER_CREDENTIALS = {
  username: 'wastemanager',
  password: '123456',
  user: {
    id: 'waste_manager_001',
    name: 'Waste Manager',
    email: 'wastemanager@system.local',
    role: 'waste_manager',
    accountStatus: 'active'
  }
};

/**
 * Validates waste manager credentials
 * Follows Single Responsibility Principle: Only validates credentials
 * 
 * @param {string} identifier - Username or email
 * @param {string} password - Password
 * @returns {boolean} - True if credentials match
 */
const isWasteManagerCredentials = (identifier, password) => {
  return (
    identifier === WASTE_MANAGER_CREDENTIALS.username &&
    password === WASTE_MANAGER_CREDENTIALS.password
  );
};

/**
 * Generates JWT token for user
 * Follows Single Responsibility Principle: Only handles token generation
 * 
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
  return jwt.sign({ id: user._id || user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};


/**
 * User registration endpoint
 * Follows Single Responsibility Principle: Only handles user registration
 * 
 * @route POST /auth/register
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - User's name
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password
 * @param {string} req.body.role - User's role (optional, defaults to 'resident')
 * @param {string} req.body.address - User's address
 * @param {string} req.body.contactNumber - User's contact number
 * @param {Object} req.body.location - User's location coordinates
 * @param {Object} res - Express response object
 */
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


/**
 * User login endpoint
 * Supports both regular users and hardcoded waste manager
 * Follows Open/Closed Principle: Open for extension, closed for modification
 * 
 * @route POST /auth/login
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User email or username
 * @param {string} req.body.password - User password
 * @param {Object} res - Express response object
 */
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

    // Check for hardcoded waste manager credentials first
    if (isWasteManagerCredentials(email, password)) {
      // Generate token for waste manager
      const token = generateToken(WASTE_MANAGER_CREDENTIALS.user);

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: WASTE_MANAGER_CREDENTIALS.user.id,
          name: WASTE_MANAGER_CREDENTIALS.user.name,
          email: WASTE_MANAGER_CREDENTIALS.user.email,
          role: WASTE_MANAGER_CREDENTIALS.user.role
        }
      });
    }

    // Regular user authentication
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

/**
 * Get current user endpoint
 * Returns authenticated user's information
 * 
 * @route GET /auth/me
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from auth middleware
 * @param {Object} res - Express response object
 */
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

/**
 * Get all collectors endpoint
 * Returns list of active waste collectors
 * Follows Interface Segregation Principle: Returns only necessary data
 * 
 * @route GET /auth/collectors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
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

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password"
      });
    }

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

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while changing password",
      error: error.message
    });
  }
};