import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getDashboardData(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;

      const data = await analyticsService.getDashboardData(userId, role);

      return res.status(200).json({
        success: true,
        message: 'Dashboard analytics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
