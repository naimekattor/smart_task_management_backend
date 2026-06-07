import prisma from '../config/db.js';
import { Prisma } from '@prisma/client';

export class CommentRepository {
  async create(data: Prisma.CommentUncheckedCreateInput) {
    return prisma.comment.create({
      data,
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
    });
  }

  async findById(id: string) {
    return prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, content: string) {
    return prisma.comment.update({
      where: { id },
      data: { content },
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
    });
  }

  async delete(id: string) {
    return prisma.comment.delete({
      where: { id },
    });
  }

  async findReplies(parentId: string) {
    return prisma.comment.findMany({
      where: { parentId },
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
    });
  }
}
