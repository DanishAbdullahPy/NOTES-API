const express = require('express');
const router = express.Router();

const notesController = require('../controllers/notesController');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation'); 
const { 
    validateCreateNote, // For POST /api/notes
    validateUpdateNote, // For PUT /api/notes/:id
    validateNoteId,     // For :id params (GET, PUT, DELETE, PATCH)
    validateNotesSearch // For GET /api/notes with query params
} = require('../middleware/notevalidation'); 
                                           
                                            // then you should adjust the import paths and names accordingly.
                                            // I'm using more specific names assuming better modularity.


// Apply authentication middleware to all routes in this router
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 * name: Notes
 * description: API for managing user notes
 */

/**
 * @swagger
 * /notes:
 * post:
 * summary: Create a new note
 * tags: [Notes]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - title
 * - content
 * properties:
 * title:
 * type: string
 * example: My Awesome Idea
 * content:
 * type: string
 * example: This is the detailed content of my note. It's about a new project idea.
 * tags:
 * type: array
 * items:
 * type: string
 * example: ["ideas", "project", "brainstorm"]
 * isFavorite:
 * type: boolean
 * example: false
 * responses:
 * 201:
 * description: Note created successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Note created successfully' }
 * data:
 * $ref: '#/components/schemas/Note'
 * 400:
 * $ref: '#/components/responses/ValidationError'
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.post('/', validateCreateNote, handleValidationErrors, notesController.createNote);

/**
 * @swagger
 * /notes:
 * get:
 * summary: Get all notes for authenticated user with optional filtering and pagination
 * tags: [Notes]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: query
 * name: q
 * schema:
 * type: string
 * description: Search term for title or content (case-insensitive)
 * - in: query
 * name: tags
 * schema:
 * type: string
 * description: Comma-separated list of tags to filter by (e.g., 'work,urgent')
 * - in: query
 * name: favorite
 * schema:
 * type: boolean
 * description: Filter by favorite status (true/false)
 * - in: query
 * name: page
 * schema:
 * type: integer
 * default: 1
 * description: Page number for pagination
 * - in: query
 * name: limit
 * schema:
 * type: integer
 * default: 10
 * description: Number of items per page
 * - in: query
 * name: sortBy
 * schema:
 * type: string
 * default: createdAt
 * enum: [createdAt, updatedAt, title]
 * description: Field to sort by
 * - in: query
 * name: sortOrder
 * schema:
 * type: string
 * default: desc
 * enum: [asc, desc]
 * description: Sort order (ascending or descending)
 * responses:
 * 200:
 * description: Notes retrieved successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Notes retrieved successfully' }
 * data:
 * type: object
 * properties:
 * notes:
 * type: array
 * items:
 * $ref: '#/components/schemas/Note'
 * pagination:
 * type: object
 * properties:
 * currentPage: { type: integer, example: 1 }
 * totalPages: { type: integer, example: 5 }
 * totalCount: { type: integer, example: 50 }
 * hasNext: { type: boolean, example: true }
 * hasPrev: { type: boolean, example: false }
 * limit: { type: integer, example: 10 }
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.get('/', validateNotesSearch, handleValidationErrors, notesController.getAllNotes);

/**
 * @swagger
 * /notes/stats:
 * get:
 * summary: Get notes statistics for authenticated user
 * tags: [Notes]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Notes statistics retrieved successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Notes statistics retrieved successfully' }
 * data:
 * type: object
 * properties:
 * totalNotes:
 * type: integer
 * example: 120
 * favoriteNotes:
 * type: integer
 * example: 30
 * popularTags:
 * type: array
 * items:
 * type: object
 * properties:
 * tag: { type: string, example: "productivity" }
 * count: { type: integer, example: 15 }
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.get('/stats', notesController.getNotesStats);

/**
 * @swagger
 * /notes/{id}:
 * get:
 * summary: Get a specific note by ID
 * tags: [Notes]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * format: uuid
 * description: ID of the note to retrieve
 * responses:
 * 200:
 * description: Note retrieved successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Note retrieved successfully' }
 * data:
 * $ref: '#/components/schemas/Note'
 * 400:
 * $ref: '#/components/responses/ValidationError'
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 404:
 * description: Note not found or not accessible
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: false }
 * message: { type: string, example: 'Note not found or not accessible' }
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.get('/:id', validateNoteId, handleValidationErrors, notesController.getNoteById);

/**
 * @swagger
 * /notes/{id}:
 * put:
 * summary: Update an existing note
 * tags: [Notes]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * format: uuid
 * description: ID of the note to update
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * title:
 * type: string
 * example: My Updated Idea
 * content:
 * type: string
 * example: This is the updated content of my note. It has new details.
 * tags:
 * type: array
 * items:
 * type: string
 * example: ["updated", "urgent"]
 * isFavorite:
 * type: boolean
 * example: true
 * responses:
 * 200:
 * description: Note updated successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Note updated successfully' }
 * data:
 * $ref: '#/components/schemas/Note'
 * 400:
 * $ref: '#/components/responses/ValidationError'
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 404:
 * description: Note not found or not accessible
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: false }
 * message: { type: string, example: 'Note not found or not accessible' }
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.put('/:id', validateNoteId, validateUpdateNote, handleValidationErrors, notesController.updateNote);

/**
 * @swagger
 * /notes/{id}:
 * delete:
 * summary: Delete a note
 * tags: [Notes]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * format: uuid
 * description: ID of the note to delete
 * responses:
 * 200:
 * description: Note deleted successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Note deleted successfully' }
 * data: { type: 'null' }
 * 400:
 * $ref: '#/components/responses/ValidationError'
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 404:
 * description: Note not found or not accessible
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: false }
 * message: { type: string, example: 'Note not found or not accessible' }
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', validateNoteId, handleValidationErrors, notesController.deleteNote);

/**
 * @swagger
 * /notes/{id}/favorite:
 * patch:
 * summary: Toggle note favorite status
 * tags: [Notes]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * format: uuid
 * description: ID of the note to toggle favorite status
 * responses:
 * 200:
 * description: Note favorite status updated
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Note favorite status updated' }
 * data:
 * $ref: '#/components/schemas/Note'
 * 400:
 * $ref: '#/components/responses/ValidationError'
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 404:
 * description: Note not found or not accessible
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: false }
 * message: { type: string, example: 'Note not found or not accessible' }
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.patch('/:id/favorite', validateNoteId, handleValidationErrors, notesController.toggleFavorite);

module.exports = router;