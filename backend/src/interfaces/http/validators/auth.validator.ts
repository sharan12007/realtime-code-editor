import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().max(160),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'Password must contain upper, lower and number')
});

export const loginSchema = z.object({
  email: z.string().email().max(160),
  password: z.string().min(8).max(128)
});

export const refreshSchema = z.object({
  csrfToken: z.string().min(16)
});
