import { Router } from 'express';
import {
  getProjectController,
  updateProjectController
} from '../../../controllers/projects/project.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../middlewares/async-handler.middleware.js';

export const projectRouter = Router();

projectRouter.use(requireAuth);
projectRouter.get('/:id', asyncHandler(getProjectController));
projectRouter.put('/:id', asyncHandler(updateProjectController));
