import { z } from 'zod';

export const exportBodySchema = z.object({
  format: z.enum(['csv', 'json']).default('csv'),
  filters: z
    .object({
      done: z.boolean().optional(),
    })
    .default({}),
  notifyEmail: z.string().email('notifyEmail must be a valid email'),
});

export type ExportBodyDto = z.infer<typeof exportBodySchema>;
