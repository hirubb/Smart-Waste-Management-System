/**
 * Authentication Context
 * 
 * Purpose: Provides authentication state and methods across the application
 * Follows Single Responsibility Principle: Manages authentication state only
 * Follows Dependency Inversion Principle: Depends on abstractions (authService)
 * 
 * @module AuthContext
 * @author Smart Waste Management System
 * @since 2025-10-15
 */

import React, { createContext, useState, useEffect } from "react";
import API from "../services/api";
import { login as authServiceLogin } from "../services/authService";

export const AuthContext = createContext();

/**
 * AuthProvider Component
 * Provides authentication context to child components
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Effect: Initialize authentication state from localStorage
   * Validates existing token on component mount
   */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
      // Special handling for waste manager (hardcoded credentials)
      if (role === "waste_manager") {
        // Restore waste manager session without API call
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (error) {
            console.error("Error parsing stored user:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("user");
          }
        }
        setLoading(false);
      } else {
        // Regular user - validate with backend
        API.get("/auth/me")
          .then((res) => {
            setUser(res.data.user);
            // Update stored role if needed
            if (res.data.user.role) {
              localStorage.setItem("role", res.data.user.role);
            }
          })
          .catch(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("user");
          })
          .finally(() => setLoading(false));
      }
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * Login function - Authenticates user with email/username and password
   * Supports both backend authentication and hardcoded waste manager credentials
   * 
   * @param {string} identifier - Email or username
   * @param {string} password - User's password
   * @throws {Error} - If authentication fails
   */
  const login = async (identifier, password) => {
    try {
      // Use authService for login (handles both hardcoded and backend auth)
      const authResponse = await authServiceLogin(identifier, password);
      
      // Store authentication data
      localStorage.setItem("token", authResponse.token);
      localStorage.setItem("role", authResponse.user.role);
      
      // For waste manager, also store user data for session restoration
      if (authResponse.user.role === "waste_manager") {
        localStorage.setItem("user", JSON.stringify(authResponse.user));
      }
      
      setUser(authResponse.user);
    } catch (error) {
      // Re-throw error for component to handle
      throw error;
    }
  };

  /**
   * Register function - Creates new user account
   * 
   * @param {Object} form - Registration form data
   * @throws {Error} - If registration fails
   */
  const register = async (form) => {
    const res = await API.post("/auth/register", form);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.user.role);
    setUser(res.data.user);
  };

  /**
   * Logout function - Clears authentication state
   * Removes all stored authentication data
   */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user"); // Also remove stored user data
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
