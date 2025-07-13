const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateRegister, validateLogin, handleValidationErrors } = require('../middleware/validation');

/**
 * @swagger
 * tags:
 * name: Auth
 * description: User authentication and profile management
 */

/**
 * @swagger
 * /auth/register:
 * post:
 * summary: Register a new user
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - name
 * - email
 * - password
 * properties:
 * name:
 * type: string
 * example: John Doe
 * email:
 * type: string
 * format: email
 * example: john.doe@example.com
 * password:
 * type: string
 * format: password
 * minLength: 8
 * example: StrongP@ssw0rd
 * responses:
 * 201:
 * description: User registered successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'User registered successfully' }
 * data:
 * type: object
 * properties:
 * id: { type: string, example: 'clxp80w7m000008jt42k0abcd' }
 * name: { type: string, example: 'John Doe' }
 * email: { type: string, example: 'john.doe@example.com' }
 * token: { type: string, example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
 * timestamp: { type: string, format: 'date-time' }
 * 400:
 * $ref: '#/components/responses/ValidationError'
 * 409:
 * description: Email already registered
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: false }
 * message: { type: string, example: 'Email already registered' }
 * errors: { type: 'null' }
 * timestamp: { type: string, format: 'date-time' }
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.post('/register', validateRegister, handleValidationErrors, authController.register);

/**
 * @swagger
 * /auth/login:
 * post:
 * summary: Log in a user
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - password
 * properties:
 * email: { type: string, format: 'email', example: 'john.doe@example.com' }
 * password: { type: string, format: 'password', example: 'StrongP@ssw0rd' }
 * responses:
 * 200:
 * description: Login successful
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Login successful' }
 * data:
 * type: object
 * properties:
 * id: { type: string, example: 'clxp80w7m000008jt42k0abcd' }
 * name: { type: string, example: 'John Doe' }
 * email: { type: string, example: 'john.doe@example.com' }
 * token: { type: string, example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
 * timestamp: { type: string, format: 'date-time' }
 * 400:
 * $ref: '#/components/responses/ValidationError'
 * 401:
 * description: Invalid credentials
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: false }
 * message: { type: string, example: 'Invalid credentials' }
 * errors: { type: 'null' }
 * timestamp: { type: string, format: 'date-time' }
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.post('/login', validateLogin, handleValidationErrors, authController.login);

/**
 * @swagger
 * /auth/profile:
 * get:
 * summary: Get current user profile
 * tags: [Auth]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: User profile retrieved successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'User profile retrieved successfully' }
 * data:
 * type: object
 * properties:
 * id: { type: string, example: 'clxp80w7m000008jt42k0abcd' }
 * name: { type: string, example: 'John Doe' }
 * email: { type: string, example: 'john.doe@example.com' }
 * createdAt: { type: string, format: 'date-time' }
 * updatedAt: { type: string, format: 'date-time' }
 * timestamp: { type: string, format: 'date-time' }
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 403:
 * $ref: '#/components/responses/ForbiddenError'
 * 404:
 * description: User not found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: false }
 * message: { type: string, example: 'User not found' }
 * errors: { type: 'null' }
 * timestamp: { type: string, format: 'date-time' }
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @swagger
 * /auth/profile:
 * put:
 * summary: Update user profile
 * tags: [Auth]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * name:
 * type: string
 * example: Jane Doe
 * description: Optional new name for the user
 * email:
 * type: string
 * format: email
 * example: jane.doe@example.com
 * description: Optional new email for the user
 * responses:
 * 200:
 * description: User profile updated successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'User profile updated successfully' }
 * data:
 * type: object
 * properties:
 * id: { type: string, example: 'clxp80w7m000008jt42k0abcd' }
 * name: { type: string, example: 'Jane Doe' }
 * email: { type: string, example: 'jane.doe@example.com' }
 * createdAt: { type: string, format: 'date-time' }
 * updatedAt: { type: string, format: 'date-time' }
 * timestamp: { type: string, format: 'date-time' }
 * 400:
 * $ref: '#/components/responses/ValidationError'
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 403:
 * $ref: '#/components/responses/ForbiddenError'
 * 409:
 * description: Email already taken by another user
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: false }
 * message: { type: string, example: 'Email already taken by another user' }
 * errors: { type: 'null' }
 * timestamp: { type: string, format: 'date-time' }
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.put('/profile', [
  authenticateToken,
  body('name')
    .optional() // Name is optional for update
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional() // Email is optional for update
    .isEmail()
    .withMessage('Please provide a valid email address'),
  handleValidationErrors
], authController.updateProfile);

/**
 * @swagger
 * /auth/change-password:
 * put:
 * summary: Change user password
 * tags: [Auth]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - currentPassword
 * - newPassword
 * properties:
 * currentPassword:
 * type: string
 * format: password
 * example: StrongP@ssw0rd
 * newPassword:
 * type: string
 * format: password
 * minLength: 6
 * example: NewStrongP@ssw0rd
 * responses:
 * 200:
 * description: Password changed successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Password changed successfully' }
 * errors: { type: 'null' }
 * timestamp: { type: string, format: 'date-time' }
 * 400:
 * $ref: '#/components/responses/ValidationError'
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 403:
 * $ref: '#/components/responses/ForbiddenError'
 * 404:
 * description: User not found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: false }
 * message: { type: string, example: 'User not found' }
 * errors: { type: 'null' }
 * timestamp: { type: string, format: 'date-time' }
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.put('/change-password', [
  authenticateToken,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  handleValidationErrors // Added missing validation error handler
], authController.changePassword);

/**
 * @swagger
 * /auth/logout:
 * post:
 * summary: Log out current user
 * tags: [Auth]
 * description: For JWT-based authentication, this typically means the client discards the token. Server-side actions like token blacklisting could be implemented here.
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: User logged out successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Logged out successfully' }
 * errors: { type: 'null' }
 * timestamp: { type: string, format: 'date-time' }
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 403:
 * $ref: '#/components/responses/ForbiddenError'
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.post('/logout', authenticateToken, (req, res) => {
  // For JWT-based authentication, logout is typically handled client-side
  // by discarding the token. Here we just return a success response.
  // You could implement token blacklisting here if needed.
  res.json({
    success: true,
    message: 'Logged out successfully',
    errors: null,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;