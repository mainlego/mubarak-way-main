/**
 * Bookmark System Types - 3-Tier Organization
 */

export type BookmarkType = 'ayah' | 'surah' | 'book' | 'nashid' | 'lesson' | 'note';

export type BookmarkCollection = 'quran' | 'hadith' | 'fiqh' | 'personal' | 'favorites';

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'red' | 'purple' | 'none';

export interface BookmarkContext {
  surahNumber?: number;
  surahName?: string;
  ayahNumber?: number;
  ayahText?: string;
  translation?: string;
}

export interface BookmarkRange {
  startId: string;
  endId: string;
}

export interface Bookmark {
  _id: string;
  userId: string;

  // Type and reference
  type: BookmarkType;
  referenceId: string;

  // 3-Tier organization
  collection: BookmarkCollection;
  folder: string;
  tags: string[];

  // Display info
  title: string;
  subtitle?: string;
  note?: string;

  // Context (for ayahs)
  context?: BookmarkContext;

  // Range (for multi-ayah bookmarks)
  range?: BookmarkRange;

  // Highlighting and annotations
  highlightColor: HighlightColor;
  annotations: string[];

  // Sharing
  isPublic: boolean;
  shareCode?: string;

  // Priority
  priority: number;

  // Stats
  viewCount: number;
  lastViewed?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookmarkInput {
  type: BookmarkType;
  referenceId: string;
  collection?: BookmarkCollection;
  folder?: string;
  tags?: string[];
  title: string;
  subtitle?: string;
  note?: string;
  context?: BookmarkContext;
  range?: BookmarkRange;
  highlightColor?: HighlightColor;
  priority?: number;
}

export interface UpdateBookmarkInput {
  collection?: BookmarkCollection;
  folder?: string;
  tags?: string[];
  title?: string;
  subtitle?: string;
  note?: string;
  highlightColor?: HighlightColor;
  annotations?: string[];
  priority?: number;
  isPublic?: boolean;
}

export interface BookmarkFolder {
  name: string;
  path: string;
  bookmarkCount: number;
  subfolders: BookmarkFolder[];
}

export interface BookmarkStats {
  total: number;
  byCollection: Record<BookmarkCollection, number>;
  byType: Record<BookmarkType, number>;
  recentlyAdded: Bookmark[];
  mostViewed: Bookmark[];
  folders: BookmarkFolder[];
  popularTags: Array<{ tag: string; count: number }>;
}
