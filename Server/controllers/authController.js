const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Collector = require('../models/Collector');

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

const isWasteManagerCredentials = (identifier, password) => {
  return (
      identifier === WASTE_MANAGER_CREDENTIALS.username &&
      password === WASTE_MANAGER_CREDENTIALS.password
  );
};

const generateToken = (user) => {
  return jwt.sign({ id: user._id || user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Register user and optionally create collector profile
 */
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      address,
      contactNumber,
      location,
      // Collector-specific fields (optional)
      vehicleId,
      vehicleType,
      vehicleCapacity
    } = req.body;

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

    // If registering as collector, create collector profile
    let collectorProfile = null;
    if (role === 'collector' && vehicleId) {
      collectorProfile = new Collector({
        userId: user._id,
        vehicleId,
        vehicleType: vehicleType || 'Truck',
        vehicleCapacity: vehicleCapacity || 1000,
        status: 'Available',
        workload: '0%'
      });
      await collectorProfile.save();
    }

    // Generate JWT
    const token = generateToken(user);

    const response = {
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
    };

    // Include collector profile if created
    if (collectorProfile) {
      response.collectorProfile = {
        id: collectorProfile._id,
        vehicleId: collectorProfile.vehicleId,
        vehicleType: collectorProfile.vehicleType,
        status: collectorProfile.status
      };
    }

    res.status(201).json(response);
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
 * Login and include collector profile if user is a collector
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for hardcoded waste manager
    if (isWasteManagerCredentials(email, password)) {
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // If user is a collector, fetch their profile
    let collectorProfile = null;
    if (user.role === 'collector') {
      collectorProfile = await Collector.findOne({ userId: user._id })
          .populate('assignedRoute', 'routeName routeCode');
    }

    const token = generateToken(user);

    const response = {
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
    };

    // Include collector profile if exists
    if (collectorProfile) {
      response.collectorProfile = {
        id: collectorProfile._id,
        status: collectorProfile.status,
        currentLocation: collectorProfile.currentLocation,
        workload: collectorProfile.workload,
        vehicleId: collectorProfile.vehicleId,
        vehicleType: collectorProfile.vehicleType,
        assignedRoute: collectorProfile.assignedRoute
      };
    }

    res.json(response);
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
 * Get current user with collector profile if applicable
 */
exports.me = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const user = req.user;

    // If user is a collector, fetch their profile
    let collectorProfile = null;
    if (user.role === 'collector') {
      collectorProfile = await Collector.findOne({ userId: user._id })
          .populate('assignedRoute', 'routeName routeCode');
    }

    const response = {
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        contactNumber: user.contactNumber,
        accountStatus: user.accountStatus
      }
    };

    if (collectorProfile) {
      response.collectorProfile = collectorProfile;
    }

    res.json(response);
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};  // Update user profile
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

