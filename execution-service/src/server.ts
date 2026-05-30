import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { executeController } from './controllers/execute.controller.js';
import { asyncHandler } from './utils/async-handler.js';
import { errorHandler } from './utils/error-handler.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.allowedOrigin,
    credentials: false,
    methods: ['POST', 'GET']
  })
);
app.use(express.json({ limit: '256kb' }));

app.get('/health/live', (_req, res) => res.status(200).json({ status: 'ok' }));
app.post('/api/execute', asyncHandler(executeController));

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`execution-service listening on :${env.port}`);
});
