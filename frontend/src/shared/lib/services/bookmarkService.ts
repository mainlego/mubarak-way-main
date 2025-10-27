import { apiGet, apiPost, apiPut, apiDelete } from '../api';
import type {
  Bookmark,
  CreateBookmarkInput,
  UpdateBookmarkInput,
  BookmarkStats,
  BookmarkFolder,
  BookmarkCollection,
  BookmarkType,
} from '@mubarak-way/shared';

export const bookmarkService = {
  /**
   * Create a new bookmark
   */
  createBookmark: async (input: CreateBookmarkInput): Promise<Bookmark> => {
    return await apiPost<Bookmark>('/bookmarks', input);
  },

  /**
   * Get all bookmarks with optional filters
   */
  getBookmarks: async (filters?: {
    collection?: BookmarkCollection;
    type?: BookmarkType;
    folder?: string;
    tags?: string[];
    search?: string;
  }): Promise<Bookmark[]> => {
    const params: Record<string, string> = {};

    if (filters?.collection) params.collection = filters.collection;
    if (filters?.type) params.type = filters.type;
    if (filters?.folder) params.folder = filters.folder;
    if (filters?.tags && filters.tags.length > 0) params.tags = filters.tags.join(',');
    if (filters?.search) params.search = filters.search;

    return await apiGet<Bookmark[]>('/bookmarks', params);
  },

  /**
   * Get bookmark statistics
   */
  getStats: async (): Promise<BookmarkStats> => {
    return await apiGet<BookmarkStats>('/bookmarks/stats');
  },

  /**
   * Get bookmark by share code (no auth required)
   */
  getByShareCode: async (shareCode: string): Promise<Bookmark> => {
    return await apiGet<Bookmark>(`/bookmarks/share/${shareCode}`);
  },

  /**
   * Get single bookmark by ID
   */
  getBookmark: async (id: string): Promise<Bookmark> => {
    return await apiGet<Bookmark>(`/bookmarks/${id}`);
  },

  /**
   * Update bookmark
   */
  updateBookmark: async (
    id: string,
    update: UpdateBookmarkInput
  ): Promise<Bookmark> => {
    return await apiPut<Bookmark>(`/bookmarks/${id}`, update);
  },

  /**
   * Delete bookmark
   */
  deleteBookmark: async (id: string): Promise<{ deleted: boolean }> => {
    return await apiDelete<{ deleted: boolean }>(`/bookmarks/${id}`);
  },

  /**
   * Add tag to bookmark
   */
  addTag: async (id: string, tag: string): Promise<Bookmark> => {
    return await apiPost<Bookmark>(`/bookmarks/${id}/tags`, { tag });
  },

  /**
   * Remove tag from bookmark
   */
  removeTag: async (id: string, tag: string): Promise<Bookmark> => {
    return await apiDelete<Bookmark>(`/bookmarks/${id}/tags/${encodeURIComponent(tag)}`);
  },

  /**
   * Add annotation to bookmark
   */
  addAnnotation: async (id: string, annotation: string): Promise<Bookmark> => {
    return await apiPost<Bookmark>(`/bookmarks/${id}/annotations`, { annotation });
  },

  /**
   * Generate share code for bookmark
   */
  generateShareCode: async (id: string): Promise<{ shareCode: string }> => {
    return await apiPost<{ shareCode: string }>(`/bookmarks/${id}/share`);
  },

  /**
   * Move bookmark to different folder
   */
  moveToFolder: async (id: string, folder: string): Promise<Bookmark> => {
    return await apiPut<Bookmark>(`/bookmarks/${id}/folder`, { folder });
  },

  /**
   * Change bookmark collection
   */
  changeCollection: async (
    id: string,
    collection: BookmarkCollection
  ): Promise<Bookmark> => {
    return await apiPut<Bookmark>(`/bookmarks/${id}/collection`, { collection });
  },

  /**
   * Quick bookmark an ayah (simplified for common use case)
   */
  bookmarkAyah: async (
    surahNumber: number,
    ayahNumber: number,
    ayahText: string,
    translation?: string,
    collection: BookmarkCollection = 'quran'
  ): Promise<Bookmark> => {
    const input: CreateBookmarkInput = {
      type: 'ayah',
      referenceId: `${surahNumber}:${ayahNumber}`,
      collection,
      title: `Surah ${surahNumber}, Ayah ${ayahNumber}`,
      context: {
        surahNumber,
        ayahNumber,
        ayahText,
        translation,
      },
    };
    return await apiPost<Bookmark>('/bookmarks', input);
  },

  /**
   * Quick bookmark a surah
   */
  bookmarkSurah: async (
    surahNumber: number,
    surahName: string,
    collection: BookmarkCollection = 'quran'
  ): Promise<Bookmark> => {
    const input: CreateBookmarkInput = {
      type: 'surah',
      referenceId: `surah:${surahNumber}`,
      collection,
      title: surahName,
      context: {
        surahNumber,
        surahName,
      },
    };
    return await apiPost<Bookmark>('/bookmarks', input);
  },

  /**
   * Quick bookmark a book
   */
  bookmarkBook: async (
    bookId: string,
    bookTitle: string,
    author?: string,
    collection: BookmarkCollection = 'personal'
  ): Promise<Bookmark> => {
    const input: CreateBookmarkInput = {
      type: 'book',
      referenceId: bookId,
      collection,
      title: bookTitle,
      subtitle: author,
    };
    return await apiPost<Bookmark>('/bookmarks', input);
  },

  /**
   * Quick bookmark a nashid
   */
  bookmarkNashid: async (
    nashidId: string,
    nashidTitle: string,
    artist?: string,
    collection: BookmarkCollection = 'favorites'
  ): Promise<Bookmark> => {
    const input: CreateBookmarkInput = {
      type: 'nashid',
      referenceId: nashidId,
      collection,
      title: nashidTitle,
      subtitle: artist,
    };
    return await apiPost<Bookmark>('/bookmarks', input);
  },

  /**
   * Quick bookmark a lesson
   */
  bookmarkLesson: async (
    lessonId: string,
    lessonTitle: string,
    category?: string,
    collection: BookmarkCollection = 'personal'
  ): Promise<Bookmark> => {
    const input: CreateBookmarkInput = {
      type: 'lesson',
      referenceId: lessonId,
      collection,
      title: lessonTitle,
      subtitle: category,
    };
    return await apiPost<Bookmark>('/bookmarks', input);
  },

  /**
   * Create a personal note bookmark
   */
  createNote: async (
    title: string,
    note: string,
    tags?: string[],
    collection: BookmarkCollection = 'personal'
  ): Promise<Bookmark> => {
    const input: CreateBookmarkInput = {
      type: 'note',
      referenceId: `note:${Date.now()}`,
      collection,
      title,
      note,
      tags,
    };
    return await apiPost<Bookmark>('/bookmarks', input);
  },
};
