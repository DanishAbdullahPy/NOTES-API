const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 10000, 
  RENDER_BACKEND_URL: process.env.RENDER_BACKEND_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  isProduction: () => process.env.NODE_ENV === 'production' || !!process.env.RENDER, 
  isRender: () => !!process.env.RENDER,
};

config.getBaseUrl = () => {
    if (config.RENDER_BACKEND_URL) {
        return config.RENDER_BACKEND_URL;
    }
    return `http://localhost:${config.PORT}`;
};

module.exports = config; 
