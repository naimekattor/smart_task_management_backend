import prisma from '../config/db.js';
import { Prisma } from '@prisma/client';

export class AttachmentRepository {
  async create(data: Prisma.AttachmentUncheckedCreateInput) {
    return prisma.attachment.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.attachment.findUnique({
      where: { id },
    });
  }

  async delete(id: string) {
    return prisma.attachment.delete({
      where: { id },
    });
  }

  async findByTaskId(taskId: string) {
    return prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
