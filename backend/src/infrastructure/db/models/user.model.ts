import { Schema, model, type InferSchemaType } from 'mongoose';

const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: usernameRegex
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: 60,
      maxlength: 255,
      select: false
    },
    avatarUrl: {
      type: String,
      required: false,
      trim: true,
      maxlength: 500
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    lastLoginAt: {
      type: Date,
      required: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });

export type UserDocument = InferSchemaType<typeof userSchema>;

export const UserModel = model('User', userSchema);
