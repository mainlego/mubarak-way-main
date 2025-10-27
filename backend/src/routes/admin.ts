import { Router } from 'express';
import { AdminService } from '../services/AdminService.js';
import { validateTelegramAuth, requireTelegramAdmin } from '../middlewares/auth.js';
import type { UserRole, SubscriptionTier } from '@mubarak-way/shared';

const router = Router();

// All admin routes require Telegram auth + admin role
router.use(validateTelegramAuth, requireTelegramAdmin);

/**
 * GET /api/v1/admin/stats
 * Get comprehensive admin statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await AdminService.getAdminStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch admin statistics',
      },
    });
  }
});

/**
 * GET /api/v1/admin/users
 * Get list of users with filters
 */
router.get('/users', async (req, res) => {
  try {
    const { role, subscriptionTier, search, isActive, limit, skip } = req.query;

    const filters = {
      role: role as UserRole,
      subscriptionTier: subscriptionTier as SubscriptionTier,
      search: search as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      skip: skip ? parseInt(skip as string) : undefined,
    };

    const result = await AdminService.getUsers(filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch users',
      },
    });
  }
});

/**
 * GET /api/v1/admin/users/:id
 * Get single user details
 */
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await AdminService.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch user',
      },
    });
  }
});

/**
 * GET /api/v1/admin/users/:id/activity
 * Get user activity details
 */
router.get('/users/:id/activity', async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await AdminService.getUserActivity(id);

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch user activity',
      },
    });
  }
});

/**
 * PUT /api/v1/admin/users/:id/role
 * Update user role
 */
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid role is required (user, admin, moderator)',
        },
      });
    }

    const user = await AdminService.updateUserRole(id, role as UserRole);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user role',
      },
    });
  }
});

/**
 * PUT /api/v1/admin/users/:id/subscription
 * Update user subscription
 */
router.put('/users/:id/subscription', async (req, res) => {
  try {
    const { id } = req.params;
    const { tier, isActive, expiresAt } = req.body;

    if (!tier || !['free', 'pro', 'premium'].includes(tier)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid tier is required (free, pro, premium)',
        },
      });
    }

    const user = await AdminService.updateUserSubscription(
      id,
      tier as SubscriptionTier,
      isActive !== undefined ? isActive : true,
      expiresAt ? new Date(expiresAt) : undefined
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error updating user subscription:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user subscription',
      },
    });
  }
});

/**
 * DELETE /api/v1/admin/users/:id
 * Delete user and all their data
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user?.id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cannot delete your own account',
        },
      });
    }

    const deleted = await AdminService.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete user',
      },
    });
  }
});

/**
 * GET /api/v1/admin/bookmarks/public
 * Get public bookmarks for moderation
 */
router.get('/bookmarks/public', async (req, res) => {
  try {
    const { limit, skip } = req.query;

    const result = await AdminService.getPublicBookmarks(
      limit ? parseInt(limit as string) : undefined,
      skip ? parseInt(skip as string) : undefined
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching public bookmarks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch public bookmarks',
      },
    });
  }
});

/**
 * GET /api/v1/admin/activity/timeline
 * Get recent activity timeline across all users
 */
router.get('/activity/timeline', async (req, res) => {
  try {
    const { limit } = req.query;

    const timeline = await AdminService.getActivityTimeline(
      limit ? parseInt(limit as string) : undefined
    );

    res.json({
      success: true,
      data: timeline,
    });
  } catch (error) {
    console.error('Error fetching activity timeline:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch activity timeline',
      },
    });
  }
});

export default router;
