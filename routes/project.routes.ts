import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { createProjectSchema, updateProjectSchema, addMemberSchema } from '../validators/project.validator.js';
import { Role } from '@prisma/client';

const router = Router();
const controller = new ProjectController();

router.use(authMiddleware); // All project routes require authentication

router.post(
  '/',
  roleMiddleware([Role.ADMIN, Role.PROJECT_MANAGER]),
  validateBody(createProjectSchema),
  controller.create
);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);

router.put(
  '/:id',
  roleMiddleware([Role.ADMIN, Role.PROJECT_MANAGER]),
  validateBody(updateProjectSchema),
  controller.update
);

router.delete(
  '/:id',
  roleMiddleware([Role.ADMIN]),
  controller.delete
);

router.post(
  '/:id/members',
  roleMiddleware([Role.ADMIN, Role.PROJECT_MANAGER]),
  validateBody(addMemberSchema),
  controller.addMember
);

router.delete(
  '/:id/members/:userId',
  roleMiddleware([Role.ADMIN, Role.PROJECT_MANAGER]),
  controller.removeMember
);

export default router;
