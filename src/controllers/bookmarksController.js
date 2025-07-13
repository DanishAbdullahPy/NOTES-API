require('@prisma/client'); 
const { extractMetadata } = require('../utils/urlMetadata');
const { sendSuccess, sendError } = require('../utils/response'); 
const prisma = require('../config/database').getClient();
const database = require('../config/database'); 



const createBookmark = async (req, res) => {
  try {
      const prisma = database.getClient();
      const userId = req.user.id;
      const { title, url, description, tags = [], isFavorite = false } = req.body;
      let cleanUrl = url.trim();
      if (!/^https?:\/\//i.test(cleanUrl)) {
          cleanUrl = `http://${cleanUrl}`; 
      }

      const cleanTags = tags
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
          .slice(0, 10); 

      const bookmark = await prisma.bookmark.create({
          data: {
              title,
              url: cleanUrl,
              description,
              tags: cleanTags,
              isFavorite,
              userId,
          },
          select: {
              id: true,
              title: true,
              url: true,
              description: true,
              tags: true,
              isFavorite: true,
              favicon: true,
              createdAt: true,
              updatedAt: true,
              user: { 
                  select: {
                      id: true,
                      name: true,
                      email: true
                  }
              }
          }
      });

      sendSuccess(res, { bookmark }, 'Bookmark created successfully', 201); 

  } catch (error) {
      console.error('Create bookmark error:', error);
      sendError(res, 'Failed to create bookmark', 500);
  }
};

const getBookmarks = async (req, res) => {
  try {
      const prisma = database.getClient();
      const userId = req.user.id;

      const bookmarks = await prisma.bookmark.findMany({
          where: { userId },
          select: {
              id: true,
              title: true,
              url: true,
              description: true,
              tags: true,
              isFavorite: true,
              favicon: true,
              createdAt: true,
              updatedAt: true,
          }
      });

      sendSuccess(res, { bookmarks }, 'Bookmarks retrieved successfully', 200); 

  } catch (error) {
      console.error('Get bookmarks error:', error);
      sendError(res, 'Failed to retrieve bookmarks', 500);
  }
};


const getBookmarkById = async (req, res) => {
  try {
    const prisma = database.getClient();
    const { id } = req.params;
    const userId = req.user.id;

    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!bookmark) {
      return sendError(res, 'Bookmark not found or not accessible', 404);
    }

    sendSuccess(res, { bookmark }, 'Bookmark retrieved successfully', 200);
  } catch (error) {
    console.error('Get bookmark by ID error:', error);
    sendError(res, 'Failed to fetch bookmark', 500);
  }
};

const updateBookmark = async (req, res) => {
  try {
    const prisma = database.getClient();
    const { id } = req.params;
    const { title, url, description, tags, isFavorite } = req.body;
    const userId = req.user.id;

    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingBookmark) {
      return sendError(res, 'Bookmark not found or not accessible', 404);
    }

    if (url) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(url)) {
        return sendError(res, 'Please provide a valid URL starting with http:// or https://', 400);
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (url !== undefined) updateData.url = url;
    if (description !== undefined) updateData.description = description;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;
    if (tags !== undefined) {
      updateData.tags = tags.map(tag => tag.toLowerCase().trim()).filter(tag => tag);
    }

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 'No fields provided for update', 400);
    }

    if (url && url !== existingBookmark.url) {
      try {
        const metadata = await extractMetadata(url);
        if (metadata.favicon) {
          updateData.favicon = metadata.favicon;
        }
      } catch (error) {
        console.log('Could not fetch URL metadata:', error.message);
      }
    }

    const updatedBookmark = await prisma.bookmark.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    sendSuccess(res, { bookmark: updatedBookmark }, 'Bookmark updated successfully', 200);
  } catch (error) {
    console.error('Update bookmark error:', error);

    if (error.code === 'P2002') {
      return sendError(res, 'A bookmark with this URL already exists', 400);
    }

    sendError(res, 'Failed to update bookmark', 500);
  }
};

const deleteBookmark = async (req, res) => {
  try {
    const prisma = database.getClient();
    const { id } = req.params;
    const userId = req.user.id;

    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingBookmark) {
      return sendError(res, 'Bookmark not found or not accessible', 404);
    }

    await prisma.bookmark.delete({
      where: { id }
    });

    sendSuccess(res, {}, 'Bookmark deleted successfully', 200); // Changed data to empty object
  } catch (error) {
    console.error('Delete bookmark error:', error);
    sendError(res, 'Failed to delete bookmark', 500);
  }
};

const getBookmarkStats = async (req, res) => {
  try {
    const prisma = database.getClient();
    const userId = req.user.id;

    const [totalBookmarks, favoriteBookmarks, allTags] = await Promise.all([
      prisma.bookmark.count({ where: { userId } }),
      prisma.bookmark.count({ where: { userId, isFavorite: true } }),
      prisma.bookmark.findMany({
        where: { userId },
        select: { tags: true }
      })
    ]);

    const tagCounts = {};
    allTags.forEach(bookmark => {
      bookmark.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const uniqueTags = Object.keys(tagCounts).length;
    const popularTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    sendSuccess(res, {
      totalBookmarks,
      favoriteBookmarks,
      uniqueTags,
      popularTags
    }, 'Bookmark statistics retrieved successfully', 200);
  } catch (error) {
    console.error('Get bookmark stats error:', error);
    sendError(res, 'Failed to fetch bookmark statistics', 500);
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const prisma = database.getClient();
    const { id } = req.params;
    const userId = req.user.id;

    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingBookmark) {
      return sendError(res, 'Bookmark not found or not accessible', 404);
    }

    const updatedBookmark = await prisma.bookmark.update({
      where: { id },
      data: { isFavorite: !existingBookmark.isFavorite },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    sendSuccess(res, { bookmark: updatedBookmark }, `Bookmark ${updatedBookmark.isFavorite ? 'added to' : 'removed from'} favorites`, 200);
  } catch (error) {
    console.error('Toggle favorite error:', error);
    sendError(res, 'Failed to toggle favorite status', 500);
  }
};

module.exports = {
  createBookmark,
  getBookmarks,
  getBookmarkById,
  updateBookmark,
  deleteBookmark,
  getBookmarkStats,
  toggleFavorite
};