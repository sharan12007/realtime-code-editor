import { Schema, Types, model, type InferSchemaType } from 'mongoose';
import { ROOM_ROLES } from '../../../constants/editor.js';

const collaboratorSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: ROOM_ROLES,
      default: 'editor',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now,
      required: true
    }
  },
  { _id: false }
);

const roomSchema = new Schema(
  {
    roomName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120
    },
    roomSlug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 120,
      match: /^[a-z0-9-]+$/
    },
    ownerId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    collaborators: {
      type: [collaboratorSchema],
      default: []
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

roomSchema.index({ ownerId: 1, updatedAt: -1 });
roomSchema.index({ roomSlug: 1 }, { unique: true });
roomSchema.index({ 'collaborators.userId': 1, updatedAt: -1 });

export type RoomDocument = InferSchemaType<typeof roomSchema>;

export const RoomModel = model('Room', roomSchema);
