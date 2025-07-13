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
const { testConnection } = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api', searchRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    uptime: process.uptime(),
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Notes & Bookmarks API',
    version: '1.0.0',
    environment: config.NODE_ENV,
    endpoints: {
      health: '/health',
      docs: '/api-docs',
      auth: '/api/auth',
      notes: '/api/notes',
      bookmarks: '/api/bookmarks',
      search: '/api/search',
    },
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    console.log('Attempting to connect to database...');
    await testConnection();
    console.log('Database connection successful.');

    const PORT = config.PORT;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Application URL: ${config.RENDER_BACKEND_URL || `http://localhost:${PORT}`}`);
      console.log(`Environment: ${config.NODE_ENV}`);
      console.log(`JWT Secret (partial): ${config.JWT_SECRET ? config.JWT_SECRET.substring(0, 5) + '...' : 'Not set'}`);
      console.log(`Database URL (partial): ${process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'Not set'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;