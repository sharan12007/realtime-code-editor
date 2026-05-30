import type { Request, Response } from 'express';
import { executeSchema } from '../types/execute.js';
import { executeCode } from '../services/execution.service.js';

export const executeController = async (req: Request, res: Response) => {
  const payload = executeSchema.parse(req.body);
  const result = await executeCode(payload);
  res.status(200).json(result);
};
