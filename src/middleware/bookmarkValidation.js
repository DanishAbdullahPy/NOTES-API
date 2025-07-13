const { body, query, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateCreateBookmark = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('url')
    .trim()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid URL starting with http:// or https://')
    .isLength({ max: 2000 })
    .withMessage('URL cannot exceed 2000 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 0) {
        for (let tag of tags) {
          if (typeof tag !== 'string' || tag.trim().length === 0) {
            throw new Error('Each tag must be a non-empty string');
          }
          if (tag.length > 30) {
            throw new Error('Each tag cannot exceed 30 characters');
          }
        }
      }
      return true;
    }),
  
  body('isFavorite')
    .optional()
    .isBoolean()
    .withMessage('isFavorite must be a boolean'),
  
  validate
];

const validateUpdateBookmark = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Valid bookmark ID is required'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('url')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid URL starting with http:// or https://')
    .isLength({ max: 2000 })
    .withMessage('URL cannot exceed 2000 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 0) {
        for (let tag of tags) {
          if (typeof tag !== 'string' || tag.trim().length === 0) {
            throw new Error('Each tag must be a non-empty string');
          }
          if (tag.length > 30) {
            throw new Error('Each tag cannot exceed 30 characters');
          }
        }
      }
      return true;
    }),
  
  body('isFavorite')
    .optional()
    .isBoolean()
    .withMessage('isFavorite must be a boolean'),
  
  validate
];

const validateGetBookmarks = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a comma-separated string'),
  
  query('isFavorite')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isFavorite must be true or false'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  validate
];

const validateBookmarkId = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Valid bookmark ID is required'),
  
  validate
];

const validateUrl = [
  body('url')
    .trim()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid URL starting with http:// or https://')
    .isLength({ max: 2000 })
    .withMessage('URL cannot exceed 2000 characters'),
  
  validate
];

module.exports = {
  validate,
  validateCreateBookmark,
  validateUpdateBookmark,
  validateGetBookmarks,
  validateBookmarkId,
  validateUrl
};