import { AttachmentRepository } from '../repositories/attachment.repository.js';
import { TaskRepository } from '../repositories/task.repository.js';
import { uploadFile, deleteFile } from '../config/storage.js';

const attachmentRepository = new AttachmentRepository();
const taskRepository = new TaskRepository();

export class AttachmentService {
  async upload(file: Express.Multer.File, taskId: string, userId: string) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // 1. Upload to storage (S3 or local fallback)
    const storageResult = await uploadFile(file);

    // 2. Save reference in DB
    const fileType = file.mimetype;
    const size = file.size;
    const name = file.originalname;

    return attachmentRepository.create({
      name,
      url: storageResult.url,
      fileType,
      size,
      taskId,
      userId,
    });
  }

  async delete(id: string) {
    const attachment = await attachmentRepository.findById(id);
    if (!attachment) {
      throw new Error('Attachment not found');
    }

    // 1. Extract key from URL
    // URL format:
    // S3: https://bucket.s3.region.amazonaws.com/key
    // Local: /uploads/key
    const urlParts = attachment.url.split('/');
    const key = urlParts[urlParts.length - 1];

    // 2. Delete file from storage
    await deleteFile(key);

    // 3. Delete from DB
    await attachmentRepository.delete(id);

    return { success: true };
  }

  async getTaskAttachments(taskId: string) {
    return attachmentRepository.findByTaskId(taskId);
  }
}
