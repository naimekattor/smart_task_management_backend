import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service.js';
import { AttachmentService } from '../services/attachment.service.js';
import { CommentService } from '../services/comment.service.js';
import { TaskStatus, TaskPriority } from '@prisma/client';

const taskService = new TaskService();
const attachmentService = new AttachmentService();
const commentService = new CommentService();

export class TaskController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const creatorUserId = req.user!.id;
      const task = await taskService.create(req.body, creatorUserId);

      return res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);

      return res.status(200).json({
        success: true,
        message: 'Task retrieved successfully',
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        projectId: req.query.projectId as string | undefined,
        status: req.query.status as TaskStatus | undefined,
        priority: req.query.priority as TaskPriority | undefined,
        assignedUserId: req.query.assignedUserId as string | undefined,
        search: req.query.search as string | undefined,
        dueDateStart: req.query.dueDateStart as string | undefined,
        dueDateEnd: req.query.dueDateEnd as string | undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await taskService.getAllTasks(filters);

      return res.status(200).json({
        success: true,
        message: 'Tasks retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const role = req.user!.role;

      // Access checks: Team members can only update tasks assigned to them, and cannot reassign.
      // But we can check that!
      const currentTask = await taskService.getTaskById(id);

      if (role === 'TEAM_MEMBER') {
        // Team member can only update status of assigned tasks. They cannot modify title/deadline.
        if (currentTask.assignedUserId !== userId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You can only update tasks assigned to you.',
            errors: [],
          });
        }
        
        // Block modification of title, description, dueDate, priority, assignee by team members
        const { title, description, dueDate, priority, assignedUserId } = req.body;
        if (title || description || dueDate || priority || (assignedUserId !== undefined && assignedUserId !== currentTask.assignedUserId)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. Team members can only update task status.',
            errors: [],
          });
        }
      }

      const task = await taskService.update(id, req.body, userId);

      return res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      await taskService.delete(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // task id
      const userId = req.user!.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
          errors: [],
        });
      }

      const attachment = await attachmentService.upload(file, id, userId);

      return res.status(201).json({
        success: true,
        message: 'Attachment uploaded successfully',
        data: { attachment },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const { attachmentId } = req.params;
      await attachmentService.delete(attachmentId);

      return res.status(200).json({
        success: true,
        message: 'Attachment deleted successfully',
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }

  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // task id
      const userId = req.user!.id;

      const comment = await commentService.create(
        {
          ...req.body,
          taskId: id,
        },
        userId
      );

      return res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: { comment },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params;
      const userId = req.user!.id;
      const { content } = req.body;

      const comment = await commentService.update(commentId, content, userId);

      return res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        data: { comment },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params;
      const userId = req.user!.id;
      const role = req.user!.role;

      await commentService.delete(commentId, userId, role);

      return res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }
}
