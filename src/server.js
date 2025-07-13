const app = require('./app'); 
const config = require('./config/config');
const { testConnection } = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const net = require('net'); 

function findAvailablePort(startPort, maxAttempts = 10) {
  return new Promise((resolve, reject) => {
    let port = startPort;
    let attempts = 0;

    function testPort(currentPort) {
      const server = net.createServer();

      server.listen(currentPort, () => {
        server.close(() => {
          resolve(currentPort);
        });
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error(`Unable to find available port after ${maxAttempts} attempts`));
          } else {
            console.log(`Port ${currentPort} is in use, trying ${currentPort + 1}...`);
            testPort(currentPort + 1);
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
    console.log('Prisma Client initialized.'); 
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

   
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


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
