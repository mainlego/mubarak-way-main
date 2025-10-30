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

/**
 * POST /api/v1/admin/sync-data
 * Trigger data synchronization (seed + quran)
 * This endpoint runs the sync in background and returns immediately
 */
router.post('/sync-data', async (req, res) => {
  try {
    console.log('🚀 Admin triggered complete data sync...');

    const { exec } = await import('child_process');
    const Surah = (await import('../models/Surah.js')).default;
    const Ayah = (await import('../models/Ayah.js')).default;
    const Book = (await import('../models/Book.js')).default;
    const Nashid = (await import('../models/Nashid.js')).default;

    // Return immediately - sync runs in background
    res.json({
      success: true,
      message: 'Data synchronization started in background',
      data: {
        jobId: Date.now().toString(),
        steps: ['Database seeding', 'Quran synchronization'],
        estimatedTime: '15-20 minutes',
        note: 'Check /api/v1/admin/db-status for progress',
      },
    });

    // Run sync in background
    (async () => {
      try {
        // Step 1: Seed database
        console.log('📦 Step 1/2: Seeding database...');
        const seedProcess = exec('npm run seed', {
          cwd: process.cwd(),
          env: process.env,
        });

        await new Promise((resolve, reject) => {
          seedProcess.on('close', (code) => {
            if (code === 0) {
              console.log('✅ Step 1/2: Database seeding completed');
              resolve(true);
            } else {
              reject(new Error(`Seeding failed with code ${code}`));
            }
          });
        });

        // Step 2: Sync Quran
        console.log('📖 Step 2/2: Syncing Quran...');
        const syncProcess = exec('npm run sync:quran:ereplika -- --all', {
          cwd: process.cwd(),
          env: process.env,
          maxBuffer: 10 * 1024 * 1024,
        });

        await new Promise((resolve, reject) => {
          syncProcess.on('close', (code) => {
            if (code === 0) {
              console.log('✅ Step 2/2: Quran sync completed');
              resolve(true);
            } else {
              reject(new Error(`Quran sync failed with code ${code}`));
            }
          });
        });

        // Final stats
        const stats = {
          surahs: await Surah.countDocuments(),
          ayahs: await Ayah.countDocuments(),
          books: await Book.countDocuments(),
          nashids: await Nashid.countDocuments(),
        };

        console.log('✅ Complete data sync finished:', stats);
      } catch (error) {
        console.error('❌ Complete data sync failed:', error);
      }
    })();
  } catch (error) {
    console.error('Error starting sync:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to start data synchronization',
      },
    });
  }
});

/**
 * GET /api/v1/admin/db-status
 * Get database statistics (document counts)
 */
router.get('/db-status', async (req, res) => {
  try {
    const Surah = (await import('../models/Surah.js')).default;
    const Ayah = (await import('../models/Ayah.js')).default;
    const Book = (await import('../models/Book.js')).default;
    const Nashid = (await import('../models/Nashid.js')).default;

    const stats = {
      surahs: await Surah.countDocuments(),
      ayahs: await Ayah.countDocuments(),
      books: await Book.countDocuments(),
      nashids: await Nashid.countDocuments(),
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching db status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch database status',
      },
    });
  }
});

export default router;
