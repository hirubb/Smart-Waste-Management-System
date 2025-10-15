/**
 * Authentication Service
 * 
 * Purpose: Handle authentication logic and credential validation
 * Follows Single Responsibility Principle: Only handles authentication logic
 * Follows Open/Closed Principle: Open for extension, closed for modification
 * 
 * @module authService
 * @author Smart Waste Management System
 * @since 2025-10-15
 */

import API from "./api";

/**
 * Hardcoded credentials for waste manager
 * Following security best practices: In production, move to environment variables
 * @constant
 * @type {Object}
 */
const HARDCODED_CREDENTIALS = {
  WASTE_MANAGER: {
    username: "wastemanager",
    password: "123456",
    role: "waste_manager",
    name: "Waste Manager",
  },
};

/**
 * Validates if credentials match hardcoded waste manager account
 * 
 * @param {string} username - The username to validate
 * @param {string} password - The password to validate
 * @returns {boolean} - True if credentials match, false otherwise
 */
export const isWasteManagerCredentials = (username, password) => {
  return (
    username === HARDCODED_CREDENTIALS.WASTE_MANAGER.username &&
    password === HARDCODED_CREDENTIALS.WASTE_MANAGER.password
  );
};

/**
 * Creates authentication response for waste manager by calling backend
 * Now properly generates a JWT token from the backend
 * 
 * @returns {Promise<Object>} - Auth response with real JWT token and user data
 */
export const createWasteManagerAuthResponse = async () => {
  try {
    // Call backend to get a real JWT token for waste manager
    const response = await API.post("/auth/login", {
      email: HARDCODED_CREDENTIALS.WASTE_MANAGER.username,
      password: HARDCODED_CREDENTIALS.WASTE_MANAGER.password,
      isWasteManager: true // Flag to indicate this is the waste manager
    });
    
    return {
      success: true,
      token: response.data.token,
      user: response.data.user || {
        id: "waste_manager_001",
        name: HARDCODED_CREDENTIALS.WASTE_MANAGER.name,
        email: "wastemanager@system.local",
        role: HARDCODED_CREDENTIALS.WASTE_MANAGER.role,
      },
    };
  } catch (error) {
    // If backend call fails, throw error
    console.error("Failed to authenticate waste manager with backend:", error);
    throw new Error("Failed to authenticate waste manager. Please try again.");
  }
};

/**
 * Authenticates user with backend API
 * Follows Dependency Inversion Principle: Depends on abstraction (API)
 * 
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} - Authentication response from backend
 * @throws {Error} - If authentication fails
 */
export const authenticateWithBackend = async (email, password) => {
  try {
    const response = await API.post("/auth/login", { email, password });
    
    // Return the data directly, not the whole response
    return {
      success: true,
      token: response.data.token,
      user: response.data.user
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Main login handler that supports both backend and hardcoded credentials
 * Follows Open/Closed Principle: Can be extended without modifying existing code
 * 
 * @param {string} identifier - Email or username
 * @param {string} password - User's password
 * @returns {Promise<Object>} - Authentication response
 * @throws {Error} - If authentication fails
 */
export const login = async (identifier, password) => {
  // Check if credentials match waste manager
  if (isWasteManagerCredentials(identifier, password)) {
    // Get real JWT token from backend for waste manager
    return await createWasteManagerAuthResponse();
  }

  // Otherwise, authenticate with backend
  return await authenticateWithBackend(identifier, password);
};

/**
 * AuthService class - Encapsulates authentication operations
 * Follows Single Responsibility Principle: Only handles auth operations
 */
class AuthService {
  /**
   * Validates if the provided credentials are for waste manager
   * @param {string} username - Username to validate
   * @param {string} password - Password to validate
   * @returns {boolean} - Validation result
   */
  static validateWasteManagerCredentials(username, password) {
    return isWasteManagerCredentials(username, password);
  }

  /**
   * Gets waste manager user data
   * @returns {Object} - Waste manager user data
   */
  static getWasteManagerData() {
    return {
      name: HARDCODED_CREDENTIALS.WASTE_MANAGER.name,
      role: HARDCODED_CREDENTIALS.WASTE_MANAGER.role,
    };
  }
}

export default AuthService;
