import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new ActivityController();

router.get('/logs', authMiddleware, controller.getLatestActivities);

export default router;
