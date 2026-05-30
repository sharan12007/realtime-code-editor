import type { Request, Response } from 'express';
import { registerSchema, loginSchema, refreshSchema } from '../../interfaces/http/validators/auth.validator.js';
import {
  loginUser,
  registerUser,
  revokeRefreshToken,
  rotateRefreshToken
} from '../../application/use-cases/auth/auth.use-cases.js';
import type { AuthenticatedRequest } from '../../interfaces/http/middlewares/auth.middleware.js';
import { env, isProduction } from '../../config/env.js';

// Cookie names for refresh token and CSRF protection
const REFRESH_COOKIE = 'refresh_token';
const CSRF_COOKIE = 'csrf_token';

// Configure auth cookies for secure cross-site deployment
// SameSite=None allows cookies to work when frontend is on Vercel and backend on Railway
// Path=/ ensures cookies are sent to all routes for refresh endpoint
const setAuthCookies = (res: Response, refreshToken: string, csrfToken: string) => {
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    domain: env.cookieDomain,
    path: '/',
    maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000
  } as const;

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);

  res.cookie(CSRF_COOKIE, csrfToken, {
    ...cookieOptions,
    httpOnly: false
  });
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth', domain: env.cookieDomain });
  res.clearCookie(CSRF_COOKIE, { path: '/api/auth', domain: env.cookieDomain });
};

export const registerController = async (req: Request, res: Response) => {
  const payload = registerSchema.parse(req.body);
  const user = await registerUser(payload.username, payload.email.toLowerCase(), payload.password);
  res.status(201).json({ user });
};

export const loginController = async (req: Request, res: Response) => {
  const payload = loginSchema.parse(req.body);
  const result = await loginUser(
    payload.email.toLowerCase(),
    payload.password,
    req.get('user-agent'),
    req.ip
  );

  setAuthCookies(res, result.refreshToken, result.csrfToken);
  res.status(200).json({ accessToken: result.accessToken, user: result.user });
};

export const refreshController = async (req: Request, res: Response) => {
  const csrfHeader = String(req.headers['x-csrf-token'] ?? '');
  refreshSchema.parse({ csrfToken: csrfHeader });

  const csrfCookie = req.cookies[CSRF_COOKIE];
  if (!csrfCookie || csrfCookie !== csrfHeader) {
    return res.status(403).json({ message: 'CSRF token mismatch' });
  }

  const refreshToken = req.cookies[REFRESH_COOKIE];
  const result = await rotateRefreshToken(refreshToken, req.get('user-agent'), req.ip);

  setAuthCookies(res, result.refreshToken, result.csrfToken);
  return res.status(200).json({ accessToken: result.accessToken, user: result.user });
};

export const logoutController = async (req: Request, res: Response) => {
  await revokeRefreshToken(req.cookies[REFRESH_COOKIE]);
  clearAuthCookies(res);
  res.status(200).json({ message: 'Logged out' });
};

export const meController = async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({ user: req.user });
};
