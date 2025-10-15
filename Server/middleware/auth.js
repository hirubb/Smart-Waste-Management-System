const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 * Supports role-based access control
 * Handles both regular users and hardcoded waste manager
 */
const auth = (roles = []) => {
  // roles param can be a single role string or an array of roles
  if (typeof roles === "string") {
    roles = [roles];
  }

  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ 
          success: false,
          message: "No token provided" 
        });
      }

      const token = authHeader.split(" ")[1];
      
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if this is a waste manager token (hardcoded user)
        if (payload.id === 'waste_manager_001') {
          // Create a mock user object for waste manager
          req.user = {
            _id: 'waste_manager_001',
            id: 'waste_manager_001',
            userId: 'waste_manager_001',
            name: 'Waste Manager',
            email: 'wastemanager@system.local',
            role: 'waste_manager'
          };
          
          // Role check for waste manager
          if (roles.length && !roles.includes('waste_manager')) {
            return res.status(403).json({ 
              success: false,
              message: "Forbidden: insufficient role" 
            });
          }
          
          return next();
        }
        
        // Regular user - fetch from database
        const user = await User.findById(payload.id).select("-password");
        
        if (!user) {
          return res.status(401).json({ 
            success: false,
            message: "User not found" 
          });
        }

        // Attach user to request
        req.user = user;

        // Role check (if roles provided)
        if (roles.length && !roles.includes(user.role)) {
          return res.status(403).json({ 
            success: false,
            message: "Forbidden: insufficient role" 
          });
        }

        next();
      } catch (jwtError) {
        console.error('JWT verification error:', jwtError.message);
        return res.status(401).json({ 
          success: false,
          message: "Invalid or expired token" 
        });
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ 
        success: false,
        message: "Authentication error" 
      });
    }
  };
};

module.exports = auth;
