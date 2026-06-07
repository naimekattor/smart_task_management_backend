import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';

export const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(100),
  description: z.string().optional(),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid deadline date format',
  }),
  status: z.nativeEnum(ProjectStatus).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(100).optional(),
  description: z.string().optional(),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid deadline date format',
  }).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
});

export const addMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});
