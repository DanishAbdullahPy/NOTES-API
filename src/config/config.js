
const config = {
    // Server Configuration
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 5000,
  
    // API Base URL for deployed environments (set this on Render dashboard)
    RENDER_BACKEND_URL: process.env.RENDER_BACKEND_URL,
  
    // Authentication (set this on Render dashboard)
    JWT_SECRET: process.env.JWT_SECRET,
  
  };
  
  module.exports = config;