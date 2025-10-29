import mongoose, { Schema, Document } from 'mongoose';

export interface IPlaylist extends Document {
  userId: string; // Telegram ID
  name: string;
  nashids: Array<{
    nashidId: string;
    title: string;
    artist: string;
    duration?: number;
    cover?: string;
    audioUrl?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const PlaylistSchema = new Schema<IPlaylist>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    nashids: [
      {
        nashidId: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        artist: {
          type: String,
          default: 'Unknown Artist',
        },
        duration: Number,
        cover: String,
        audioUrl: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
PlaylistSchema.index({ userId: 1, createdAt: -1 });
PlaylistSchema.index({ userId: 1, name: 1 });

// Virtual for nashid count
PlaylistSchema.virtual('nashidCount').get(function () {
  return this.nashids.length;
});

// Instance methods
PlaylistSchema.methods.addNashid = function (nashid: any) {
  // Check if nashid already exists in playlist
  const exists = this.nashids.some((n: any) => n.nashidId === nashid.nashidId);
  if (!exists) {
    this.nashids.push(nashid);
  }
  return this;
};

PlaylistSchema.methods.removeNashid = function (nashidId: string) {
  this.nashids = this.nashids.filter((n: any) => n.nashidId !== nashidId);
  return this;
};

// Static methods
PlaylistSchema.statics.findByUserId = function (userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

PlaylistSchema.statics.findByUserIdAndName = function (userId: string, name: string) {
  return this.findOne({ userId, name });
};

export const Playlist = mongoose.model<IPlaylist>('Playlist', PlaylistSchema);
