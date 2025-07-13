const express = require('express');
const router = express.Router();
const { globalSearch, getUserTags, getPopularTags, getSearchSuggestions, advancedSearch } = require('../utils/search');
const { authenticateToken } = require('../middleware/auth'); 
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

    res.json(results);
  } catch (error) {
    console.error("Error in /api/search:", error); 
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
});

// Advanced search endpoint
router.post('/advanced-search', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const results = await advancedSearch(userId, req.body);
    res.json(results);
  } catch (error) {
    console.error("Error in /api/advanced-search:", error); 
    res.status(500).json({ message: 'Advanced search failed', error: error.message });
  }
});

// Tags endpoints
router.get('/tags', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const tags = await getUserTags(userId);
    res.json({ tags });
  } catch (error) {
    console.error("Error in /api/tags:", error); // Added logging
    res.status(500).json({ message: 'Failed to get tags', error: error.message });
  }
});

router.get('/popular-tags', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;
    const tags = await getPopularTags(userId, parseInt(limit));
    res.json({ tags });
  } catch (error) {
    console.error("Error in /api/popular-tags:", error); 
    res.status(500).json({ message: 'Failed to get popular tags', error: error.message });
  }
});

router.get('/search-suggestions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;
    const suggestions = await getSearchSuggestions(userId, query);
    res.json({ suggestions });
  } catch (error) {
    console.error("Error in /api/search-suggestions:", error); 
    res.status(500).json({ message: 'Failed to get suggestions', error: error.message });
  }
});

module.exports = router;