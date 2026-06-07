import { Request, Response, NextFunction } from 'express';
import { ActivityLogRepository } from '../repositories/activity.repository.js';

const activityLogRepository = new ActivityLogRepository();

export class ActivityController {
  async getLatestActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const activities = await activityLogRepository.findLatest(10);
      return res.status(200).json({
        success: true,
        message: 'Recent activity logs retrieved successfully',
        data: { activities },
      });
    } catch (error) {
      next(error);
    }
  }
}
