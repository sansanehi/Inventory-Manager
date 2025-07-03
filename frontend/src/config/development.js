const developmentConfig = {
  // API Configuration
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  API_VERSION: 'v1',
  
  // Feature Flags
  ENABLE_ANALYTICS: false,
  ENABLE_ERROR_TRACKING: true,
  ENABLE_PERFORMANCE_MONITORING: true,
  
  // Cache Configuration
  CACHE_DURATION: 60, // 1 minute in seconds
  MAX_CACHE_ITEMS: 100,
  
  // Security
  TOKEN_EXPIRY: 86400, // 24 hours in seconds
  REFRESH_TOKEN_EXPIRY: 604800, // 7 days in seconds
  
  // Performance
  LAZY_LOAD_THRESHOLD: 0.1,
  DEBOUNCE_DELAY: 100,
  
  // UI Configuration
  ITEMS_PER_PAGE: 10,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  
  // Error Messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
    SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    AUTH_ERROR: 'Your session has expired. Please log in again.',
  },
  
  // Success Messages
  SUCCESS_MESSAGES: {
    SAVE_SUCCESS: 'Changes saved successfully.',
    DELETE_SUCCESS: 'Item deleted successfully.',
    UPLOAD_SUCCESS: 'File uploaded successfully.',
  },
  
  // Analytics
  ANALYTICS_ID: null,
  
  // Feature Toggles
  FEATURES: {
    ENABLE_EXPORT: true,
    ENABLE_IMPORT: true,
    ENABLE_BULK_ACTIONS: true,
    ENABLE_ADVANCED_FILTERS: true,
    ENABLE_CUSTOM_REPORTS: true,
  },
  
  // Performance Monitoring
  PERFORMANCE: {
    ENABLE_MEASUREMENTS: true,
    SAMPLE_RATE: 1.0, // 100% of users
    REPORT_INTERVAL: 30000, // 30 seconds
  },
  
  // Error Tracking
  ERROR_TRACKING: {
    ENABLED: true,
    SAMPLE_RATE: 1.0, // 100% of errors
    IGNORE_PATTERNS: [
      /Network Error/,
      /User cancelled/,
    ],
  },
  
  // Development-specific settings
  LOG_LEVEL: 'debug',
  ENABLE_MOCK_DATA: true,
  ENABLE_DEV_TOOLS: true,
  ENABLE_HOT_RELOAD: true,
};

export default developmentConfig; 