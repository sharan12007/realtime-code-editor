import { randomUUID } from 'node:crypto';
import { UserModel } from '../../../infrastructure/db/models/user.model.js';
import { RefreshTokenModel } from '../../../infrastructure/db/models/refresh-token.model.js';
import { compareHash, hashValue } from '../../../infrastructure/security/hash.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type AccessTokenPayload
} from '../../../infrastructure/security/jwt.js';
import { AppError } from '../../../shared/errors/app-error.js';
import { sha256 } from '../../../shared/utils/crypto.js';
import { env } from '../../../config/env.js';

const refreshExpiry = () => new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000);

export const registerUser = async (username: string, email: string, password: string) => {
  const existing = await UserModel.findOne({ $or: [{ email }, { username }] }).lean();
  if (existing) throw new AppError('User already exists', 409);

  const passwordHash = await hashValue(password);
  const user = await UserModel.create({ username, email, passwordHash });

  return { id: user._id.toString(), username: user.username, email: user.email };
};

export const loginUser = async (email: string, password: string, userAgent?: string, ipAddress?: string) => {
  const user = await UserModel.findOne({ email }).select('+passwordHash');
  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await compareHash(password, user.passwordHash);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const payload: AccessTokenPayload = { sub: user._id.toString(), email: user.email, username: user.username };
  const accessToken = signAccessToken(payload);

  const tokenId = randomUUID();
  const familyId = randomUUID();
  const refreshToken = signRefreshToken({ sub: user._id.toString(), tokenId, familyId });

  await RefreshTokenModel.create({
    userId: user._id,
    tokenId,
    familyId,
    tokenHash: sha256(refreshToken),
    userAgent,
    ipAddress,
    expiresAt: refreshExpiry()
  });

  await UserModel.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });

  return {
    accessToken,
    refreshToken,
    csrfToken: randomUUID(),
    user: { id: user._id.toString(), username: user.username, email: user.email }
  };
};

export const rotateRefreshToken = async (token: string, userAgent?: string, ipAddress?: string) => {
  const payload = verifyRefreshToken(token);

  const existing = await RefreshTokenModel.findOne({ tokenId: payload.tokenId }).select('+tokenHash');
  if (!existing || existing.revokedAt) throw new AppError('Invalid refresh token', 401);

  if (existing.tokenHash !== sha256(token)) throw new AppError('Invalid refresh token', 401);

  const user = await UserModel.findById(payload.sub).lean();
  if (!user || !user.isActive) throw new AppError('Unauthorized', 401);

  const nextTokenId = randomUUID();
  const nextRefreshToken = signRefreshToken({ sub: payload.sub, tokenId: nextTokenId, familyId: payload.familyId });

  existing.revokedAt = new Date();
  existing.replacedByTokenId = nextTokenId;
  await existing.save();

  await RefreshTokenModel.create({
    userId: user._id,
    tokenId: nextTokenId,
    familyId: payload.familyId,
    tokenHash: sha256(nextRefreshToken),
    userAgent,
    ipAddress,
    expiresAt: refreshExpiry()
  });

  const accessToken = signAccessToken({ sub: user._id.toString(), email: user.email, username: user.username });

  return {
    accessToken,
    refreshToken: nextRefreshToken,
    csrfToken: randomUUID(),
    user: { id: user._id.toString(), username: user.username, email: user.email }
  };
};

export const revokeRefreshToken = async (token: string | undefined) => {
  if (!token) return;

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return;
  }

  await RefreshTokenModel.updateOne(
    { tokenId: payload.tokenId, revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } }
  );
};
