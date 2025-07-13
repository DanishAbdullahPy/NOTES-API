// C:\Users\legion\Desktop\NOTES-API-main\NOTES-API-main\src\server.js

const app = require('./app'); // Import the configured Express app
const config = require('./config/config'); // Import your config settings
const { testConnection } = require('./config/database'); // Database connection test
const swaggerUi = require('swagger-ui-express'); // Swagger UI package
const swaggerSpec = require('./config/swagger'); // Your Swagger/OpenAPI specification
const net = require('net'); // Node.js built-in module for network operations

// Helper function to find an available port
function findAvailablePort(startPort, maxAttempts = 10) {
  return new Promise((resolve, reject) => {
    let port = startPort;
    let attempts = 0;

    function testPort(currentPort) {
      const server = net.createServer(); // Create a temporary server to test port

      // Try to listen on the current port
      server.listen(currentPort, () => {
        server.close(() => { // Close immediately if successful
          resolve(currentPort); // Resolve with the available port
        });
      });

      // Handle errors (e.g., port in use)
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error(`Unable to find available port after ${maxAttempts} attempts`));
          } else {
            console.log(`Port ${currentPort} is in use, trying ${currentPort + 1}...`);
            testPort(currentPort + 1); // Try the next port
          }
        } else {
          reject(err); // Reject for other errors
        }
      });
    }
    testPort(port); // Start testing from the initial port
  });
}

// Main asynchronous function to start the server
async function startServer() {
  try {
    console.log('Prisma Client initialized.'); // Log from your original output
    console.log('Attempting to connect to database...');
    await testConnection(); // Test database connection before starting server
    console.log('Database connection successful.');

    let PORT = config.PORT; // Get the configured port

    // In development, dynamically find an available port if the default is in use
    if (config.NODE_ENV === 'development') {
      try {
        PORT = await findAvailablePort(PORT);
      } catch (error) {
        console.error('Error finding available port:', error);
        process.exit(1); // Exit if no port can be found
      }
    }

    // Set up Swagger UI middleware. This must be done AFTER the port is determined,
    // especially if swaggerSpec uses the PORT in its configuration (e.g., for baseUrl).
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


    // Start the Express server and listen on the determined PORT
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${config.NODE_ENV}`);
      console.log(`🔗 Health checking: http://localhost:${PORT}/health`);
      console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
    });

    // --- Graceful Shutdown ---
    // Handle SIGTERM signal (e.g., from process managers like PM2, Docker, or Render)
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      server.close(() => { // Close the server (stop accepting new connections)
        console.log('Server closed.');
        process.exit(0); // Exit the process
      });
    });

    // Handle SIGINT signal (e.g., Ctrl+C from terminal)
    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1); // Exit with an error code
  }
}

startServer(); // Call the async function to initiate server startup

// Note: No module.exports = server; here. This file is the main entry point
// and orchestrates the server's lifecycle, rather than exporting a component.