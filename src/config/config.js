const config = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || (process.env.NODE_ENV === 'production' ? 8080 : 3000),
  
  // API Base URL for deployed environments (set this on Render dashboard)
  RENDER_BACKEND_URL: process.env.RENDER_BACKEND_URL,
  
  // Authentication (set this on Render dashboard)
  JWT_SECRET: process.env.JWT_SECRET,
  
  // Helper function to get available port
  getPort: () => {
      // On Render, always use the assigned PORT
      if (process.env.RENDER) {
          return process.env.PORT;
      }
      
      // For local development, try common ports
      return process.env.PORT || 3000;
  }
};

module.exports = config;