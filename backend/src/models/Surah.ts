import mongoose, { Schema } from 'mongoose';
import type { Surah } from '@mubarak-way/shared';

const surahSchema = new Schema<Surah>(
  {
    number: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    nameArabic: {
      type: String,
      required: true,
    },
    nameTransliteration: {
      type: String,
      required: true,
    },
    ayahCount: {
      type: Number,
      required: true,
    },
    revelation: {
      type: String,
      enum: ['meccan', 'medinan'],
      required: true,
    },
    revelationOrder: {
      type: Number,
      required: true,
    },
    bismillahPre: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
surahSchema.index({ number: 1 });
surahSchema.index({ name: 'text', nameTransliteration: 'text' });

const SurahModel = mongoose.model<Surah>('Surah', surahSchema);

export default SurahModel;
