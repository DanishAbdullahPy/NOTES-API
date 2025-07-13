// src/routes/bookmarks.js

const express = require('express');
const router = express.Router();


const { authenticateToken } = require('../middleware/auth'); 
const { handleValidationErrors } = require('../middleware/validation'); 
const { sendSuccess, sendError } = require('../utils/response'); 

const {
    validateCreateBookmark,
    validateUpdateBookmark,
    validateGetBookmarks,
    validateBookmarkId,
    validateUrl, // Use this for URL validation in metadata endpoint
    validateBookmarkMetadata // If you have a specific validator for the metadata payload (e.g., checks 'url' in body)
} = require('../middleware/bookmarkValidation');

const { extractMetadata } = require('../utils/urlMetadata'); 

const {
    createBookmark,
    getBookmarks,
    getBookmarkById,
    updateBookmark,
    deleteBookmark,
    getBookmarkStats,
    toggleFavorite,
    
} = require('../controllers/bookmarksController');


/**
 * @swagger
 * tags:
 * name: Bookmarks
 * description: API for managing user bookmarks
 */

router.use(authenticateToken); 

/**
 * @swagger
 * /bookmarks:
 * post:
 * summary: Create a new bookmark
 * tags: [Bookmarks]
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
 * - url
 * properties:
 * title: { type: string, example: My Favorite Blog Post }
 * url: { type: string, format: uri, example: https://example.com/blog/post }
 * description: { type: string, example: An insightful article about web development. }
 * tags: { type: array, items: { type: string, example: ["webdev", "tutorial"] } }
 * isFavorite: { type: boolean, example: true }
 * responses:
 * 201:
 * description: Bookmark created successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Bookmark created successfully' }
 * data:
 * $ref: '#/components/schemas/Bookmark'
 * 400:
 * $ref: '#/components/responses/ValidationError'
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 409:
 * description: A bookmark with this URL already exists
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: false }
 * message: { type: string, example: 'A bookmark with this URL already exists' }
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.post('/', validateCreateBookmark, handleValidationErrors, createBookmark);

/**
 * @swagger
 * /bookmarks:
 * get:
 * summary: Get all bookmarks for authenticated user with optional filtering
 * tags: [Bookmarks]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: query
 * name: q
 * schema: { type: string }
 * description: Search term for title, description, or URL
 * - in: query
 * name: tags
 * schema: { type: string }
 * description: Comma-separated list of tags to filter by (e.g., 'tech,javascript')
 * - in: query
 * name: isFavorite
 * schema: { type: boolean }
 * description: Filter by favorite status (true/false)
 * - in: query
 * name: page
 * schema: { type: integer, default: 1 }
 * description: Page number for pagination
 * - in: query
 * name: limit
 * schema: { type: integer, default: 10 }
 * description: Number of items per page
 * responses:
 * 200:
 * description: Bookmarks retrieved successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Bookmarks retrieved successfully' }
 * data:
 * type: object
 * properties:
 * bookmarks:
 * type: array
 * items:
 * $ref: '#/components/schemas/Bookmark'
 * pagination:
 * type: object
 * properties:
 * currentPage: { type: integer, example: 1 }
 * totalPages: { type: integer, example: 5 }
 * totalItems: { type: integer, example: 50 }
 * itemsPerPage: { type: integer, example: 10 }
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 403:
 * $ref: '#/components/responses/ForbiddenError'
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.get('/', validateGetBookmarks, handleValidationErrors, getBookmarks);

/**
 * @swagger
 * /bookmarks/stats:
 * get:
 * summary: Get bookmark statistics for authenticated user
 * tags: [Bookmarks]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Bookmark statistics retrieved successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Bookmark statistics retrieved successfully' }
 * data:
 * type: object
 * properties:
 * totalBookmarks: { type: integer, example: 100 }
 * favoriteBookmarks: { type: integer, example: 25 }
 * uniqueTags: { type: integer, example: 15 }
 * popularTags:
 * type: array
 * items:
 * type: object
 * properties:
 * tag: { type: string, example: "webdev" }
 * count: { type: integer, example: 10 }
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 403:
 * $ref: '#/components/responses/ForbiddenError'
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.get('/stats', getBookmarkStats); 
/**
 * @swagger
 * /bookmarks/{id}:
 * get:
 * summary: Get a specific bookmark by ID
 * tags: [Bookmarks]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: string, format: uuid }
 * description: ID of the bookmark to retrieve
 * responses:
 * 200:
 * description: Bookmark retrieved successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Bookmark retrieved successfully' }
 * data: { $ref: '#/components/schemas/Bookmark' }
 * 400:
 * $ref: '#/components/responses/ValidationError'
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 403:
 * $ref: '#/components/responses/ForbiddenError'
 * 404:
 * description: Bookmark not found or not accessible
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: false }
 * message: { type: string, example: 'Bookmark not found or not accessible' }
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.get('/:id', validateBookmarkId, handleValidationErrors, getBookmarkById);

/**
 * @swagger
 * /bookmarks/{id}:
 * put:
 * summary: Update an existing bookmark
 * tags: [Bookmarks]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: string, format: uuid }
 * description: ID of the bookmark to update
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * title: { type: string, example: My Updated Blog Post }
 * url: { type: string, format: uri, example: https://example.com/blog/updated-post }
 * description: { type: string, example: An updated insightful article about web development. }
 * tags: { type: array, items: { type: string, example: ["webdev", "frontend"] } }
 * isFavorite: { type: boolean, example: false }
 * responses:
 * 200:
 * description: Bookmark updated successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Bookmark updated successfully' }
 * data: { $ref: '#/components/schemas/Bookmark' }
 * 400:
 * $ref: '#/components/responses/ValidationError'
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 403:
 * $ref: '#/components/responses/ForbiddenError'
 * 404:
 * description: Bookmark not found or not accessible
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: false }
 * message: { type: string, example: 'Bookmark not found or not accessible' }
 * 409:
 * description: A bookmark with this URL already exists
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: false }
 * message: { type: string, example: 'A bookmark with this URL already exists' }
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.put('/:id', validateBookmarkId, validateUpdateBookmark, handleValidationErrors, updateBookmark);

/**
 * @swagger
 * /bookmarks/{id}:
 * delete:
 * summary: Delete a bookmark
 * tags: [Bookmarks]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: string, format: uuid }
 * description: ID of the bookmark to delete
 * responses:
 * 200:
 * description: Bookmark deleted successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Bookmark deleted successfully' }
 * 400:
 * $ref: '#/components/responses/ValidationError'
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 403:
 * $ref: '#/components/responses/ForbiddenError'
 * 404:
 * description: Bookmark not found or not accessible
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: false }
 * message: { type: string, example: 'Bookmark not found or not accessible' }
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', validateBookmarkId, handleValidationErrors, deleteBookmark);

/**
 * @swagger
 * /bookmarks/{id}/favorite:
 * patch:
 * summary: Toggle bookmark favorite status
 * tags: [Bookmarks]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: string, format: uuid }
 * description: ID of the bookmark to toggle favorite status
 * responses:
 * 200:
 * description: Bookmark favorite status updated
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Bookmark added to favorites' }
 * data: { $ref: '#/components/schemas/Bookmark' }
 * 400:
 * $ref: '#/components/responses/ValidationError'
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 403:
 * $ref: '#/components/responses/ForbiddenError'
 * 404:
 * description: Bookmark not found or not accessible
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: false }
 * message: { type: string, example: 'Bookmark not found or not accessible' }
 * 500:
 * $ref: '#/components/responses/ServerError'
 */
