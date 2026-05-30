import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  username: string;
};

export type RefreshTokenPayload = {
  sub: string;
  tokenId: string;
  familyId: string;
};

export const signAccessToken = (payload: AccessTokenPayload) => {
  const options: jwt.SignOptions = {};

  if (env.accessTokenTtl !== undefined) {
    const expiresIn = env.accessTokenTtl as NonNullable<jwt.SignOptions['expiresIn']>;
    options.expiresIn = expiresIn;
  }

  return jwt.sign(payload, env.jwtAccessSecret, options);
};

export const signRefreshToken = (payload: RefreshTokenPayload) => {
  const options: jwt.SignOptions = {};
  const refreshExpiry = `${env.refreshTokenTtlDays}d`;

  if (refreshExpiry !== undefined) {
    const expiresIn = refreshExpiry as NonNullable<jwt.SignOptions['expiresIn']>;
    options.expiresIn = expiresIn;
  }

  return jwt.sign(payload, env.jwtRefreshSecret, options);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
};
