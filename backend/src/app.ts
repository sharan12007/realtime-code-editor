import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { env } from './config/env.js';
import { apiRouter } from './interfaces/http/routes/index.js';
import { errorHandler, notFoundHandler } from './interfaces/http/middlewares/error.middleware.js';
import { xssSanitizeMiddleware } from './interfaces/http/middlewares/xss.middleware.js';

export const createApp = () => {
  const app = express();

  // Security headers middleware
  app.use(helmet());
  
  // CORS configuration - allows requests from frontend origin with credentials
  app.use(
    cors({
      origin: env.frontendOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    })
  );

  // Request logging
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  
  // Body parsing with size limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  
  // Cookie parsing for refresh token and CSRF token
  app.use(cookieParser());
  
  // Sanitization middlewares
  app.use(mongoSanitize());
  app.use(hpp());
  app.use(xssSanitizeMiddleware);

  // Rate limiting for API endpoints
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 400,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  // Stricter rate limiting for auth endpoints
  app.use(
    '/api/auth',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 50,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  // API routes
  app.use('/api', apiRouter);
  
  // Health check endpoint
  app.get('/health/live', (_req, res) => res.status(200).json({ status: 'ok' }));

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
