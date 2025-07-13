
const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./config').default; 
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Personal Notes & Bookmark Manager API',
      version: '1.0.0',
      description: 'A RESTful API for managing personal notes and bookmarks, with robust user authentication, powerful search capabilities, and URL metadata extraction.',
      contact: {
        name: 'Danish Abdullah',
        url: 'https://github.com/danishabdullahpy',
        email: 'danishabdullah276@gmail.com',
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'User authentication (registration, login) and profile management (retrieve, update, change password).',
      },
      {
        name: 'Notes',
        description: 'Comprehensive CRUD operations for user-specific notes, including tagging and favorite status.',
      },
      {
        name: 'Bookmarks',
        description: 'Comprehensive CRUD operations for user-specific bookmarks, including URL metadata fetching, tagging, and favorite status.',
      },
      {
        name: 'Search',
        description: 'Global search across notes and bookmarks, and operations related to tags and suggestions.',
      },
    ],
    servers: [
      {
        url: `http://localhost:${config.PORT}/api`, // Now 'config' is defined!
        description: 'Local Development Server',
      },
      {
        url: `${config.RENDER_BACKEND_URL || 'https://notes-api-n9fk.onrender.com'}/api`, // Now 'config' is defined!
        description: 'Render Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Bearer Token for API authentication. Provide the JWT token obtained from the `/api/auth/login` endpoint (e.g., `Bearer YOUR_TOKEN_HERE`).',
        },
      },
      schemas: {
        // ... your schemas
      },
      responses: {
        // ... your responses
      },
    },
  },
  apis: [
    './src/routes/.js',
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs;