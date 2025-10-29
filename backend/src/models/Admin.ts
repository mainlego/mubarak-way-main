import mongoose, { Schema, type Model, type Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface AdminPermissions {
  canManageBooks: boolean;
  canManageNashids: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canManageAdmins: boolean;
}

export interface IAdmin extends Document {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'moderator' | 'editor';
  permissions: AdminPermissions;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLastLogin(): Promise<IAdmin>;
}

const adminSchema = new Schema<IAdmin>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'editor'],
      default: 'editor',
    },
    permissions: {
      canManageBooks: { type: Boolean, default: true },
      canManageNashids: { type: Boolean, default: true },
      canManageUsers: { type: Boolean, default: false },
      canViewAnalytics: { type: Boolean, default: true },
      canManageAdmins: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
adminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last login
adminSchema.methods.updateLastLogin = async function (): Promise<IAdmin> {
  this.lastLogin = new Date();
  return this.save();
};

const AdminModel: Model<IAdmin> = mongoose.model<IAdmin>('Admin', adminSchema);

export default AdminModel;
