import mongoose, { Schema } from 'mongoose';

export type SearchType = 'quran' | 'library' | 'prayer' | 'general';
export type SearchSource = 'quran_reader' | 'surah_list' | 'library_page' | 'ai_chat' | 'global_search';

export interface SearchHistory {
  _id: string;
  userId: string;
  query: string;
  type: SearchType;
  source?: SearchSource;

  // Search context
  context?: {
    surahNumber?: number;
    pageNumber?: number;
    category?: string;
    language?: string;
  };

  // Results metadata
  resultsCount?: number;
  clicked?: boolean;
  clickedResultId?: string;

  // Organization
  favorite: boolean;
  tags?: string[];

  // Timestamps
  timestamp: Date;
  lastAccessed?: Date;
  accessCount: number;

  createdAt: Date;
  updatedAt: Date;
}

const searchHistorySchema = new Schema<SearchHistory>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    query: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['quran', 'library', 'prayer', 'general'],
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ['quran_reader', 'surah_list', 'library_page', 'ai_chat', 'global_search'],
    },
    context: {
      surahNumber: Number,
      pageNumber: Number,
      category: String,
      language: String,
    },
    resultsCount: Number,
    clicked: {
      type: Boolean,
      default: false,
    },
    clickedResultId: String,
    favorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: [String],
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastAccessed: Date,
    accessCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
searchHistorySchema.index({ userId: 1, timestamp: -1 });
searchHistorySchema.index({ userId: 1, type: 1, timestamp: -1 });
searchHistorySchema.index({ userId: 1, favorite: 1 });
searchHistorySchema.index({ userId: 1, query: 1 });

// Text search index
searchHistorySchema.index({ query: 'text', tags: 'text' });

// TTL index - auto-delete non-favorite searches after 90 days
searchHistorySchema.index(
  { timestamp: 1 },
  {
    expireAfterSeconds: 90 * 24 * 60 * 60, // 90 days
    partialFilterExpression: { favorite: false },
  }
);

const SearchHistoryModel = mongoose.model<SearchHistory>('SearchHistory', searchHistorySchema);

export default SearchHistoryModel;
