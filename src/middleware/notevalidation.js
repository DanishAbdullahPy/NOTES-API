const { body, param, query } = require('express-validator');

const validateCreateNote = [
    body('title')
        .notEmpty().withMessage('Title is required')
        .isString().withMessage('Title must be a string')
        .trim()
        .isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
    body('content')
        .optional() // Content can be optional
        .isString().withMessage('Content must be a string')
        .trim(),
    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array')
        .custom((value) => {
            if (value && value.some(tag => typeof tag !== 'string' || tag.trim().length === 0)) {
                throw new Error('All tags must be non-empty strings');
            }
            if (value && value.length > 10) {
                throw new Error('Maximum 10 tags allowed');
            }
            return true;
        }),
    body('isFavorite')
        .optional()
        .isBoolean().withMessage('isFavorite must be a boolean')
        .toBoolean(), // Converts "true" to true, "false" to false
];

const validateUpdateNote = [
    param('id').isUUID().withMessage('Invalid note ID format'),
    body('title')
        .optional() // Title is optional for update
        .isString().withMessage('Title must be a string')
        .trim()
        .isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
    body('content')
        .optional()
        .isString().withMessage('Content must be a string')
        .trim(),
    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array')
        .custom((value) => {
            if (value && value.some(tag => typeof tag !== 'string' || tag.trim().length === 0)) {
                throw new Error('All tags must be non-empty strings');
            }
            if (value && value.length > 10) {
                throw new Error('Maximum 10 tags allowed');
            }
            return true;
        }),
    body('isFavorite')
        .optional()
        .isBoolean().withMessage('isFavorite must be a boolean')
        .toBoolean(),
];

const validateNoteId = [
    param('id').isUUID().withMessage('Invalid note ID format')
];

const validateNotesSearch = [
    query('q').optional().isString().trim().escape(),
    query('tags').optional().isString().trim().customSanitizer(value => value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be an integer between 1 and 100').toInt(),
    query('favorite').optional().isBoolean().withMessage('Favorite must be a boolean').toBoolean(),
    query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'title']).withMessage('Invalid sortBy field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sortOrder value (must be "asc" or "desc")'),
];


module.exports = {
    validateCreateNote,
    validateUpdateNote,
    validateNoteId,
    validateNotesSearch
};