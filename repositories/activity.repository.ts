import prisma from '../config/db.js';
import { Prisma } from '@prisma/client';

export class ActivityLogRepository {
  async create(userId: string, action: string, metadata?: Prisma.InputJsonValue) {
    return prisma.activityLog.create({
      data: {
        userId,
        action,
        metadata,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findLatest(limit: number = 10) {
    return prisma.activityLog.findMany({
      take: limit,
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });
  }
}
