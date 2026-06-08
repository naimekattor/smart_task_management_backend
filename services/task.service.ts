import { TaskRepository, TaskFilters } from '../repositories/task.repository.js';
import { ProjectRepository } from '../repositories/project.repository.js';
import { ActivityLogRepository } from '../repositories/activity.repository.js';
import { NotificationRepository } from '../repositories/notification.repository.js';
import { TaskStatus } from '@prisma/client';
import { sendNotificationToUser } from '../config/socket.js';

const taskRepository = new TaskRepository();
const projectRepository = new ProjectRepository();
const activityLogRepository = new ActivityLogRepository();
const notificationRepository = new NotificationRepository();

export class TaskService {
  async create(data: any, creatorUserId: string) {
    const { title, description, dueDate, priority, projectId, assignedUserId } = data;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = new Date(dueDate);
    if (taskDueDate < today) {
      throw new Error('Please select a valid deadline.');
    }

    const existing = await taskRepository.findByTitleInProject(projectId, title);
    if (existing) {
      throw new Error('This task already exists in the project.');
    }

    if (assignedUserId) {
      const isMember = await projectRepository.isMember(projectId, assignedUserId);
      if (!isMember) {
        throw new Error('Assigned user must be a member of the project.');
      }
    }

    const task = await taskRepository.create({
      title,
      description,
      dueDate: taskDueDate,
      priority: priority || 'MEDIUM',
      status: 'TODO',
      projectId,
      assignedUserId: assignedUserId || null,
    });

    await activityLogRepository.create(creatorUserId, 'TASK_CREATED', {
      taskId: task.id,
      taskTitle: task.title,
      projectId,
    });

    if (assignedUserId) {
      const note = await notificationRepository.create(
        assignedUserId,
        'TASK_ASSIGNED',
        `You have been assigned task: "${task.title}"`
      );
      sendNotificationToUser(assignedUserId, note);
      
      await activityLogRepository.create(creatorUserId, 'TASK_ASSIGNED', {
        taskId: task.id,
        taskTitle: task.title,
        assigneeId: assignedUserId,
        assigneeName: task.assignee?.name || '',
      });
    }

    return task;
  }

  async getTaskById(id: string) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  }

  async getAllTasks(filters: TaskFilters) {
    return taskRepository.findAll(filters);
  }

  async update(id: string, data: any, userId: string) {
    const { title, description, dueDate, priority, status, assignedUserId } = data;
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    if (title && title.toLowerCase() !== task.title.toLowerCase()) {
      const existing = await taskRepository.findByTitleInProject(task.projectId, title);
      if (existing) {
        throw new Error('This task already exists in the project.');
      }
    }

    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const taskDueDate = new Date(dueDate);
      if (taskDueDate < today && status !== 'COMPLETED' && task.status !== 'COMPLETED') {
        throw new Error('Please select a valid deadline.');
      }
    }

    if (assignedUserId !== undefined && assignedUserId !== task.assignedUserId) {
      if (task.status === TaskStatus.COMPLETED) {
        throw new Error('Completed tasks cannot be reassigned.');
      }

      if (assignedUserId) {
        const isMember = await projectRepository.isMember(task.projectId, assignedUserId);
        if (!isMember) {
          throw new Error('Assigned user must be a member of the project.');
        }
      }
    }

    const updatedTask = await taskRepository.update(id, {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      status,
      assignedUserId: assignedUserId === null ? null : assignedUserId,
    });

    if (status && status !== task.status) {
      if (status === 'COMPLETED') {
        await activityLogRepository.create(userId, 'TASK_COMPLETED', {
          taskId: task.id,
          taskTitle: updatedTask.title,
        });

        if (task.assignedUserId && userId !== task.assignedUserId) {
          const note = await notificationRepository.create(
            task.assignedUserId,
            'TASK_COMPLETED_ALERT',
            `Task was completed: "${updatedTask.title}"`
          );
          sendNotificationToUser(task.assignedUserId, note);
        }
      } else {
        await activityLogRepository.create(userId, 'TASK_STATUS_UPDATED', {
          taskId: task.id,
          taskTitle: updatedTask.title,
          oldStatus: task.status,
          newStatus: status,
        });
      }
    }

    if (assignedUserId !== undefined && assignedUserId !== task.assignedUserId && assignedUserId) {
      const note = await notificationRepository.create(
        assignedUserId,
        'TASK_ASSIGNED',
        `You have been assigned task: "${updatedTask.title}"`
      );
      sendNotificationToUser(assignedUserId, note);

      await activityLogRepository.create(userId, 'TASK_ASSIGNED', {
        taskId: task.id,
        taskTitle: updatedTask.title,
        assigneeId: assignedUserId,
        assigneeName: updatedTask.assignee?.name || '',
      });
    }

    return updatedTask;
  }

  async delete(id: string, userId: string) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    await taskRepository.delete(id);

    await activityLogRepository.create(userId, 'TASK_DELETED', {
      taskTitle: task.title,
      projectId: task.projectId,
    });

    return { success: true };
  }
}
