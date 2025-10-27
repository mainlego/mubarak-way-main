import { Router, Request, Response } from 'express';
import { BookmarkService } from '../services/BookmarkService.js';
import { validateTelegramAuth } from '../middlewares/auth.js';
import type { ApiResponse } from '@mubarak-way/shared';

const router = Router();

/**
 * POST /api/v1/bookmarks
 * Create a new bookmark
 */
router.post('/', validateTelegramAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const bookmark = await BookmarkService.createBookmark(userId, req.body);

    res.status(201).json({
      success: true,
      data: bookmark,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Create bookmark error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_BOOKMARK_ERROR',
        message: error.message || 'Failed to create bookmark',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/bookmarks
 * Get all bookmarks for the user
 */
router.get('/', validateTelegramAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const filters = {
      collection: req.query.collection as any,
      type: req.query.type as any,
      folder: req.query.folder as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      search: req.query.search as string,
    };

    const bookmarks = await BookmarkService.getUserBookmarks(userId, filters);

    res.json({
      success: true,
      data: bookmarks,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_BOOKMARKS_ERROR',
        message: error.message || 'Failed to get bookmarks',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/bookmarks/stats
 * Get bookmark statistics
 */
router.get('/stats', validateTelegramAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const stats = await BookmarkService.getBookmarkStats(userId);

    res.json({
      success: true,
      data: stats,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get bookmark stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_STATS_ERROR',
        message: error.message || 'Failed to get bookmark stats',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/bookmarks/share/:shareCode
 * Get a shared bookmark (no auth required)
 */
router.get('/share/:shareCode', async (req: Request, res: Response) => {
  try {
    const { shareCode } = req.params;
    const bookmark = await BookmarkService.getBookmarkByShareCode(shareCode);

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKMARK_NOT_FOUND',
          message: 'Bookmark not found or not public',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: bookmark,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get shared bookmark error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_SHARED_BOOKMARK_ERROR',
        message: error.message || 'Failed to get shared bookmark',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/bookmarks/:id
 * Get a single bookmark
 */
router.get('/:id', validateTelegramAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { id } = req.params;
    const bookmark = await BookmarkService.getBookmarkById(id, userId);

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKMARK_NOT_FOUND',
          message: 'Bookmark not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: bookmark,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get bookmark error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_BOOKMARK_ERROR',
        message: error.message || 'Failed to get bookmark',
      },
    } as ApiResponse);
  }
});

/**
 * PUT /api/v1/bookmarks/:id
 * Update a bookmark
 */
router.put('/:id', validateTelegramAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { id } = req.params;
    const bookmark = await BookmarkService.updateBookmark(id, userId, req.body);

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKMARK_NOT_FOUND',
          message: 'Bookmark not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: bookmark,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Update bookmark error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_BOOKMARK_ERROR',
        message: error.message || 'Failed to update bookmark',
      },
    } as ApiResponse);
  }
});

/**
 * DELETE /api/v1/bookmarks/:id
 * Delete a bookmark
 */
router.delete('/:id', validateTelegramAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { id } = req.params;
    const success = await BookmarkService.deleteBookmark(id, userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKMARK_NOT_FOUND',
          message: 'Bookmark not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: { deleted: true },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Delete bookmark error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_BOOKMARK_ERROR',
        message: error.message || 'Failed to delete bookmark',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/bookmarks/:id/tags
 * Add a tag to a bookmark
 */
router.post('/:id/tags', validateTelegramAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { id } = req.params;
    const { tag } = req.body;

    const bookmark = await BookmarkService.addTag(id, userId, tag);

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKMARK_NOT_FOUND',
          message: 'Bookmark not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: bookmark,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Add tag error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ADD_TAG_ERROR',
        message: error.message || 'Failed to add tag',
      },
    } as ApiResponse);
  }
});

/**
 * DELETE /api/v1/bookmarks/:id/tags/:tag
 * Remove a tag from a bookmark
 */
router.delete('/:id/tags/:tag', validateTelegramAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { id, tag } = req.params;

    const bookmark = await BookmarkService.removeTag(id, userId, tag);

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKMARK_NOT_FOUND',
          message: 'Bookmark not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: bookmark,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Remove tag error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REMOVE_TAG_ERROR',
        message: error.message || 'Failed to remove tag',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/bookmarks/:id/annotations
 * Add an annotation to a bookmark
 */
router.post('/:id/annotations', validateTelegramAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { id } = req.params;
    const { annotation } = req.body;

    const bookmark = await BookmarkService.addAnnotation(id, userId, annotation);

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKMARK_NOT_FOUND',
          message: 'Bookmark not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: bookmark,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Add annotation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ADD_ANNOTATION_ERROR',
        message: error.message || 'Failed to add annotation',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/bookmarks/:id/share
 * Generate a share code for a bookmark
 */
router.post('/:id/share', validateTelegramAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { id } = req.params;

    const shareCode = await BookmarkService.generateShareCode(id, userId);

    if (!shareCode) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKMARK_NOT_FOUND',
          message: 'Bookmark not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: { shareCode },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Generate share code error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATE_SHARE_CODE_ERROR',
        message: error.message || 'Failed to generate share code',
      },
    } as ApiResponse);
  }
});

/**
 * PUT /api/v1/bookmarks/:id/folder
 * Move bookmark to a different folder
 */
router.put('/:id/folder', validateTelegramAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { id } = req.params;
    const { folder } = req.body;

    const bookmark = await BookmarkService.moveToFolder(id, userId, folder);

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKMARK_NOT_FOUND',
          message: 'Bookmark not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: bookmark,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Move to folder error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MOVE_TO_FOLDER_ERROR',
        message: error.message || 'Failed to move bookmark',
      },
    } as ApiResponse);
  }
});

/**
 * PUT /api/v1/bookmarks/:id/collection
 * Change bookmark collection
 */
router.put('/:id/collection', validateTelegramAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { id } = req.params;
    const { collection } = req.body;

    const bookmark = await BookmarkService.changeCollection(id, userId, collection);

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKMARK_NOT_FOUND',
          message: 'Bookmark not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: bookmark,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Change collection error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CHANGE_COLLECTION_ERROR',
        message: error.message || 'Failed to change collection',
      },
    } as ApiResponse);
  }
});

export default router;
