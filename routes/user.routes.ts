import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new UserController();

router.use(authMiddleware);

router.get('/', controller.getAllUsers);
router.get('/workloads', controller.getTeamWorkloads);

export default router;
