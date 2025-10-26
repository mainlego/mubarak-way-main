import mongoose, { Schema } from 'mongoose';
import type { SubscriptionPlan } from '@mubarak-way/shared';

const subscriptionPlanSchema = new Schema<SubscriptionPlan>(
  {
    tier: {
      type: String,
      enum: ['free', 'pro', 'premium'],
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },

    price: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        required: true,
        default: 'RUB',
      },
      period: {
        type: String,
        enum: ['monthly', 'yearly'],
        required: true,
      },
    },

    limits: {
      booksOffline: {
        type: Number,
        required: true,
      },
      booksFavorites: {
        type: Number,
        required: true,
      },
      nashidsOffline: {
        type: Number,
        required: true,
      },
      nashidsFavorites: {
        type: Number,
        required: true,
      },
      aiRequestsPerDay: {
        type: Number,
        required: true,
      },
    },

    access: {
      freeContent: {
        type: Boolean,
        default: true,
      },
      proContent: {
        type: Boolean,
        default: false,
      },
      premiumContent: {
        type: Boolean,
        default: false,
      },
      exclusiveContent: {
        type: Boolean,
        default: false,
      },
    },

    features: {
      notes: {
        type: Boolean,
        default: false,
      },
      sync: {
        type: Boolean,
        default: false,
      },
      backgroundAudio: {
        type: Boolean,
        default: false,
      },
      advancedSearch: {
        type: Boolean,
        default: false,
      },
      offlineMode: {
        type: Boolean,
        default: false,
      },
      familyAccess: {
        type: Boolean,
        default: false,
      },
      prioritySupport: {
        type: Boolean,
        default: false,
      },
      earlyAccess: {
        type: Boolean,
        default: false,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
subscriptionPlanSchema.index({ tier: 1 });
subscriptionPlanSchema.index({ isActive: 1 });

const SubscriptionPlanModel = mongoose.model<SubscriptionPlan>('SubscriptionPlan', subscriptionPlanSchema);

export default SubscriptionPlanModel;
