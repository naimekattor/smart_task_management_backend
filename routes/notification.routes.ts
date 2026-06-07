import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new NotificationController();

router.use(authMiddleware);

router.get('/', controller.getUserNotifications);
router.patch('/:id/read', controller.markAsRead);
router.patch('/read-all', controller.markAllAsRead);

export default router;
