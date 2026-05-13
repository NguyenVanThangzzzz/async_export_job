import { z } from 'zod';

export const todoIdParamSchema = z.object({
  id: z.string().uuid('Invalid todo id'),
});

export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1, 'Title must not be empty').optional(),
  completed: z.boolean().optional(),
});

export type TodoIdParamsDto = z.infer<typeof todoIdParamSchema>;
export type CreateTodoDto = z.infer<typeof createTodoSchema>;
export type UpdateTodoDto = z.infer<typeof updateTodoSchema>;
