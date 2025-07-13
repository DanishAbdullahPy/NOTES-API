const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { testConnection } = require('./config/database');
const swaggerUi = require('swagger-ui-express'); 
const swaggerSpec = require('./config/swagger'); 

const notesRoutes = require('./routes/notes');
const bookmarksRoutes = require('./routes/bookmarks');
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');

const app = express();

app.use(helmet());

app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

testConnection();

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    uptime: process.uptime(),
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api', searchRoutes);
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Notes & Bookmarks API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      notes: '/api/notes',
      bookmarks: '/api/bookmarks',
      search: '/api/search',
      advancedSearch: '/api/advanced-search'
    },
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;