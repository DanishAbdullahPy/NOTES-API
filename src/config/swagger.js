const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0', 
    info: {
      title: 'Personal Notes & Bookmark Manager API',
      version: '1.0.0', 
      description: 'A RESTful API for managing personal notes and bookmarks, with robust user authentication, powerful search capabilities, and URL metadata extraction.', // Enhanced description
      contact: {
        name: 'Danish Abdullah',
        url: 'https://github.com/danishabdullahpy', 
        email: 'danishabdullah276@gmail.com', 
      },
      // You can add license information here if applicable
      // license: {
      //   name: 'MIT',
      //   url: 'https://spdx.org/licenses/MIT.html',
      // },
    },
    // Global tags for categorizing API endpoints in Swagger UI
    tags: [
      {
        name: 'Auth',
        description: 'User authentication (registration, login) and profile management (retrieve, update, change password).', // More detailed description
      },
      {
        name: 'Notes',
        description: 'Comprehensive CRUD operations for user-specific notes, including tagging and favorite status.', // More detailed description
      },
      {
        name: 'Bookmarks',
        description: 'Comprehensive CRUD operations for user-specific bookmarks, including URL metadata fetching, tagging, and favorite status.', // More detailed description
      },
      {
        name: 'Search', // Ensure this name matches the 'tags' array in your route JSDocs
        description: 'Global search across notes and bookmarks, and operations related to tags and suggestions.', // More detailed description
      },
      // Add any other global tags here if you expand your API (e.g., 'Health Checks', 'Admin')
    ],
    // API servers for different environments
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api`, // Dynamically pick port from environment or default to 5000
        description: 'Local Development Server',
      },
      // Example for a production server
      // {
      //   url: 'https://api.yourdomain.com/api',
      //   description: 'Production Server',
      // },
    ],
    // Reusable components (schemas and responses)
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Explicitly states JWT format
          description: 'Bearer Token for API authentication. Provide the JWT token obtained from the `/api/auth/login` endpoint (e.g., `Bearer YOUR_TOKEN_HERE`).', // More instructional description
        },
      },
      schemas: {
        // --- Common Response Schemas ---
        SuccessResponse: {
          type: 'object',
          description: 'Standard successful API response structure.',
          properties: {
            success: { type: 'boolean', example: true, description: 'Indicates if the operation was successful.' },
            message: { type: 'string', example: 'Operation completed successfully.', description: 'A human-readable message about the operation result.' },
            data: { type: 'object', nullable: true, description: 'The payload of the response, can be any valid JSON object or array, or null if no data is returned.' }, // Added nullable and more description
            timestamp: { type: 'string', format: 'date-time', example: '2025-07-13T12:00:00Z', description: 'The time when the response was generated (ISO 8601 format).' },
          },
          required: ['success', 'message', 'timestamp'], // Data is optional
        },
        ErrorResponse: {
          type: 'object',
          description: 'Standard error API response structure.',
          properties: {
            success: { type: 'boolean', example: false, description: 'Indicates if the operation failed.' },
            message: { type: 'string', example: 'An error occurred during the operation.', description: 'A human-readable error message.' },
            errors: {
              type: 'object',
              nullable: true, // Errors object might be null for generic errors
              additionalProperties: { type: 'string' }, // More specific type for values in 'errors' object
              description: 'Optional: An object containing specific field-level validation errors or other detailed error information.',
              example: { email: 'Invalid email format.', password: 'Password must be at least 8 characters long.' }, // More realistic example
            },
            timestamp: { type: 'string', format: 'date-time', example: '2025-07-13T12:00:00Z', description: 'The time when the error response was generated (ISO 8601 format).' },
          },
          required: ['success', 'message', 'timestamp'],
        },

        // --- User Schema ---
        User: {
          type: 'object',
          description: 'Represents a user in the system.',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'Unique identifier for the user.' },
            // Changed 'username' to 'name' based on your Postman collection for consistency
            name: { type: 'string', example: 'John Danish', description: 'Full name or display name of the user.' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com', description: 'Unique email address of the user.' },
            createdAt: { type: 'string', format: 'date-time', example: '2023-01-01T12:00:00Z', description: 'Timestamp when the user account was created.' },
            updatedAt: { type: 'string', format: 'date-time', example: '2023-01-01T12:30:00Z', description: 'Timestamp when the user account was last updated.' },
          },
          required: ['id', 'name', 'email', 'createdAt', 'updatedAt'], // All returned fields should be required in schema
        },
        RegisterUser: {
          type: 'object',
          description: 'Payload for registering a new user.',
          properties: {
            name: { type: 'string', example: 'New User Name', description: 'Full name or display name for the new user.' }, // Consistent with User schema
            email: { type: 'string', format: 'email', example: 'new.user@example.com', description: 'Unique email address for the user.' },
            password: { type: 'string', format: 'password', example: 'SecurePassword123!', description: 'User password (minimum 8 characters, recommended strong characters).' }, // Stronger example
          },
          required: ['name', 'email', 'password'], // Use 'name' instead of 'username'
        },
        LoginUser: {
          type: 'object',
          description: 'Payload for user login.',
          properties: {
            email: { type: 'string', format: 'email', example: 'john.doe@example.com', description: 'User email address.' },
            password: { type: 'string', format: 'password', example: 'securePassword123', description: 'User password.' },
          },
          required: ['email', 'password'],
        },
        ChangePassword: {
          type: 'object',
          description: 'Payload for changing user password.',
          properties: {
            currentPassword: { type: 'string', format: 'password', example: 'oldPassword123', description: 'The user\'s current password.' },
            newPassword: { type: 'string', format: 'password', example: 'newSecurePassword456!', description: 'The new password (minimum 8 characters, recommended strong characters).' }, // Stronger example
          },
          required: ['currentPassword', 'newPassword'],
        },

        // --- Note Schema ---
        Note: {
          type: 'object',
          description: 'Represents a personal note.',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'note-a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'Unique identifier for the note.' }, // Full UUID example
            userId: { type: 'string', format: 'uuid', example: 'user-e5f6-7890-1234-567890abcdef', description: 'The ID of the user who owns this note.' }, // Full UUID example
            title: { type: 'string', example: 'Meeting Minutes', description: 'Title of the note.' },
            content: { type: 'string', example: 'Discussed Q3 strategy and upcoming deadlines.', description: 'Detailed content of the note.' },
            tags: { type: 'array', items: { type: 'string' }, example: ['work', 'strategy', 'q3'], description: 'An array of tags associated with the note.' },
            isFavorite: { type: 'boolean', example: false, description: 'Boolean indicating if the note is marked as a favorite.' },
            createdAt: { type: 'string', format: 'date-time', example: '2023-01-01T10:00:00Z', description: 'Timestamp when the note was created.' },
            updatedAt: { type: 'string', format: 'date-time', example: '2023-01-01T10:30:00Z', description: 'Timestamp when the note was last updated.' },
          },
          required: ['id', 'userId', 'title', 'content', 'tags', 'isFavorite', 'createdAt', 'updatedAt'],
        },
        CreateNote: {
          type: 'object',
          description: 'Payload for creating a new note.',
          properties: {
            title: { type: 'string', example: 'New Recipe Idea', description: 'Title of the note.' },
            content: { type: 'string', example: 'Ingredients: Flour, Sugar, Eggs. Steps: Mix well, Bake at 350F.', description: 'Content of the note.' },
            tags: { type: 'array', items: { type: 'string' }, example: ['cooking', 'recipes'], description: 'Optional: Array of tags for the note. Defaults to empty array if not provided.' }, // Added optional, default
            isFavorite: { type: 'boolean', example: false, description: 'Optional: Whether the note is marked as favorite. Defaults to false if not provided.' }, // Added optional, default
          },
          required: ['title', 'content'],
        },
        UpdateNote: {
          type: 'object',
          description: 'Payload for updating an existing note. All fields are optional; only provided fields will be updated.',
          properties: {
            title: { type: 'string', example: 'Updated Meeting Minutes', description: 'New title for the note.' },
            content: { type: 'string', example: 'Revised strategy discussion details.', description: 'New content for the note.' },
            tags: { type: 'array', items: { type: 'string' }, example: ['work', 'strategy', 'q3', 'revised'], description: 'Updated array of tags for the note.' },
            isFavorite: { type: 'boolean', example: true, description: 'New favorite status for the note.' },
          },
          // No 'required' as all fields are optional for update
        },

        // --- Bookmark Schema ---
        Bookmark: {
          type: 'object',
          description: 'Represents a user-saved bookmark.',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'bookmark-f1g2h3i4-e5f6-7890-1234-567890abcdef', description: 'Unique identifier for the bookmark.' }, // Full UUID example
            userId: { type: 'string', format: 'uuid', example: 'user-a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'The ID of the user who owns this bookmark.' }, // Full UUID example
            url: { type: 'string', format: 'url', example: 'https://example.com/useful-article', description: 'The URL of the bookmarked page.' },
            title: { type: 'string', example: 'A Useful Article', nullable: true, description: 'Optional: Title of the bookmarked page. Can be fetched automatically if not provided.' }, // Added nullable
            description: { type: 'string', example: 'An article about best practices in web development.', nullable: true, description: 'Optional: Description of the bookmarked page. Can be fetched automatically if not provided.' }, // Added nullable
            tags: { type: 'array', items: { type: 'string' }, example: ['webdev', 'best-practices'], description: 'An array of tags associated with the bookmark.' },
            isFavorite: { type: 'boolean', example: true, description: 'Boolean indicating if the bookmark is marked as a favorite.' },
            createdAt: { type: 'string', format: 'date-time', example: '2023-01-05T14:00:00Z', description: 'Timestamp when the bookmark was created.' },
            updatedAt: { type: 'string', format: 'date-time', example: '2023-01-05T14:15:00Z', description: 'Timestamp when the bookmark was last updated.' },
            // Add metadata fields if they are stored in the Bookmark schema directly
            // image: { type: 'string', format: 'url', example: 'https://example.com/image.png', nullable: true, description: 'Main image URL from the bookmarked page.' },
            // favicon: { type: 'string', format: 'url', example: 'https://example.com/favicon.ico', nullable: true, description: 'Favicon URL of the bookmarked page.' },
          },
          required: ['id', 'userId', 'url', 'tags', 'isFavorite', 'createdAt', 'updatedAt'], // Title and description can be nullable
        },
        CreateBookmark: {
          type: 'object',
          description: 'Payload for creating a new bookmark.',
          properties: {
            url: { type: 'string', format: 'url', example: 'https://www.example.com/new-bookmark', description: 'Required: The URL of the bookmark.' },
            title: { type: 'string', example: 'Example New Bookmark', nullable: true, description: 'Optional: Title for the bookmark. If not provided, it will be automatically fetched from the URL.' },
            description: { type: 'string', example: 'Optional: Description of the bookmarked page.', nullable: true, description: 'Optional: Description of the bookmarked page. If not provided, it will be automatically fetched from the URL.' },
            tags: { type: 'array', items: { type: 'string' }, example: ['tech', 'reference'], description: 'Optional: Array of tags for the bookmark. Defaults to an empty array if not provided.' },
            isFavorite: { type: 'boolean', example: false, description: 'Optional: Whether the bookmark is marked as favorite. Defaults to false if not provided.' },
          },
          required: ['url'], // Only URL is strictly required initially
        },
        UpdateBookmark: {
          type: 'object',
          description: 'Payload for updating an existing bookmark. All fields are optional; only provided fields will be updated.',
          properties: {
            url: { type: 'string', format: 'url', example: 'https://www.updated-example.com', description: 'Optional: New URL for the bookmark.' },
            title: { type: 'string', example: 'Updated Bookmark Title', nullable: true, description: 'Optional: New title for the bookmark.' },
            description: { type: 'string', example: 'Updated description of the bookmarked page.', nullable: true, description: 'Optional: New description of the bookmarked page.' },
            tags: { type: 'array', items: { type: 'string' }, example: ['tech', 'updated-tag'], description: 'Optional: Updated array of tags for the bookmark.' },
            isFavorite: { type: 'boolean', example: true, description: 'Optional: New favorite status for the bookmark.' },
          },
          // No 'required' as all fields are optional for update
        },
        UrlMetadata: { // New schema for URL metadata response
            type: 'object',
            description: 'Schema for URL metadata retrieved from an external source.',
            properties: {
                title: { type: 'string', example: 'OpenAI', nullable: true, description: 'Title of the web page.' },
                description: { type: 'string', example: 'We’re researching and engineering trustworthy AI.', nullable: true, description: 'Description of the web page.' },
                image: { type: 'string', format: 'url', example: 'https://openai.com/content/images/2023/05/og-image.jpg', nullable: true, description: 'URL of the main image on the web page.' },
                favicon: { type: 'string', format: 'url', example: 'https://openai.com/favicon.ico', nullable: true, description: 'URL of the favicon for the web page.' },
            }
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication token is missing, invalid, or expired.', // More detailed description
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        ForbiddenError: {
          description: 'Access to the resource is forbidden (e.g., user does not own the resource).', // More precise description
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        NotFoundError: {
          description: 'The requested resource could not be found.', // More general and accurate
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        ValidationError: {
          description: 'Validation of request data failed (e.g., missing required fields, invalid format).', // More detailed
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        ConflictError: {
          description: 'Resource conflict (e.g., email already registered, URL already bookmarked, or resource already exists with unique constraint).', // More examples
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        ServerError: { 
          description: 'An unexpected internal server error occurred.', // Clear and concise
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
      },
    },
  },
  apis: [
    './src/routes/.js', 
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs;