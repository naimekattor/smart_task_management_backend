import { CommentRepository } from '../repositories/comment.repository.js';
import { TaskRepository } from '../repositories/task.repository.js';

const commentRepository = new CommentRepository();
const taskRepository = new TaskRepository();

export class CommentService {
  async create(data: any, userId: string) {
    const { content, taskId, parentId } = data;

    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    if (parentId) {
      const parent = await commentRepository.findById(parentId);
      if (!parent) {
        throw new Error('Parent comment not found');
      }
    }

    return commentRepository.create({
      content,
      taskId,
      userId,
      parentId: parentId || null,
    });
  }

  async update(id: string, content: string, userId: string) {
    const comment = await commentRepository.findById(id);
    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new Error('Unauthorized to edit this comment');
    }

    return commentRepository.update(id, content);
  }

  async delete(id: string, userId: string, userRole: string) {
    const comment = await commentRepository.findById(id);
    if (!comment) {
      throw new Error('Comment not found');
    }

    // Only owner of comment, PM, or Admin can delete comment
    if (comment.userId !== userId && userRole !== 'ADMIN' && userRole !== 'PROJECT_MANAGER') {
      throw new Error('Unauthorized to delete this comment');
    }

    await commentRepository.delete(id);
    return { success: true };
  }
}
