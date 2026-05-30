import { z } from 'zod';

export const executeSchema = z.object({
  language: z.enum(['javascript', 'python', 'cpp', 'java']),
  code: z.string().min(1).max(100_000),
  stdin: z.string().max(20_000).optional().default('')
});

export type ExecuteRequest = z.infer<typeof executeSchema>;
