const database = require('../config/database');
const { sendSuccess, sendError, sendBadRequest, sendNotFound } = require('../utils/response');

const getAllNotes = async (req, res) => {
  try {
    const prisma = database.getClient();
    const userId = req.user.id;

    const {
      q = '',
      tags = '',
      page = 1,
      limit = 10,
      favorite = null,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const searchConditions = {
      userId: userId,
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } }
        ]
      }),
      ...(tags && {
        tags: {
          hasSome: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        }
      }),
      ...(favorite !== null && favorite !== undefined && { isFavorite: favorite === 'true' })
    };

    const [notes, totalCount] = await Promise.all([
      prisma.note.findMany({
        where: searchConditions,
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take,
        select: {
          id: true,
          title: true,
          content: true,
          tags: true,
          isFavorite: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.note.count({
        where: searchConditions
      })
    ]);

    const totalPages = Math.ceil(totalCount / take);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    sendSuccess(res, {
      notes,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext,
        hasPrev,
        limit: take
      }
    }, 'Notes retrieved successfully', 200);

  } catch (error) {
    console.error('Get notes error:', error);
    sendError(res, 'Failed to retrieve notes', 500);
  }
};


const getNoteById = async (req, res) => {
  try {
    const prisma = database.getClient();
    const userId = req.user.id;
    const noteId = req.params.id;

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: userId
      },
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
        isFavorite: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!note) {
      return sendNotFound(res, 'Note not found or not accessible');
    }

    // Corrected sendSuccess call
    sendSuccess(res, { note }, 'Note retrieved successfully', 200);

  } catch (error) {
    console.error('Get note by ID error:', error);
    sendError(res, 'Failed to retrieve note', 500);
  }
};


const createNote = async (req, res) => {
  try {
    const prisma = database.getClient();
    const userId = req.user.id;
    const { title, content, tags = [], isFavorite = false } = req.body;

    const cleanTags = tags
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 10); // Limit tags to 10

    const note = await prisma.note.create({
      data: {
        title,
        content,
        tags: cleanTags,
        isFavorite,
        userId
      },
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
        isFavorite: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Corrected sendSuccess call
    sendSuccess(res, { note }, 'Note created successfully', 201);

  } catch (error) {
    console.error('Create note error:', error);
    sendError(res, 'Failed to create note', 500);
  }
};


const updateNote = async (req, res) => {
  try {
    const prisma = database.getClient();
    const userId = req.user.id;
    const noteId = req.params.id;
    const { title, content, tags, isFavorite } = req.body; // Removed default [] for tags here as validation handles missing

    const existingNote = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: userId
      }
    });

    if (!existingNote) {
      return sendNotFound(res, 'Note not found or not accessible');
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;

    // Only process tags if provided and it's an array
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        const cleanTags = tags
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
          .slice(0, 10);
        updateData.tags = cleanTags;
      } else {
        // If tags are provided but not an array, send a bad request
        return sendBadRequest(res, 'Tags must be an array of strings');
      }
    }
    
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    // If no fields were provided for update
    if (Object.keys(updateData).length === 0) {
      return sendBadRequest(res, 'No fields provided for update');
    }

    const note = await prisma.note.update({
      where: {
        id: noteId
      },
      data: updateData,
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
        isFavorite: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Corrected sendSuccess call
    sendSuccess(res, { note }, 'Note updated successfully', 200);

  } catch (error) {
    console.error('Update note error:', error);
    sendError(res, 'Failed to update note', 500);
  }
};


const deleteNote = async (req, res) => {
  try {
    const prisma = database.getClient();
    const userId = req.user.id;
    const noteId = req.params.id;

    const existingNote = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: userId
      }
    });

    if (!existingNote) {
      return sendNotFound(res, 'Note not found or not accessible');
    }

    await prisma.note.delete({
      where: {
        id: noteId
      }
    });

    // This was already correct
    sendSuccess(res, null, 'Note deleted successfully', 200);

  } catch (error) {
    console.error('Delete note error:', error);
    sendError(res, 'Failed to delete note', 500);
  }
};


const toggleFavorite = async (req, res) => {
  try {
    const prisma = database.getClient();
    const userId = req.user.id;
    const noteId = req.params.id;

    const existingNote = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: userId
      }
    });

    if (!existingNote) {
      return sendNotFound(res, 'Note not found or not accessible');
    }

    const note = await prisma.note.update({
      where: {
        id: noteId
      },
      data: {
        isFavorite: !existingNote.isFavorite
      },
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
        isFavorite: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Corrected sendSuccess call
    sendSuccess(res, { note }, 'Note favorite status updated', 200);

  } catch (error) {
    console.error('Toggle favorite error:', error);
    sendError(res, 'Failed to update favorite status', 500);
  }
};


const getNotesStats = async (req, res) => {
  try {
    const prisma = database.getClient();
    const userId = req.user.id;

    const [totalNotes, favoriteNotes, allTags] = await Promise.all([
      prisma.note.count({
        where: { userId }
      }),
      prisma.note.count({
        where: { userId, isFavorite: true }
      }),
      prisma.note.findMany({
        where: { userId },
        select: { tags: true }
      })
    ]);

    const tagCount = {};
    allTags.forEach(note => {
      note.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    const popularTags = Object.entries(tagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    sendSuccess(res, {
      totalNotes,
      favoriteNotes,
      popularTags
    }, 'Notes statistics retrieved successfully', 200);

  } catch (error) {
    console.error('Get notes stats error:', error);
    sendError(res, 'Failed to retrieve notes statistics', 500);
  }
};

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  toggleFavorite,
  getNotesStats
};