import BookmarkModel from '../models/Bookmark.js';
import type {
  Bookmark,
  CreateBookmarkInput,
  UpdateBookmarkInput,
  BookmarkStats,
  BookmarkFolder,
  BookmarkCollection,
  BookmarkType,
} from '@mubarak-way/shared';
import crypto from 'crypto';

export class BookmarkService {
  /**
   * Create a new bookmark
   */
  static async createBookmark(userId: string, input: CreateBookmarkInput): Promise<Bookmark> {
    const bookmark = await BookmarkModel.create({
      userId,
      ...input,
      collection: input.collection || 'personal',
      folder: input.folder || '',
      tags: input.tags || [],
      highlightColor: input.highlightColor || 'none',
      priority: input.priority || 0,
      annotations: [],
      isPublic: false,
      viewCount: 0,
    });

    return bookmark.toObject();
  }

  /**
   * Get all bookmarks for a user
   */
  static async getUserBookmarks(
    userId: string,
    filters?: {
      collection?: BookmarkCollection;
      type?: BookmarkType;
      folder?: string;
      tags?: string[];
      search?: string;
    }
  ): Promise<Bookmark[]> {
    const query: any = { userId };

    if (filters?.collection) {
      query.collection = filters.collection;
    }

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.folder !== undefined) {
      query.folder = filters.folder;
    }

    if (filters?.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters?.search) {
      query.$text = { $search: filters.search };
    }

