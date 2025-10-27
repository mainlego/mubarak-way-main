import mongoose, { Schema, type Model } from 'mongoose';
import type { Bookmark, BookmarkType, BookmarkCollection } from '@mubarak-way/shared';

const bookmarkSchema = new Schema<Bookmark>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    // Type of bookmark
    type: {
      type: String,
      enum: ['ayah', 'surah', 'book', 'nashid', 'lesson', 'note'],
      required: true,
    },

    // Reference to the bookmarked item
    referenceId: {
      type: String,
      required: true,
    },

    // Collection organization (3-tier system)
    collection: {
      type: String,
      enum: ['quran', 'hadith', 'fiqh', 'personal', 'favorites'],
      default: 'personal',
    },

    // Hierarchical folder structure
    folder: {
      type: String,
      default: '',
    },

    // Tags for flexible categorization
    tags: {
      type: [String],
      default: [],
      index: true,
    },

    // Display information
    title: {
      type: String,
      required: true,
    },

    subtitle: String,

    // Additional context
    note: String,

    // For ayah bookmarks - store verse context
    context: {
      surahNumber: Number,
      surahName: String,
      ayahNumber: Number,
      ayahText: String,
      translation: String,
    },

    // For range bookmarks
    range: {
      startId: String,
      endId: String,
    },

    // Highlighting and annotations
    highlightColor: {
      type: String,
      enum: ['yellow', 'green', 'blue', 'red', 'purple', 'none'],
      default: 'none',
    },

    annotations: {
      type: [String],
      default: [],
    },

    // Sharing options
    isPublic: {
      type: Boolean,
      default: false,
    },

    shareCode: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Priority/importance
    priority: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // Stats
    viewCount: {
      type: Number,
      default: 0,
    },

    lastViewed: Date,

    // Metadata
    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookmarkSchema.index({ userId: 1, collection: 1 });
bookmarkSchema.index({ userId: 1, type: 1 });
bookmarkSchema.index({ userId: 1, tags: 1 });
bookmarkSchema.index({ userId: 1, folder: 1 });
bookmarkSchema.index({ shareCode: 1 }, { unique: true, sparse: true });

// Text search index
bookmarkSchema.index({
  title: 'text',
  subtitle: 'text',
  note: 'text',
  tags: 'text',
});

const BookmarkModel: Model<Bookmark> = mongoose.model<Bookmark>('Bookmark', bookmarkSchema);

export default BookmarkModel;
