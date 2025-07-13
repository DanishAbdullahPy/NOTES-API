// config.js
const config = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 10000, // Fallback here
  RENDER_BACKEND_URL: process.env.RENDER_BACKEND_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  isProduction: () => process.env.NODE_ENV === 'production' || process.env.RENDER,
  isRender: () => !!process.env.RENDER,
};

// Define getBaseUrl after config object is defined to safely reference config.PORT
config.getBaseUrl = () => {
    if (config.RENDER_BACKEND_URL) {
        return config.RENDER_BACKEND_URL;
    }
    return `http://localhost:${config.PORT}`;
};

export default config;