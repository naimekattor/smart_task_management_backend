import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service.js';
import { ProjectStatus } from '@prisma/client';

const projectService = new ProjectService();

export class ProjectController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const creatorUserId = req.user!.id;
      const project = await projectService.create(req.body, creatorUserId);

      return res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const role = req.user!.role;

      const project = await projectService.getProjectById(id, userId, role);

      return res.status(200).json({
        success: true,
        message: 'Project retrieved successfully',
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;

      const filters = {
        status: req.query.status as ProjectStatus | undefined,
        search: req.query.search as string | undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await projectService.getAllProjects(filters, userId, role);

      return res.status(200).json({
        success: true,
        message: 'Projects retrieved successfully',
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
      const project = await projectService.update(id, req.body, userId);

      return res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      await projectService.delete(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Project deleted successfully',
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }

  async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { userId: memberUserId } = req.body;
      const actionByUserId = req.user!.id;

      const member = await projectService.addMember(id, memberUserId, actionByUserId);

      return res.status(201).json({
        success: true,
        message: 'Member added to project successfully',
        data: { member },
      });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, userId: memberUserId } = req.params;
      const actionByUserId = req.user!.id;

      await projectService.removeMember(id, memberUserId, actionByUserId);

      return res.status(200).json({
        success: true,
        message: 'Member removed from project successfully',
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }
}