router.patch('/:id/favorite', validateBookmarkId, handleValidationErrors, toggleFavorite);

/**
 * @swagger
 * /bookmarks/metadata:
 * post:
 * summary: Fetch URL metadata for bookmark creation
 * tags: [Bookmarks]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - url
 * properties:
 * url: { type: string, format: uri, example: https://www.google.com }
 * responses:
 * 200:
 * description: URL metadata retrieved successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'URL metadata retrieved successfully' }
 * data:
 * type: object
 * properties:
 * title: { type: string, example: "Google" }
 * description: { type: string, example: "Search the world's information..." }
 * image: { type: string, example: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" }
 * favicon: { type: string, example: "https://www.google.com/favicon.ico" }
 * 400:
 * $ref: '#/components/responses/ValidationError'
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 403:
 * $ref: '#/components/responses/ForbiddenError'
 * 500:
 * description: Failed to fetch URL metadata
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: false }
 * message: { type: string, example: 'Failed to fetch URL metadata' }
 * error: { type: string, example: 'Network error or invalid URL' }
 */
router.post('/metadata', validateUrl, handleValidationErrors, async (req, res) => { 
    try {
        const { url } = req.body;
        const metadata = await extractMetadata(url);
        sendSuccess(res, metadata, 'URL metadata retrieved successfully', 200);
    } catch (error) {
        console.error('Fetch metadata error:', error);
        sendError(res, 'Failed to fetch URL metadata', 400, { error: error.message });
    }
});

module.exports = router;