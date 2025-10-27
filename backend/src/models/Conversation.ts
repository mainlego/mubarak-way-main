import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    analysis?: any;
  };
  suggestedActions?: Array<{
    type: string;
    label: string;
    data: any;
  }>;
  relatedAyahs?: Array<{
    surahNumber: number;
    ayahNumber: number;
    arabicText?: string;
    translation?: string;
  }>;
}

export interface IConversation extends Document {
  userId: string;
  sessionId: string;
  messages: IMessage[];
  metadata: {
    language: string;
    topic?: string;
    relatedSurahs?: number[];
    relatedAyahs?: Array<{
      surahNumber: number;
      ayahNumber: number;
    }>;
  };
  status: 'active' | 'completed' | 'archived';
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  addMessage(role: 'system' | 'user' | 'assistant', content: string, options?: any): Promise<IConversation>;
  getContext(messageCount: number): IMessage[];
  addRelatedAyah(surahNumber: number, ayahNumber: number): Promise<IConversation>;
}

const messageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ['system', 'user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  context: {
    analysis: Schema.Types.Mixed,
  },
  suggestedActions: [{
    type: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    data: Schema.Types.Mixed,
  }],
  relatedAyahs: [{
    surahNumber: Number,
    ayahNumber: Number,
    arabicText: String,
    translation: String,
  }],
}, { _id: false });

const conversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    metadata: {
      language: {
        type: String,
        default: 'ru',
      },
      topic: String,
      relatedSurahs: {
        type: [Number],
        default: [],
      },
      relatedAyahs: [{
        surahNumber: Number,
        ayahNumber: Number,
      }],
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
      index: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
conversationSchema.index({ userId: 1, sessionId: 1 }, { unique: true });
conversationSchema.index({ userId: 1, status: 1 });
conversationSchema.index({ lastActivity: -1 });

// Methods
conversationSchema.methods.addMessage = async function(
  role: 'system' | 'user' | 'assistant',
  content: string,
  options: any = {}
): Promise<IConversation> {
  const message: IMessage = {
    role,
    content,
    timestamp: new Date(),
    ...options,
  };

  this.messages.push(message);
  this.lastActivity = new Date();
  return await this.save();
};

conversationSchema.methods.getContext = function(messageCount: number = 10): IMessage[] {
  return this.messages
    .filter((msg: IMessage) => msg.role !== 'system')
    .slice(-messageCount);
};

conversationSchema.methods.addRelatedAyah = async function(
  surahNumber: number,
  ayahNumber: number
): Promise<IConversation> {
  const existingSurah = this.metadata.relatedSurahs.find((s: number) => s === surahNumber);
  if (!existingSurah) {
    this.metadata.relatedSurahs.push(surahNumber);
  }

  const existingAyah = this.metadata.relatedAyahs.find(
    (a: any) => a.surahNumber === surahNumber && a.ayahNumber === ayahNumber
  );

  if (!existingAyah) {
    this.metadata.relatedAyahs.push({ surahNumber, ayahNumber });
  }

  return await this.save();
};

const ConversationModel = mongoose.model<IConversation>('Conversation', conversationSchema);

export default ConversationModel;
