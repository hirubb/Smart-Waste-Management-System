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
 * Creates a mock authentication response for waste manager
 * Follows Interface Segregation Principle: Returns only necessary data
 * 
 * @returns {Object} - Mock auth response with token and user data
 */
export const createWasteManagerAuthResponse = () => {
  // Generate a mock token (in production, this would come from backend)
  const mockToken = `waste_manager_token_${Date.now()}`;

  return {
    success: true,
    token: mockToken,
    user: {
      id: "waste_manager_001",
      name: HARDCODED_CREDENTIALS.WASTE_MANAGER.name,
      email: "wastemanager@system.local",
      role: HARDCODED_CREDENTIALS.WASTE_MANAGER.role,
    },
  };
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
    return response;
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
    // Return immediate success for hardcoded waste manager
    return createWasteManagerAuthResponse();
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
