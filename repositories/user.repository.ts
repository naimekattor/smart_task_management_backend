import prisma from '../config/db.js';
import { Prisma, Role } from '@prisma/client';

export class UserRepository {
  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getMembersWorkload() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        assignedTasks: {
          select: {
            status: true,
            dueDate: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const now = new Date();

    return users.map((user) => {
      const total = user.assignedTasks.length;
      const completed = user.assignedTasks.filter((t) => t.status === 'COMPLETED').length;
      const pending = user.assignedTasks.filter((t) => t.status !== 'COMPLETED').length;
      const overdue = user.assignedTasks.filter(
        (t) => t.status !== 'COMPLETED' && new Date(t.dueDate) < now
      ).length;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        workload: {
          total,
          completed,
          pending,
          overdue,
        },
      };
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }
}
