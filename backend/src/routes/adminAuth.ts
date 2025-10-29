import { Router, type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AdminModel from '../models/Admin.js';
import BookModel from '../models/Book.js';
import NashidModel from '../models/Nashid.js';
import UserModel from '../models/User.js';
import SubscriptionPlanModel from '../models/SubscriptionPlan.js';

const router = Router();

// JWT Secret for admin authentication (separate from Telegram auth)
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'mubarakway-admin-secret-2025';

// ============ TYPES ============

interface AuthenticatedRequest extends Request {
  admin?: InstanceType<typeof AdminModel>;
}

// ============ MIDDLEWARE ============

/**
 * Middleware for JWT-based admin authentication
 * Validates JWT token and attaches admin to request
 */
const authenticateAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No token provided'
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    const admin = await AdminModel.findById(decoded.id);

    if (!admin || !admin.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid token or admin inactive'
      });
      return;
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// ============ AUTHENTICATION ROUTES ============

/**
 * POST /api/admin/login
 * Admin login with username/password
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
      return;
    }

    const admin = await AdminModel.findOne({ username });

    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    if (!admin.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is inactive'
      });
      return;
    }

    // Update last login
    await admin.updateLastLogin();

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/verify
 * Verify JWT token and return admin info
 */
router.get('/verify', authenticateAdmin, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.admin) {
    res.status(401).json({ success: false, message: 'Admin not found' });
    return;
  }

  res.json({
    success: true,
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      email: req.admin.email,
      role: req.admin.role,
      permissions: req.admin.permissions
    }
  });
});

// ============ ADMIN PROFILE MANAGEMENT ============

/**
 * PUT /api/admin/profile
 * Update admin profile (username, email)
 */
router.put('/profile', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      res.status(400).json({
        success: false,
        message: 'Username and email are required'
      });
      return;
    }

    // Check if username/email already taken by another admin
    const existingAdmin = await AdminModel.findOne({
      $or: [{ username }, { email }],
      _id: { $ne: req.admin!._id }
    });

    if (existingAdmin) {
      res.status(400).json({
        success: false,
        message: 'Username or email already taken'
      });
      return;
    }

    // Update admin
    const admin = await AdminModel.findByIdAndUpdate(
      req.admin!._id,
      { username, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/admin/password
 * Change admin password
 */
router.put('/password', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters'
      });
      return;
    }

    // Get admin with password
    const admin = await AdminModel.findById(req.admin!._id);

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
      return;
    }

    // Verify current password
    const isPasswordValid = await admin.comparePassword(currentPassword);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    // Update password (will be hashed by pre-save hook)
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============ DASHBOARD STATS ============

/**
 * GET /api/admin/stats
 * Get comprehensive admin dashboard statistics
 */
