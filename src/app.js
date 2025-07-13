// C:\Users\legion\Desktop\NOTES-API-main\NOTES-API-main\src\app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Load environment variables if not in production
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

const config = require('./config/config'); // Ensure this path is correct for your config file

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// --- Import your route modules ---
const notesRoutes = require('./routes/notes');
const bookmarksRoutes = require('./routes/bookmarks');
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');

const app = express(); // Initialize Express app

// --- Core Middleware ---
app.use(helmet()); // Security headers

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000', // Frontend dev server
  'http://localhost:5173', // Another common frontend dev server (e.g., Vite)
  config.RENDER_BACKEND_URL, // Your deployed Render frontend URL
].filter(Boolean); // Filters out undefined/null if RENDER_BACKEND_URL is not set

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow requests with no origin (like Postman, curl)

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true, // Allow cookies to be sent
}));

app.use(express.json({ limit: '30mb' })); // Body parser for JSON requests
app.use(express.urlencoded({ extended: true, limit: '30mb' })); // Body parser for URL-encoded requests

// HTTP request logger
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Detailed logging in development
} else {
  app.use(morgan('combined')); // Standard logging in production
}

// --- API Route Definitions ---
// These app.use() lines mount your routers at specific base paths
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api', searchRoutes); // This router handles routes like /api/search, /api/tags etc.

// --- Root and Health Check Endpoints ---
// Added a specific handler for the /api root path
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the Notes & Bookmarks API! Please use specific endpoints for resources.',
    availableEndpoints: {
      auth: '/api/auth',
      notes: '/api/notes',
      bookmarks: '/api/bookmarks',
      search: '/api/search',
      health: '/health',
      docs: '/api-docs' // Assuming /api-docs is at the server root, not nested under /api
    },
    version: '1.0.0',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    uptime: process.uptime(),
  });
});

// Main root endpoint for the server
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Notes & Bookmarks API',
    version: '1.0.0',
    environment: config.NODE_ENV,
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      notes: '/api/notes',
      bookmarks: '/api/bookmarks',
      search: '/api/search',
      api_root: '/api', // Explicitly list the API root
      docs: '/api-docs' // Explicitly list API Docs
    },
  });
});

// --- Error Handling Middleware (MUST BE LAST) ---
app.use(notFoundHandler); // Handles 404 Not Found errors for unmatched routes
app.use(errorHandler);     // Centralized error handling for caught exceptions

module.exports = app; // Export the configured Express app instance