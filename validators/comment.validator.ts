import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment text cannot be empty').max(1000),
  parentId: z.string().uuid('Invalid parent comment ID format').optional().nullable(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment text cannot be empty').max(1000),
});