    const bookmarks = await BookmarkModel.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    return bookmarks;
  }

  /**
   * Get a single bookmark by ID
   */
  static async getBookmarkById(bookmarkId: string, userId: string): Promise<Bookmark | null> {
    const bookmark = await BookmarkModel.findOne({ _id: bookmarkId, userId }).lean();

    if (bookmark) {
      // Increment view count
      await BookmarkModel.updateOne(
        { _id: bookmarkId },
        { $inc: { viewCount: 1 }, lastViewed: new Date() }
      );
    }

    return bookmark;
  }

  /**
   * Update a bookmark
   */
  static async updateBookmark(
    bookmarkId: string,
    userId: string,
    update: UpdateBookmarkInput
  ): Promise<Bookmark | null> {
    const bookmark = await BookmarkModel.findOneAndUpdate(
      { _id: bookmarkId, userId },
      { $set: { ...update, updatedAt: new Date() } },
      { new: true }
    ).lean();

    return bookmark;
  }

  /**
   * Delete a bookmark
   */
  static async deleteBookmark(bookmarkId: string, userId: string): Promise<boolean> {
    const result = await BookmarkModel.deleteOne({ _id: bookmarkId, userId });
    return result.deletedCount > 0;
  }

  /**
   * Add a tag to a bookmark
   */
  static async addTag(bookmarkId: string, userId: string, tag: string): Promise<Bookmark | null> {
    const bookmark = await BookmarkModel.findOneAndUpdate(
      { _id: bookmarkId, userId },
      { $addToSet: { tags: tag }, updatedAt: new Date() },
      { new: true }
    ).lean();

    return bookmark;
  }

  /**
   * Remove a tag from a bookmark
   */
  static async removeTag(bookmarkId: string, userId: string, tag: string): Promise<Bookmark | null> {
    const bookmark = await BookmarkModel.findOneAndUpdate(
      { _id: bookmarkId, userId },
      { $pull: { tags: tag }, updatedAt: new Date() },
      { new: true }
    ).lean();

    return bookmark;
  }

  /**
   * Add an annotation to a bookmark
   */
  static async addAnnotation(
    bookmarkId: string,
    userId: string,
    annotation: string
  ): Promise<Bookmark | null> {
    const bookmark = await BookmarkModel.findOneAndUpdate(
      { _id: bookmarkId, userId },
      { $push: { annotations: annotation }, updatedAt: new Date() },
      { new: true }
    ).lean();

    return bookmark;
  }

  /**
   * Generate a share code for a bookmark
   */
  static async generateShareCode(bookmarkId: string, userId: string): Promise<string | null> {
    // Generate a unique 8-character code
    const shareCode = crypto.randomBytes(4).toString('hex');

    const bookmark = await BookmarkModel.findOneAndUpdate(
      { _id: bookmarkId, userId },
      { isPublic: true, shareCode, updatedAt: new Date() },
      { new: true }
    );

    return bookmark ? shareCode : null;
  }

  /**
   * Get a bookmark by share code
   */
  static async getBookmarkByShareCode(shareCode: string): Promise<Bookmark | null> {
    const bookmark = await BookmarkModel.findOne({ shareCode, isPublic: true }).lean();

    if (bookmark) {
      // Increment view count
      await BookmarkModel.updateOne(
        { _id: bookmark._id },
        { $inc: { viewCount: 1 }, lastViewed: new Date() }
      );
    }

    return bookmark;
  }

  /**
   * Get bookmark statistics for a user
   */
  static async getBookmarkStats(userId: string): Promise<BookmarkStats> {
    const bookmarks = await BookmarkModel.find({ userId }).lean();

    // Count by collection
    const byCollection: Record<BookmarkCollection, number> = {
      quran: 0,
      hadith: 0,
      fiqh: 0,
      personal: 0,
      favorites: 0,
    };

    bookmarks.forEach(b => {
      byCollection[b.collection]++;
    });

    // Count by type
    const byType: Record<BookmarkType, number> = {
      ayah: 0,
      surah: 0,
      book: 0,
      nashid: 0,
      lesson: 0,
      note: 0,
    };

    bookmarks.forEach(b => {
      byType[b.type]++;
    });

    // Recently added (last 10)
    const recentlyAdded = bookmarks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    // Most viewed (top 10)
    const mostViewed = bookmarks
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10);

    // Get folder structure
    const folders = await this.getFolderStructure(userId);

    // Popular tags
    const tagCounts: Record<string, number> = {};
    bookmarks.forEach(b => {
      b.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const popularTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return {
      total: bookmarks.length,
      byCollection,
      byType,
      recentlyAdded,
      mostViewed,
      folders,
      popularTags,
    };
  }

  /**
   * Get folder structure for a user
   */
  static async getFolderStructure(userId: string): Promise<BookmarkFolder[]> {
    const bookmarks = await BookmarkModel.find({ userId }).lean();

    const folderMap: Record<string, BookmarkFolder> = {};

    bookmarks.forEach(b => {
      if (b.folder) {
        const parts = b.folder.split('/').filter(Boolean);
        let currentPath = '';

        parts.forEach((part, index) => {
          const parentPath = currentPath;
          currentPath = currentPath ? `${currentPath}/${part}` : part;

          if (!folderMap[currentPath]) {
            folderMap[currentPath] = {
              name: part,
              path: currentPath,
              bookmarkCount: 0,
              subfolders: [],
            };

            // Link to parent
            if (parentPath && folderMap[parentPath]) {
              folderMap[parentPath].subfolders.push(folderMap[currentPath]);
            }
          }

          // Increment count for leaf folder
          if (index === parts.length - 1) {
            folderMap[currentPath].bookmarkCount++;
          }
        });
      }
    });

    // Return root folders only
    return Object.values(folderMap).filter(f => !f.path.includes('/'));
  }

  /**
   * Move bookmark to a different folder
   */
  static async moveToFolder(
    bookmarkId: string,
    userId: string,
    newFolder: string
  ): Promise<Bookmark | null> {
    const bookmark = await BookmarkModel.findOneAndUpdate(
      { _id: bookmarkId, userId },
      { folder: newFolder, updatedAt: new Date() },
      { new: true }
    ).lean();

    return bookmark;
  }

  /**
   * Change bookmark collection
   */
  static async changeCollection(
    bookmarkId: string,
    userId: string,
    newCollection: BookmarkCollection
  ): Promise<Bookmark | null> {
    const bookmark = await BookmarkModel.findOneAndUpdate(
      { _id: bookmarkId, userId },
      { collection: newCollection, updatedAt: new Date() },
      { new: true }
    ).lean();

    return bookmark;
  }
}
