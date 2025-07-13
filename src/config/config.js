const config = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Port should be handled entirely by environment variables
  PORT: process.env.PORT,
  
  // API Base URL for deployed environments (set this on Render dashboard)
  RENDER_BACKEND_URL: process.env.RENDER_BACKEND_URL,
  
  // Authentication (set this on Render dashboard)
  JWT_SECRET: process.env.JWT_SECRET,
  
  // Helper to check if we're in production
  isProduction: () => process.env.NODE_ENV === 'production' || process.env.RENDER,
  
  // Helper to check if we're on Render
  isRender: () => !!process.env.RENDER,
  
  // Helper to get the full base URL
  getBaseUrl: () => {
    if (process.env.RENDER_BACKEND_URL) {
      return process.env.RENDER_BACKEND_URL;
    }
    return `http://localhost:${process.env.PORT}`;
  }
};

module.exports = config;