router.get('/stats', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [
      totalBooks,
      totalNashids,
      totalUsers,
      activeUsers,
      premiumUsers
    ] = await Promise.all([
      BookModel.countDocuments(),
      NashidModel.countDocuments(),
      UserModel.countDocuments(),
      UserModel.countDocuments({
        'subscription.isActive': true,
        'subscription.expiresAt': { $gte: new Date() }
      }),
      UserModel.countDocuments({
        'subscription.tier': { $in: ['pro', 'premium'] },
        'subscription.isActive': true
      })
    ]);

    const recentUsers = await UserModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName telegramId createdAt subscription');

    res.json({
      success: true,
      stats: {
        totalBooks,
        totalNashids,
        totalUsers,
        activeUsers,
        premiumUsers,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============ BOOKS MANAGEMENT ============

/**
 * GET /api/admin/books
 * Get all books with filters and pagination
 */
router.get('/books', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', search, category, language } = req.query;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;
    if (language) filter.language = language;

    const books = await BookModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const count = await BookModel.countDocuments(filter);

    res.json({
      success: true,
      books,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      total: count
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch books',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/books/:id
 * Get single book by ID
 */
router.get('/books/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const book = await BookModel.findById(req.params.id);

    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Book not found'
      });
      return;
    }

    res.json({ success: true, book });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch book',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/books
 * Create new book (requires canManageBooks permission)
 */
router.post('/books', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin!.permissions.canManageBooks) {
      res.status(403).json({
        success: false,
        message: 'No permission to manage books'
      });
      return;
    }

    console.log('Creating book with data:', JSON.stringify(req.body, null, 2));

    // Generate bookId automatically
    const lastBook = await BookModel.findOne().sort({ bookId: -1 }).limit(1);
    const nextBookId = lastBook ? lastBook.bookId + 1 : 1;

    console.log(`Generated bookId: ${nextBookId}`);

    const bookData = {
      ...req.body,
      bookId: nextBookId
    };

    const book = new BookModel(bookData);
    await book.save();

    console.log(`Book created: ${book.title} (bookId: ${book.bookId})`);

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create book',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/admin/books/:id
 * Update book (requires canManageBooks permission)
 */
router.put('/books/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin!.permissions.canManageBooks) {
      res.status(403).json({
        success: false,
        message: 'No permission to manage books'
      });
      return;
    }

    console.log('Updating book:', req.params.id);
    console.log('Update data:', req.body);

    // Get existing book
    const existingBook = await BookModel.findById(req.params.id);

    if (!existingBook) {
      res.status(404).json({
        success: false,
        message: 'Book not found'
      });
      return;
    }

    // If PDF file changed, reset extracted text
    let shouldResetText = false;
    if (req.body.content && req.body.content !== existingBook.content) {
      console.log('PDF changed, resetting extracted text');
      shouldResetText = true;
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      extractedText: shouldResetText ? '' : (req.body.extractedText !== undefined ? req.body.extractedText : existingBook.extractedText),
      textExtracted: shouldResetText ? false : (req.body.textExtracted !== undefined ? req.body.textExtracted : existingBook.textExtracted)
    };

    const book = await BookModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Book updated:', book?.title);

    res.json({
      success: true,
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update book',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/admin/books/:id
 * Delete book (requires canManageBooks permission)
 */
router.delete('/books/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin!.permissions.canManageBooks) {
      res.status(403).json({
        success: false,
        message: 'No permission to manage books'
      });
      return;
    }

    const book = await BookModel.findByIdAndDelete(req.params.id);

    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Book not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete book',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============ NASHIDS MANAGEMENT ============

/**
 * GET /api/admin/nashids
 * Get all nashids with filters and pagination
 */
router.get('/nashids', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', search, category } = req.query;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;

    const nashids = await NashidModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const count = await NashidModel.countDocuments(filter);

    res.json({
      success: true,
      nashids,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      total: count
    });
  } catch (error) {
    console.error('Get nashids error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nashids',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/nashids/:id
 * Get single nashid by ID
 */
router.get('/nashids/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const nashid = await NashidModel.findById(req.params.id);

    if (!nashid) {
      res.status(404).json({
        success: false,
        message: 'Nashid not found'
      });
      return;
    }

    res.json({ success: true, nashid });
  } catch (error) {
    console.error('Get nashid error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nashid',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/nashids
 * Create new nashid (requires canManageNashids permission)
 */
router.post('/nashids', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin!.permissions.canManageNashids) {
      res.status(403).json({
        success: false,
        message: 'No permission to manage nashids'
      });
      return;
    }

    // Auto-generate nashidId
    const lastNashid = await NashidModel.findOne().sort({ nashidId: -1 }).limit(1);
    const nextNashidId = lastNashid ? lastNashid.nashidId + 1 : 1;

    const nashidData = {
      ...req.body,
      nashidId: nextNashidId,
      // Map coverImage to cover for backward compatibility
      cover: req.body.coverImage || req.body.cover,
      // Set default duration if empty
      duration: req.body.duration || 0
    };

    const nashid = new NashidModel(nashidData);
    await nashid.save();

    console.log(`Created nashid with nashidId: ${nextNashidId}`);

    res.status(201).json({
      success: true,
      message: 'Nashid created successfully',
      nashid
    });
  } catch (error) {
    console.error('Create nashid error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create nashid',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/admin/nashids/:id
 * Update nashid (requires canManageNashids permission)
 */
router.put('/nashids/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin!.permissions.canManageNashids) {
      res.status(403).json({
        success: false,
        message: 'No permission to manage nashids'
      });
      return;
    }

    const updateData = {
      ...req.body,
      // Map coverImage to cover for backward compatibility
      cover: req.body.coverImage || req.body.cover,
      // Set default duration if empty
      duration: req.body.duration || 0
    };

    const nashid = await NashidModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!nashid) {
      res.status(404).json({
        success: false,
        message: 'Nashid not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Nashid updated successfully',
      nashid
    });
  } catch (error) {
    console.error('Update nashid error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update nashid',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/admin/nashids/:id
 * Delete nashid (requires canManageNashids permission)
 */
router.delete('/nashids/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin!.permissions.canManageNashids) {
      res.status(403).json({
        success: false,
        message: 'No permission to manage nashids'
      });
      return;
    }

    const nashid = await NashidModel.findByIdAndDelete(req.params.id);

    if (!nashid) {
      res.status(404).json({
        success: false,
        message: 'Nashid not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Nashid deleted successfully'
    });
  } catch (error) {
    console.error('Delete nashid error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete nashid',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============ ADMINS MANAGEMENT ============

/**
 * GET /api/admin/admins
 * Get all admins (requires canManageAdmins permission)
 */
router.get('/admins', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin!.permissions.canManageAdmins) {
      res.status(403).json({
        success: false,
        message: 'No permission to manage admins'
      });
      return;
    }

    const admins = await AdminModel.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      admins
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/admins
 * Create new admin (requires canManageAdmins permission)
 */
router.post('/admins', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin!.permissions.canManageAdmins) {
      res.status(403).json({
        success: false,
        message: 'No permission to manage admins'
      });
      return;
    }

    const { username, email, password, role, permissions } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Username, email and password are required'
      });
      return;
    }

    // Check if username or email already exists
    const existingAdmin = await AdminModel.findOne({
      $or: [{ username }, { email }]
    });

    if (existingAdmin) {
      res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
      return;
    }

    // Create new admin
    const newAdmin = new AdminModel({
      username,
      email,
      password,
      role: role || 'editor',
      permissions: permissions || {
        canManageBooks: true,
        canManageNashids: true,
        canManageUsers: false,
        canViewAnalytics: true,
        canManageAdmins: false
      },
      isActive: true
    });

    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
        permissions: newAdmin.permissions
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/admin/admins/:id
 * Update admin (requires canManageAdmins permission)
 */
router.put('/admins/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin!.permissions.canManageAdmins) {
      res.status(403).json({
        success: false,
        message: 'No permission to manage admins'
      });
      return;
    }

    const { username, email, role, permissions, isActive } = req.body;

    // Prevent admin from deactivating themselves
    if (req.admin!._id.toString() === req.params.id && isActive === false) {
      res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
      return;
    }

    // Check if username/email already taken by another admin
    const existingAdmin = await AdminModel.findOne({
      $or: [{ username }, { email }],
      _id: { $ne: req.params.id }
    });

    if (existingAdmin) {
      res.status(400).json({
        success: false,
        message: 'Username or email already taken'
      });
      return;
    }

    const updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (permissions) updateData.permissions = permissions;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const admin = await AdminModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Admin updated successfully',
      admin
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/admin/admins/:id
 * Delete admin (requires canManageAdmins permission)
 */
router.delete('/admins/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin!.permissions.canManageAdmins) {
      res.status(403).json({
        success: false,
        message: 'No permission to manage admins'
      });
      return;
    }

    // Prevent admin from deleting themselves
    if (req.admin!._id.toString() === req.params.id) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
      return;
    }

    const admin = await AdminModel.findByIdAndDelete(req.params.id);

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============ USERS MANAGEMENT ============

/**
 * GET /api/admin/users
 * Get all users with filters (requires canManageUsers permission)
 */
router.get('/users', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin!.permissions.canManageUsers) {
      res.status(403).json({
        success: false,
        message: 'No permission to view users'
      });
      return;
    }

    const { page = '1', limit = '50', search, tier } = req.query;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { telegramId: { $regex: search, $options: 'i' } }
      ];
    }
    if (tier) filter['subscription.tier'] = tier;

    const users = await UserModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select('-__v');

    const count = await UserModel.countDocuments(filter);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      total: count
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /api/admin/users/:id/subscription
 * Update user subscription (requires canManageUsers permission)
 */
router.patch('/users/:id/subscription', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin!.permissions.canManageUsers) {
      res.status(403).json({
        success: false,
        message: 'No permission to manage users'
      });
      return;
    }

    const { tier, expiresAt } = req.body;

    // Validate tier
    const validTiers = ['free', 'pro', 'premium'];
    if (!validTiers.includes(tier)) {
      res.status(400).json({
        success: false,
        message: 'Invalid subscription tier'
      });
      return;
    }

    // Build update object
    const updateData: any = {
      'subscription.tier': tier,
      'subscription.isActive': true
    };

    // Set expiration for paid tiers
    if (tier === 'pro' || tier === 'premium') {
      if (expiresAt) {
        updateData['subscription.expiresAt'] = new Date(expiresAt);
      } else {
        // Default: 30 days from now
        const defaultExpiry = new Date();
        defaultExpiry.setDate(defaultExpiry.getDate() + 30);
        updateData['subscription.expiresAt'] = defaultExpiry;
      }
      updateData['subscription.startedAt'] = new Date();
    } else {
      // Free tier - no expiration
      updateData['subscription.expiresAt'] = null;
      updateData['subscription.startedAt'] = null;
    }

    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      user
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============ SUBSCRIPTIONS MANAGEMENT ============

/**
 * GET /api/admin/subscriptions
 * Get all subscription plans
 */
router.get('/subscriptions', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const subscriptions = await SubscriptionPlanModel.find().sort({ tier: 1 });

    res.json({
      success: true,
      subscriptions,
      total: subscriptions.length
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/subscriptions/:tier
 * Get specific subscription plan by tier
 */
router.get('/subscriptions/:tier', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const subscription = await SubscriptionPlanModel.findOne({ tier: req.params.tier });

    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
      return;
    }

    res.json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/subscriptions
 * Create new subscription plan (requires canManageAdmins permission)
 */
router.post('/subscriptions', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin!.permissions.canManageAdmins) {
      res.status(403).json({
        success: false,
        message: 'No permission to manage subscriptions'
      });
      return;
    }

    // Check if tier already exists
    const existingSub = await SubscriptionPlanModel.findOne({ tier: req.body.tier });
    if (existingSub) {
      res.status(400).json({
        success: false,
        message: 'Subscription tier already exists'
      });
      return;
    }

    const subscription = new SubscriptionPlanModel(req.body);
    await subscription.save();

    console.log('New subscription tier created:', subscription.tier);
    console.log('Remember to add tier to User model enum manually');

    res.json({
      success: true,
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/admin/subscriptions/:tier
 * Update subscription plan settings (requires canManageAdmins permission)
 */
router.put('/subscriptions/:tier', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin!.permissions.canManageAdmins) {
      res.status(403).json({
        success: false,
        message: 'No permission to manage subscriptions'
      });
      return;
    }

    const updateData = { ...req.body };
    // Prevent tier change
    delete updateData.tier;

    const subscription = await SubscriptionPlanModel.findOneAndUpdate(
      { tier: req.params.tier },
      updateData,
      { new: true, runValidators: true }
    );

    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/admin/subscriptions/:tier
 * Delete subscription plan (requires canManageAdmins permission)
 */
router.delete('/subscriptions/:tier', authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin!.permissions.canManageAdmins) {
      res.status(403).json({
        success: false,
        message: 'No permission to manage subscriptions'
      });
      return;
    }

    // Check if any users have this subscription
    const usersCount = await UserModel.countDocuments({ 'subscription.tier': req.params.tier });
    if (usersCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete subscription. ${usersCount} users are using this tier.`
      });
      return;
    }

    const subscription = await SubscriptionPlanModel.findOneAndDelete({ tier: req.params.tier });

    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Subscription deleted successfully'
    });
  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subscription',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
