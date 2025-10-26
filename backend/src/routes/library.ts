import { Router, Request, Response } from 'express';
import { LibraryService } from '../services/LibraryService.js';
import type { ApiResponse, LibrarySearchQuery } from '@mubarak-way/shared';
import { mockBooks, mockNashids } from '../data/mockLibrary.js';

const router = Router();
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

/**
 * GET /api/v1/library/books
 * Get all books with filters
 */
router.get('/books', async (req: Request, res: Response) => {
  try {
    const query: LibrarySearchQuery = {
      query: req.query.q as string,
      category: req.query.category as any,
      genre: req.query.genre as any,
      language: req.query.language as string,
      accessLevel: req.query.accessLevel as any,
      sortBy: (req.query.sortBy as any) || 'title',
      sortOrder: (req.query.sortOrder as any) || 'asc',
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const result = USE_MOCK_DATA
      ? {
          items: mockBooks,
          page: 1,
          total: mockBooks.length,
          totalPages: 1,
        }
      : await LibraryService.getBooks(query);

    res.json({
      success: true,
      data: result.items,
      meta: {
        page: result.page,
        limit: query.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_BOOKS_ERROR',
        message: error.message || 'Failed to get books',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/library/books/:id
 * Get book by ID
 */
router.get('/books/:id', async (req: Request, res: Response) => {
  try {
    const bookId = parseInt(req.params.id);
    const book = await LibraryService.getBookById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOK_NOT_FOUND',
          message: 'Book not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: book,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get book error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_BOOK_ERROR',
        message: error.message || 'Failed to get book',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/library/books/featured
 * Get featured books
 */
router.get('/books/featured', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const books = await LibraryService.getFeaturedBooks(limit);

    res.json({
      success: true,
      data: books,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get featured books error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_FEATURED_BOOKS_ERROR',
        message: error.message || 'Failed to get featured books',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/library/nashids
 * Get all nashids with filters
 */
router.get('/nashids', async (req: Request, res: Response) => {
  try {
    const query: LibrarySearchQuery = {
      query: req.query.q as string,
      category: req.query.category as any,
      language: req.query.language as string,
      accessLevel: req.query.accessLevel as any,
      sortBy: (req.query.sortBy as any) || 'title',
      sortOrder: (req.query.sortOrder as any) || 'asc',
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const result = USE_MOCK_DATA
      ? {
          items: mockNashids,
          page: 1,
          total: mockNashids.length,
          totalPages: 1,
        }
      : await LibraryService.getNashids(query);

    res.json({
      success: true,
      data: result.items,
      meta: {
        page: result.page,
        limit: query.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get nashids error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_NASHIDS_ERROR',
        message: error.message || 'Failed to get nashids',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/library/nashids/:id
 * Get nashid by ID
 */
router.get('/nashids/:id', async (req: Request, res: Response) => {
  try {
    const nashidId = parseInt(req.params.id);
    const nashid = await LibraryService.getNashidById(nashidId);

    if (!nashid) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NASHID_NOT_FOUND',
          message: 'Nashid not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: nashid,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get nashid error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_NASHID_ERROR',
        message: error.message || 'Failed to get nashid',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/library/stats
 * Get library statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await LibraryService.getStats();

    res.json({
      success: true,
      data: stats,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Library stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LIBRARY_STATS_ERROR',
        message: error.message || 'Failed to get library stats',
      },
    } as ApiResponse);
  }
});

export default router;
