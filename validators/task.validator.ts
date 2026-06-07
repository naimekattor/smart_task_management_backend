import { z } from 'zod';
import { TaskPriority, TaskStatus } from '@prisma/client';

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters').max(150),
  description: z.string().optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid due date format',
  }),
  priority: z.nativeEnum(TaskPriority).optional(),
  projectId: z.string().uuid('Invalid project ID format'),
  assignedUserId: z.string().uuid('Invalid user ID format').nullable().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters').max(150).optional(),
  description: z.string().optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid due date format',
  }).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  assignedUserId: z.string().uuid('Invalid user ID').nullable().optional(),
});
