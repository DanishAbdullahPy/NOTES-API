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

function findAvailablePort(startPort, maxAttempts = 10) {
  return new Promise((resolve, reject) => {
    const net = require('net');
    let port = startPort;
    let attempts = 0;

    function testPort(port) {
      const server = net.createServer();

      server.listen(port, () => {
        server.close(() => {
          resolve(port);
        });
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error(`Unable to find available port after ${maxAttempts} attempts`));
          } else {
            console.log(`Port ${port} is in use, trying ${port + 1}...`);
            testPort(port + 1);
          }
        } else {
          reject(err);
        }
      });
    }

    testPort(port);
  });
}

async function startServer() {
  try {
    console.log('Attempting to connect to database...');
    await testConnection();
    console.log('Database connection successful.');

    let PORT = config.PORT; 

    if (config.NODE_ENV === 'development') { 
      try {
        PORT = await findAvailablePort(PORT);
      } catch (error) {
        console.error('Error finding available port:', error);
        process.exit(1);
      }
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${config.NODE_ENV}`);
      console.log(`🔗 Health checking: http://localhost:${PORT}/health`);
      console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
module.exports = app;
