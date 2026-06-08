import { Router } from 'express';
import multer from 'multer';
import { TaskController } from '../controllers/task.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { createTaskSchema, updateTaskSchema } from '../validators/task.validator.js';
import { createCommentSchema, updateCommentSchema } from '../validators/comment.validator.js';
import { Role } from '@prisma/client';

const router = Router();
const controller = new TaskController();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpg',
      'image/jpeg',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, PNG, JPG, JPEG'));
    }
  },
});

router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware([Role.ADMIN, Role.PROJECT_MANAGER]),
  validateBody(createTaskSchema),
  controller.create
);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id', validateBody(updateTaskSchema), controller.update);
router.delete(
  '/:id',
  roleMiddleware([Role.ADMIN, Role.PROJECT_MANAGER]),
  controller.delete
);

router.post('/:id/attachments', upload.single('file'), controller.uploadAttachment);
router.delete('/attachments/:attachmentId', controller.deleteAttachment);

router.post('/:id/comments', validateBody(createCommentSchema), controller.createComment);
router.put('/comments/:commentId', validateBody(updateCommentSchema), controller.updateComment);
router.delete('/comments/:commentId', controller.deleteComment);

export default router;
