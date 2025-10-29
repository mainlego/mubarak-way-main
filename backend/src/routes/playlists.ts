import { Router, Request, Response } from 'express';
import { Playlist } from '../models/Playlist.js';
import type { ApiResponse } from '@mubarak-way/shared';

const router = Router();

/**
 * GET /api/v1/playlists/:userId
 * Get all playlists for a user
 */
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const playlists = await Playlist.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: playlists,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get playlists error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_PLAYLISTS_ERROR',
        message: error.message || 'Failed to get playlists',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/playlists
 * Create a new playlist
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, name, nashids = [] } = req.body;

    if (!userId || !name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'userId and name are required',
        },
      } as ApiResponse);
    }

    // Check if playlist with same name already exists
    const existing = await Playlist.findOne({ userId, name });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'PLAYLIST_EXISTS',
          message: 'Playlist with this name already exists',
        },
      } as ApiResponse);
    }

    const playlist = new Playlist({
      userId,
      name,
      nashids,
    });

    await playlist.save();

    res.status(201).json({
      success: true,
      data: playlist,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Create playlist error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_PLAYLIST_ERROR',
        message: error.message || 'Failed to create playlist',
      },
    } as ApiResponse);
  }
});

/**
 * PUT /api/v1/playlists/:playlistId
 * Update playlist (name or nashids)
 */
router.put('/:playlistId', async (req: Request, res: Response) => {
  try {
    const { playlistId } = req.params;
    const { name, nashids } = req.body;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PLAYLIST_NOT_FOUND',
          message: 'Playlist not found',
        },
      } as ApiResponse);
    }

    if (name) playlist.name = name;
    if (nashids) playlist.nashids = nashids;

    await playlist.save();

    res.json({
      success: true,
      data: playlist,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Update playlist error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_PLAYLIST_ERROR',
        message: error.message || 'Failed to update playlist',
      },
    } as ApiResponse);
  }
});

/**
 * DELETE /api/v1/playlists/:playlistId
 * Delete a playlist
 */
router.delete('/:playlistId', async (req: Request, res: Response) => {
  try {
    const { playlistId } = req.params;

    const playlist = await Playlist.findByIdAndDelete(playlistId);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PLAYLIST_NOT_FOUND',
          message: 'Playlist not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: { message: 'Playlist deleted successfully' },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Delete playlist error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_PLAYLIST_ERROR',
        message: error.message || 'Failed to delete playlist',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/playlists/:playlistId/nashids
 * Add nashid to playlist
 */
router.post('/:playlistId/nashids', async (req: Request, res: Response) => {
  try {
    const { playlistId } = req.params;
    const nashid = req.body;

    if (!nashid || !nashid.nashidId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_NASHID',
          message: 'nashid with nashidId is required',
        },
      } as ApiResponse);
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PLAYLIST_NOT_FOUND',
          message: 'Playlist not found',
        },
      } as ApiResponse);
    }

    playlist.addNashid(nashid);
    await playlist.save();

    res.json({
      success: true,
      data: playlist,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Add nashid to playlist error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ADD_NASHID_ERROR',
        message: error.message || 'Failed to add nashid to playlist',
      },
    } as ApiResponse);
  }
});

/**
 * DELETE /api/v1/playlists/:playlistId/nashids/:nashidId
 * Remove nashid from playlist
 */
router.delete('/:playlistId/nashids/:nashidId', async (req: Request, res: Response) => {
  try {
    const { playlistId, nashidId } = req.params;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PLAYLIST_NOT_FOUND',
          message: 'Playlist not found',
        },
      } as ApiResponse);
    }

    playlist.removeNashid(nashidId);
    await playlist.save();

    res.json({
      success: true,
      data: playlist,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Remove nashid from playlist error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REMOVE_NASHID_ERROR',
        message: error.message || 'Failed to remove nashid from playlist',
      },
    } as ApiResponse);
  }
});

export default router;
