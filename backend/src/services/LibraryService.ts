import Book from '../models/Book.js';
import Nashid from '../models/Nashid.js';
import type {
  Book as BookType,
  Nashid as NashidType,
  LibrarySearchQuery,
  LibrarySearchResult,
} from '@mubarak-way/shared';

// Helper functions to add backwards compatibility fields
function addBookAliases(book: any): BookType {
  return {
    ...book,
    id: book.bookId,
    coverUrl: book.cover,
    pages: book.pageCount,
    isPremium: book.isPro || book.accessLevel === 'premium',
    pdfUrl: book.content,
  };
}

function addNashidAliases(nashid: any): NashidType {
  return {
    ...nashid,
    id: nashid.nashidId,
    coverUrl: nashid.cover || nashid.coverImage,
  };
}

export class LibraryService {
  /**
   * Get all books with filters
   */
  static async getBooks(query: LibrarySearchQuery): Promise<LibrarySearchResult<BookType>> {
    const {
      query: searchQuery,
      category,
      genre,
      language,
      accessLevel,
      sortBy = 'title',
      sortOrder = 'asc',
      page = 1,
      limit = 20,
    } = query;

    const filter: any = {};

    // Text search
    if (searchQuery) {
      filter.$text = { $search: searchQuery };
    }

    // Filters
    if (category) filter.category = category;
    if (genre) filter.genre = genre;
    if (language) filter.language = language;
    if (accessLevel) filter.accessLevel = accessLevel;

    // Count total
    const total = await Book.countDocuments(filter);

    // Sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (page - 1) * limit;

    // Query
    const books = await Book.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      items: books.map(addBookAliases),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get book by ID
   */
  static async getBookById(bookId: number): Promise<BookType | null> {
    const book = await Book.findOne({ bookId }).lean();
    return book ? addBookAliases(book) : null;
  }

  /**
   * Get featured books
   */
  static async getFeaturedBooks(limit = 10): Promise<BookType[]> {
    const books = await Book.find({ isNew: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return books.map(addBookAliases);
  }

  /**
   * Get all nashids with filters
   */
  static async getNashids(query: LibrarySearchQuery): Promise<LibrarySearchResult<NashidType>> {
    const {
      query: searchQuery,
      category,
      language,
      accessLevel,
      sortBy = 'title',
      sortOrder = 'asc',
      page = 1,
      limit = 20,
    } = query;

    const filter: any = {};

    // Text search
    if (searchQuery) {
      filter.$text = { $search: searchQuery };
    }

    // Filters
    if (category) filter.category = category;
    if (language) filter.language = language;
    if (accessLevel) filter.accessLevel = accessLevel;

    // Count total
    const total = await Nashid.countDocuments(filter);

    // Sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (page - 1) * limit;

    // Query
    const nashids = await Nashid.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      items: nashids.map(addNashidAliases),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get nashid by ID
   */
  static async getNashidById(nashidId: number): Promise<NashidType | null> {
    const nashid = await Nashid.findOne({ nashidId }).lean();
    return nashid ? addNashidAliases(nashid) : null;
  }

  /**
   * Get library statistics
   */
  static async getStats() {
    const totalBooks = await Book.countDocuments();
    const totalNashids = await Nashid.countDocuments();
    const freeBooks = await Book.countDocuments({ accessLevel: 'free' });
    const proBooks = await Book.countDocuments({ accessLevel: 'pro' });
    const premiumBooks = await Book.countDocuments({ accessLevel: 'premium' });

    return {
      books: {
        total: totalBooks,
        free: freeBooks,
        pro: proBooks,
        premium: premiumBooks,
      },
      nashids: {
        total: totalNashids,
      },
    };
  }
}
