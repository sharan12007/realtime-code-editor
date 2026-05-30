import { z } from 'zod';

const fileSchema = z.object({
  path: z.string().min(1).max(255),
  content: z.string().max(1_000_000),
  isEntry: z.boolean().optional()
});

export const updateProjectSchema = z.object({
  language: z.enum(['javascript', 'python', 'cpp', 'java']),
  files: z.array(fileSchema).min(1).max(200)
});
