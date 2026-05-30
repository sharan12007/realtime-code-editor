import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { roomRouter } from './room.routes.js';
import { projectRouter } from './project.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/rooms', roomRouter);
apiRouter.use('/projects', projectRouter);

apiRouter.get('/health/ready', (_req, res) => {
  res.status(200).json({ status: 'ready' });
});
