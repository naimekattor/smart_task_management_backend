import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { registerSchema, loginSchema, demoLoginSchema } from '../validators/auth.validator.js';
import { authLimiter } from '../middlewares/rate-limit.middleware.js';

const router = Router();
const controller = new AuthController();

router.post('/register', authLimiter, validateBody(registerSchema), controller.register);
router.post('/login', authLimiter, validateBody(loginSchema), controller.login);
router.post('/demo-login', authLimiter, validateBody(demoLoginSchema), controller.demoLogin);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', authMiddleware, controller.getMe);

export default router;
