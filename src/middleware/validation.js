const { body, param, query, validationResult } = require('express-validator');
const { sendValidationError, sendError } = require('../utils/response'); //


const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return sendValidationError(res, errorMessages); //
  }
  next();
};


const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  handleValidationErrors
];


const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];


const validateNote = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),

  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),

  body('isFavorite')
    .optional()
    .isBoolean()
    .withMessage('isFavorite must be a boolean')
    .toBoolean(), // Add .toBoolean() to convert string "true"/"false" to boolean values

  handleValidationErrors
];


const validateBookmark = [
  body('url')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL (must include http:// or https://)'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),

  body('isFavorite')
    .optional()
    .isBoolean()
    .withMessage('isFavorite must be a boolean')
    .toBoolean(), // Add .toBoolean() to convert string "true"/"false" to boolean values

  handleValidationErrors
];


const validateId = [
  param('id')
    .isString() //
    .notEmpty()
    .withMessage('ID must be a non-empty string')
    .isLength({ min: 25, max: 25 }) 
    .withMessage('ID must be a 25-character identifier')
    .matches(/^[a-z0-9]{25}$/) 
    .withMessage('ID format is invalid'),
  handleValidationErrors
];

//Search Query Validation
const validateSearch = [
  query('query') 
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must be less than 100 characters'),

  query('type')
    .optional()
    .isIn(['note', 'bookmark']) 
    .withMessage('Type must be either "note" or "bookmark"'),

  query('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        if (tags.some(tag => tag.length > 30)) {
          throw new Error('Each tag must be less than 30 characters');
        }
        return true;
      }
      throw new Error('Tags must be a comma-separated string');
    }),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(), // Convert to integer

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(), // Convert to integer

  query('isFavorite') 
    .optional()
    .isBoolean()
    .withMessage('isFavorite must be a boolean')
    .toBoolean(), 

  query('sortBy') 
    .optional()
    .isIn(['createdAt', 'updatedAt', 'title', 'url'])
    .withMessage('SortBy must be createdAt, updatedAt, title, or url'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('SortOrder must be asc or desc'),

  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateNote,
  validateBookmark,
  validateId,
  validateSearch,
  handleValidationErrors
};