import { Router } from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.routes.js';
import taskRoutes from './task.routes.js';
import userRoutes from './user.routes.js';
import analyticsRoutes from './analytics.routes.js';
import activityRoutes from './activity.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/activity', activityRoutes);
router.use('/notifications', notificationRoutes);

export default router;
