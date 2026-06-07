import { Request, Response, NextFunction } from 'express';
import { NotificationRepository } from '../repositories/notification.repository.js';

const notificationRepository = new NotificationRepository();

export class NotificationController {
  async getUserNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const notifications = await notificationRepository.findByUserId(userId);

      return res.status(200).json({
        success: true,
        message: 'Notifications retrieved successfully',
        data: { notifications },
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const notification = await notificationRepository.markAsRead(id);

      return res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: { notification },
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      await notificationRepository.markAllAsRead(userId);

      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }
}
