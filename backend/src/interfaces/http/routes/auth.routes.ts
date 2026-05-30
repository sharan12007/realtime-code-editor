import { Router } from 'express';
import {
  loginController,
  logoutController,
  meController,
  refreshController,
  registerController
} from '../../../controllers/auth/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../middlewares/async-handler.middleware.js';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(registerController));
authRouter.post('/login', asyncHandler(loginController));
authRouter.post('/logout', asyncHandler(logoutController));
authRouter.post('/refresh', asyncHandler(refreshController));
authRouter.get('/me', requireAuth, asyncHandler(meController));
