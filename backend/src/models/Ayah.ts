import mongoose, { Schema } from 'mongoose';
import type { Ayah } from '@mubarak-way/shared';

const ayahSchema = new Schema<Ayah>(
  {
    surahNumber: {
      type: Number,
      required: true,
      index: true,
    },
    ayahNumber: {
      type: Number,
      required: true,
    },
    globalNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    textArabic: {
      type: String,
      required: true,
    },
    textSimple: {
      type: String,
      required: true,
    },
    translations: [{
      language: String,
      text: String,
      translator: String,
      translatorId: Number,
    }],
    tafsirs: [{
      language: String,
      text: String,
      author: String,
      authorId: Number,
    }],
    juzNumber: {
      type: Number,
      required: true,
      index: true,
    },
    hizbNumber: {
      type: Number,
      required: true,
    },
    pageNumber: {
      type: Number,
      required: true,
      index: true,
    },
    sajdah: {
      required: Boolean,
      type: {
        type: String,
        enum: ['recommended', 'obligatory'],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
ayahSchema.index({ surahNumber: 1, ayahNumber: 1 });
ayahSchema.index({ juzNumber: 1 });
ayahSchema.index({ pageNumber: 1 });

// Text search index
ayahSchema.index({
  textSimple: 'text',
  'translations.text': 'text',
});

const AyahModel = mongoose.model<Ayah>('Ayah', ayahSchema);

export default AyahModel;
