import { randomUUID } from 'node:crypto';
import { Schema, Types, model, type InferSchemaType } from 'mongoose';

const refreshTokenSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    tokenId: {
      type: String,
      required: true,
      unique: true,
      default: () => randomUUID()
    },
    tokenHash: {
      type: String,
      required: true,
      select: false,
      minlength: 64,
      maxlength: 255
    },
    familyId: {
      type: String,
      required: true,
      index: true
    },
    userAgent: {
      type: String,
      required: false,
      maxlength: 500
    },
    ipAddress: {
      type: String,
      required: false,
      maxlength: 64
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    revokedAt: {
      type: Date,
      required: false,
      index: true
    },
    replacedByTokenId: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

refreshTokenSchema.index({ userId: 1, createdAt: -1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ familyId: 1, revokedAt: 1 });

export type RefreshTokenDocument = InferSchemaType<typeof refreshTokenSchema>;

export const RefreshTokenModel = model('RefreshToken', refreshTokenSchema);
