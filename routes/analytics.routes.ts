import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new AnalyticsController();

router.get('/dashboard', authMiddleware, controller.getDashboardData);

export default router;
