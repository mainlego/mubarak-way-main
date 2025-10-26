import mongoose, { Schema } from 'mongoose';
import type { Book } from '@mubarak-way/shared';

const bookSchema = new Schema<Book>(
  {
    bookId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    titleArabic: String,
    author: {
      type: String,
      required: true,
    },
    authorArabic: String,
    description: {
      type: String,
      required: true,
    },
    cover: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    extractedText: String,
    textExtracted: {
      type: Boolean,
      default: false,
    },

    isPro: {
      type: Boolean,
      default: false,
    },
    isExclusive: {
      type: Boolean,
      default: false,
    },
    accessLevel: {
      type: String,
      enum: ['free', 'pro', 'premium'],
      default: 'free',
    },

    category: {
      type: String,
      enum: ['religious', 'education', 'spiritual', 'history', 'biography'],
      required: true,
      index: true,
    },
    genre: {
      type: String,
      enum: ['quran', 'hadith', 'prophets', 'aqidah', 'tafsir', 'fiqh', 'seerah', 'dua', 'islamic-history', 'general'],
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      index: true,
    },

    pageCount: Number,
    publishedDate: Date,
    isNew: {
      type: Boolean,
      default: false,
    },

    rating: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },

    reactions: {
      likes: {
        type: Number,
        default: 0,
      },
      views: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookSchema.index({ bookId: 1 });
bookSchema.index({ category: 1 });
bookSchema.index({ genre: 1 });
bookSchema.index({ language: 1 });
bookSchema.index({ accessLevel: 1 });
bookSchema.index({ isNew: -1 });

// Text search index
bookSchema.index({
  title: 'text',
  titleArabic: 'text',
  author: 'text',
  description: 'text',
  extractedText: 'text',
});

const BookModel = mongoose.model<Book>('Book', bookSchema);

export default BookModel;
