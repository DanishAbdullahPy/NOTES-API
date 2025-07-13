const express = require('express');
const router = express.Router();
const { globalSearch, getUserTags, getPopularTags, getSearchSuggestions, advancedSearch } = require('../utils/search');
const { authenticateToken } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @swagger
 * tags:
 * name: Search
 * description: Global search, tags, and suggestions
 */

/**
 * @swagger
 * /search:
 * get:
 * summary: Perform a global search across notes and bookmarks
 * tags: [Search]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: query
 * name: query
 * schema:
 * type: string
 * description: Search term for titles, content, or URLs
 * - in: query
 * name: type
 * schema:
 * type: string
 * enum: [note, bookmark]
 * description: Optional. Filter results by type (note or bookmark)
 * - in: query
 * name: tags
 * schema:
 * type: string
 * description: Optional. Comma-separated list of tags to filter by (e.g., 'work,ideas')
 * - in: query
 * name: isFavorite
 * schema:
 * type: boolean
 * description: Optional. Filter by favorite status (true/false)
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
 * enum: [createdAt, updatedAt, title, url]
 * description: Field to sort by
 * - in: query
 * name: sortOrder
 * schema:
 * type: string
 * default: desc
 * enum: [asc, desc]
 * description: Sort order (asc/desc)
 * responses:
 * 200:
 * description: Search results retrieved successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Search results retrieved successfully' }
 * data:
 * type: object
 * properties:
 * notes:
 * type: array
 * items:
 * $ref: '#/components/schemas/Note'
 * bookmarks:
 * type: array
 * items:
 * $ref: '#/components/schemas/Bookmark'
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
 * 403:
 * $ref: '#/components/responses/ForbiddenError'
 * 500:
 * $ref: '#/components/responses/InternalServerError' # Changed from ServerError to InternalServerError to match common definitions
 */
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query, type, tags, isFavorite, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const userId = req.user.id;

    const results = await globalSearch(userId, query, {
      type,
      tags: tags ? tags.split(',') : [],
      isFavorite: isFavorite ? isFavorite === 'true' : null,
      page,
      limit,
      sortBy,
      sortOrder
    });

    sendSuccess(res, 'Search results retrieved successfully', 200, results);
  } catch (error) {
    console.error("Error in /api/search:", error);
    sendError(res, 'Search failed', 500, { error: error.message });
  }
});

/**
 * @swagger
 * /advanced-search:
 * post:
 * summary: Perform an advanced search with specific criteria
 * tags: [Search]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * type:
 * type: string
 * enum: [note, bookmark]
 * description: Type of item to search (note or bookmark)
 * keyword:
 * type: string
 * description: Keyword to search in title/content/url
 * tags:
 * type: array
 * items:
 * type: string
 * description: List of tags to filter by
 * isFavorite:
 * type: boolean
 * description: Filter by favorite status
 * dateRange:
 * type: object
 * properties:
 * startDate: { type: string, format: date-time, description: ISO date string for start of range }
 * endDate: { type: string, format: date-time, description: ISO date string for end of range }
 * page:
 * type: integer
 * default: 1
 * limit:
 * type: integer
 * default: 10
 * sortBy:
 * type: string
 * default: createdAt
 * enum: [createdAt, updatedAt, title, url]
 * sortOrder:
 * type: string
 * default: desc
 * enum: [asc, desc]
 * responses:
 * 200:
 * description: Advanced search results retrieved successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Advanced search results retrieved successfully' }
 * data:
 * type: object
 * properties:
 * notes:
 * type: array
 * items:
 * $ref: '#/components/schemas/Note'
 * bookmarks:
 * type: array
 * items:
 * $ref: '#/components/schemas/Bookmark'
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
 * 403:
 * $ref: '#/components/responses/ForbiddenError'
 * 500:
 * $ref: '#/components/responses/InternalServerError' # Changed from ServerError
 */
router.post('/advanced-search', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const results = await advancedSearch(userId, req.body);
    sendSuccess(res, 'Advanced search results retrieved successfully', 200, results);
  } catch (error) {
    console.error("Error in /api/advanced-search:", error);
    sendError(res, 'Advanced search failed', 500, { error: error.message });
  }
});

/**
 * @swagger
 * /tags:
 * get:
 * summary: Get all unique tags used by the authenticated user
 * tags: [Search]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: User tags retrieved successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'User tags retrieved successfully' }
 * data:
 * type: object
 * properties:
 * tags:
 * type: array
 * items:
 * type: string
 * example: ["webdev", "productivity", "ideas"]
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 403:
 * $ref: '#/components/responses/ForbiddenError'
 * 500:
 * $ref: '#/components/responses/InternalServerError' # Changed from ServerError
 */
router.get('/tags', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const tags = await getUserTags(userId);
    sendSuccess(res, 'User tags retrieved successfully', 200, { tags });
  } catch (error) {
    console.error("Error in /api/tags:", error);
    sendError(res, 'Failed to get tags', 500, { error: error.message });
  }
});

/**
 * @swagger
 * /popular-tags:
 * get:
 * summary: Get the most popular tags used by the authenticated user
 * tags: [Search]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: query
 * name: limit
 * schema:
 * type: integer
 * default: 10
 * description: Number of popular tags to return
 * responses:
 * 200:
 * description: Popular tags retrieved successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Popular tags retrieved successfully' }
 * data:
 * type: object
 * properties:
 * tags:
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
 * $ref: '#/components/responses/InternalServerError' # Changed from ServerError
 */
router.get('/popular-tags', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;
    const tags = await getPopularTags(userId, parseInt(limit));
    sendSuccess(res, 'Popular tags retrieved successfully', 200, { tags });
  } catch (error) {
    console.error("Error in /api/popular-tags:", error);
    sendError(res, 'Failed to get popular tags', 500, { error: error.message });
  }
});

/**
 * @swagger
 * /search-suggestions:
 * get:
 * summary: Get search suggestions based on the user's notes and bookmarks
 * tags: [Search]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: query
 * name: query
 * schema:
 * type: string
 * required: true
 * description: The partial search query to get suggestions for
 * responses:
 * 200:
 * description: Search suggestions retrieved successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: 'Search suggestions retrieved successfully' }
 * data:
 * type: object
 * properties:
 * suggestions:
 * type: array
 * items:
 * type: string
 * example: ["my project", "important notes", "web development tutorial"]
 * 401:
 * $ref: '#/components/responses/UnauthorizedError'
 * 403:
 * $ref: '#/components/responses/ForbiddenError'
 * 500:
 * $ref: '#/components/responses/InternalServerError' # Changed from ServerError
 */
router.get('/search-suggestions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;
    const suggestions = await getSearchSuggestions(userId, query);
    sendSuccess(res, 'Search suggestions retrieved successfully', 200, { suggestions });
  } catch (error) {
    console.error("Error in /api/search-suggestions:", error);
    sendError(res, 'Failed to get suggestions', 500, { error: error.message });
  }
});

module.exports = router;