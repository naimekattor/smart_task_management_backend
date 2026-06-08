import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { Role } from '@prisma/client';

const router = Router();
const controller = new UserController();

router.use(authMiddleware);

router.get('/', controller.getAllUsers);
router.get('/workloads', controller.getTeamWorkloads);
router.delete('/:id', roleMiddleware([Role.ADMIN]), controller.deleteUser);

export default router;
