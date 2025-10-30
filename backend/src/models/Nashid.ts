import mongoose, { Schema } from 'mongoose';
import type { Nashid } from '@mubarak-way/shared';

const nashidSchema = new Schema<Nashid>(
  {
    nashidId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    titleTransliteration: String,
    titleArabic: String,

    artist: {
      type: String,
      required: true,
    },
    artistArabic: String,

    duration: {
      type: Number,
      required: true,
    },
    cover: String,
    coverImage: String,
    audioUrl: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        'nasheed',
        'anasheed',
        'religious',
        'quran-recitation',
        'dua',
        'general',
        'spiritual',
        'family',
        'gratitude',
        'prophetic',
        'tawhid',
      ],
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      index: true,
    },
    releaseYear: Number,

    accessLevel: {
      type: String,
      enum: ['free', 'pro', 'premium'],
      default: 'free',
      index: true,
    },
    isExclusive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
nashidSchema.index({ nashidId: 1 });
nashidSchema.index({ category: 1 });
nashidSchema.index({ language: 1 });
nashidSchema.index({ accessLevel: 1 });

// Text search index
nashidSchema.index(
  {
    title: 'text',
    titleArabic: 'text',
    titleTransliteration: 'text',
    artist: 'text',
  },
  {
    default_language: 'none', // Disable language-specific features
    language_override: 'search_language', // Use a different field for language
  }
);

const NashidModel = mongoose.model<Nashid>('Nashid', nashidSchema);

export default NashidModel;
