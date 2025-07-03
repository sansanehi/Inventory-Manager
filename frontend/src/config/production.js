const productionConfig = {
  // API Configuration
  API_URL: process.env.REACT_APP_API_URL || 'https://api.yourdomain.com',
  API_VERSION: 'v1',
  
  // Feature Flags
  ENABLE_ANALYTICS: true,
  ENABLE_ERROR_TRACKING: true,
  ENABLE_PERFORMANCE_MONITORING: true,
  
  // Cache Configuration
  CACHE_DURATION: 3600, // 1 hour in seconds
  MAX_CACHE_ITEMS: 1000,
  
  // Security
  TOKEN_EXPIRY: 86400, // 24 hours in seconds
  REFRESH_TOKEN_EXPIRY: 604800, // 7 days in seconds
  
  // Performance
  LAZY_LOAD_THRESHOLD: 0.5,
  DEBOUNCE_DELAY: 300,
  
  // UI Configuration
  ITEMS_PER_PAGE: 20,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
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
  ANALYTICS_ID: process.env.REACT_APP_ANALYTICS_ID,
  
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
    SAMPLE_RATE: 0.1, // 10% of users
    REPORT_INTERVAL: 60000, // 1 minute
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
};

export default productionConfig; 