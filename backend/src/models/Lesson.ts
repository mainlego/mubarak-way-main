import mongoose, { Schema } from 'mongoose';
import type { Lesson } from '@mubarak-way/shared';

const lessonSchema = new Schema<Lesson>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    titleArabic: String,
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['obligatory-prayers', 'optional-prayers', 'special-prayers', 'ablution'],
      required: true,
      index: true,
    },
    prayerType: {
      type: String,
      enum: ['obligatory', 'optional', 'special'],
    },
    prayerName: {
      type: String,
      enum: ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'witr'],
    },

    cover: String,
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    estimatedMinutes: {
      type: Number,
      required: true,
    },

    sections: [{
      id: String,
      title: String,
      content: String,
      order: Number,
    }],

    steps: [{
      id: String,
      title: String,
      titleArabic: String,
      description: String,
      arabic: String,
      transliteration: String,
      translation: String,
      audioUrl: String,
      imageUrl: String,
      madhab: {
        hanafi: String,
        shafi: String,
        maliki: String,
        hanbali: String,
      },
      order: Number,
    }],

    accessLevel: {
      type: String,
      enum: ['free', 'pro', 'premium'],
      default: 'free',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
lessonSchema.index({ slug: 1 });
lessonSchema.index({ category: 1 });
lessonSchema.index({ difficulty: 1 });
lessonSchema.index({ accessLevel: 1 });
lessonSchema.index({ isFeatured: -1 });

// Text search index
lessonSchema.index({
  title: 'text',
  titleArabic: 'text',
  description: 'text',
});

const LessonModel = mongoose.model<Lesson>('Lesson', lessonSchema);

export default LessonModel;
