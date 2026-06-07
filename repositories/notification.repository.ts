import prisma from '../config/db.js';

export class NotificationRepository {
  async create(userId: string, type: string, message: string) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        message,
        read: false,
      },
    });
  }

  async findByUserId(userId: string, limit: number = 20) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
