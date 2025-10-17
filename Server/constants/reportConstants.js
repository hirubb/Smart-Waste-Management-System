/**
 * Report Constants
 * 
 * Purpose: Centralize all magic numbers and configuration values used in reporting
 * 
 * @module reportConstants
 * @author Smart Waste Management System
 * @since 2025-10-17
 */

/**
 * Performance thresholds for waste collection operations
 */
const PERFORMANCE_THRESHOLDS = {
  // Minimum acceptable completion rate percentage for collectors
  MIN_COMPLETION_RATE: 85,
  
  // Excellent completion rate threshold for performance recognition
  EXCELLENT_COMPLETION_RATE: 95,
  
  // Bin fill level that triggers collection requirement (percentage)
  BIN_COLLECTION_LEVEL: 80,
  
  // Maximum acceptable collection time in hours
  MAX_COLLECTION_TIME_HOURS: 48,
  
  // Minimum bin activity rate for infrastructure health (percentage)
  MIN_BIN_ACTIVITY_RATE: 0.9, // 90%
  
  // Hazardous waste threshold as percentage of total collections
  HAZARDOUS_WASTE_THRESHOLD: 0.1 // 10%
};

/**
 * Report configuration settings
 */
const REPORT_CONFIG = {
  // Default number of top waste areas to include in reports
  DEFAULT_TOP_AREAS_COUNT: 10,
  
  // Default pagination limit for report history
  DEFAULT_PAGINATION_LIMIT: 10,
  
  // Revenue per collection baseline for recommendations
  REVENUE_PER_COLLECTION_BASELINE: 100,
  
  // Time conversion constants
  MILLISECONDS_TO_HOURS: 1000 * 60 * 60,
  DAYS_IN_WEEK: 7
};

/**
 * Standard waste types recognized by the system
 */
const WASTE_TYPES = {
  GENERAL: 'general',
  RECYCLABLE: 'recyclable',
  ORGANIC: 'organic',
  HAZARDOUS: 'hazardous',
  ELECTRONIC: 'electronic'
};

/**
 * Collection status options
 */
const COLLECTION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

/**
 * Report types supported by the system
 */
const REPORT_TYPES = {
  MONTHLY: 'monthly',
  CUSTOM: 'custom',
  PERFORMANCE: 'performance',
  AREA_ANALYSIS: 'area_analysis'
};

/**
 * Priority levels for recommendations
 */
const PRIORITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

/**
 * Recommendation categories
 */
const RECOMMENDATION_CATEGORIES = {
  ROUTE_OPTIMIZATION: 'Route Optimization',
  OPERATIONAL_EFFICIENCY: 'Operational Efficiency',
  PERFORMANCE: 'Performance',
  SAFETY: 'Safety',
  INFRASTRUCTURE: 'Infrastructure',
  RESPONSE_TIME: 'Response Time',
  REVENUE: 'Revenue'
};

module.exports = {
  PERFORMANCE_THRESHOLDS,
  REPORT_CONFIG,
  WASTE_TYPES,
  COLLECTION_STATUS,
  REPORT_TYPES,
  PRIORITY_LEVELS,
  RECOMMENDATION_CATEGORIES
};