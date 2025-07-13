const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

const config = require('./config/config');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const notesRoutes = require('./routes/notes');
const bookmarksRoutes = require('./routes/bookmarks');
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');

const app = express();

app.use(helmet());

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  config.RENDER_BACKEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Route handlers for specific API sections
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api', searchRoutes); // This handles routes starting with /api/ like /api/search, /api/tags etc.

// New: Handler for the base /api endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the Notes & Bookmarks API! Please use specific endpoints for resources.',
    availableEndpoints: {
      auth: '/api/auth',
      notes: '/api/notes',
      bookmarks: '/api/bookmarks',
      search: '/api/search',
      health: '/health',
      docs: '/api-docs' // Assuming /api-docs is at the root, not under /api
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

// Root endpoint for the API (e.g., http://localhost:PORT/)
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
      api_root: '/api' // Added for clarity
    },
  });
});

// Error handling middleware - these should always be last
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;