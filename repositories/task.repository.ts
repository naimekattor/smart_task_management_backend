import prisma from '../config/db.js';
import { Prisma, TaskStatus, TaskPriority } from '@prisma/client';

export interface TaskFilters {
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedUserId?: string;
  search?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class TaskRepository {
  async create(data: Prisma.TaskUncheckedCreateInput) {
    return prisma.task.create({
      data,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findByTitleInProject(projectId: string, title: string) {
    return prisma.task.findFirst({
      where: {
        projectId,
        title: {
          equals: title,
          mode: 'insensitive',
        },
      },
    });
  }

  async findAll(filters: TaskFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {};

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assignedUserId) {
      where.assignedUserId = filters.assignedUserId;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.dueDateStart || filters.dueDateEnd) {
      where.dueDate = {};
      if (filters.dueDateStart) {
        where.dueDate.gte = new Date(filters.dueDateStart);
      }
      if (filters.dueDateEnd) {
        where.dueDate.lte = new Date(filters.dueDateEnd);
      }
    }

    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              avatarUrl: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: Prisma.TaskUncheckedUpdateInput) {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.task.delete({
      where: { id },
    });
  }

  async bulkUpdateStatus(taskIds: string[], status: TaskStatus) {
    return prisma.task.updateMany({
      where: {
        id: { in: taskIds },
      },
      data: { status },
    });
  }
}
