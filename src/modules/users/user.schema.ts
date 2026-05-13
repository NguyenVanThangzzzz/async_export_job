import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 chars').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const userIdParamSchema = z.object({
  id: z.string().min(1, 'Id is required'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type UserIdParamDto = z.infer<typeof userIdParamSchema>;
