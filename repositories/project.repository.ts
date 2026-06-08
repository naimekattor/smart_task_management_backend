import prisma from '../config/db.js';
import { Prisma, ProjectStatus } from '@prisma/client';

export interface ProjectFilters {
  status?: ProjectStatus;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'deadline';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class ProjectRepository {
  async create(data: Prisma.ProjectCreateInput, creatorUserId: string) {
    return prisma.$transaction(async (tx) => {
      const project = await tx.project.create({ data });
      
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: creatorUserId,
        },
      });

      return project;
    });
  }

  async findByName(name: string) {
    return prisma.project.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatarUrl: true,
              },
            },
          },
        },
        tasks: {
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
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findAll(filters: ProjectFilters, userId?: string, userRole?: string) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (userRole !== 'ADMIN' && userId) {
      where.members = {
        some: {
          userId,
        },
      };
    }

    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  avatarUrl: true,
                },
              },
            },
          },
          tasks: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return {
      projects,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: Prisma.ProjectUpdateInput) {
    return prisma.project.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.project.delete({
      where: { id },
    });
  }

  async addMember(projectId: string, userId: string) {
    return prisma.projectMember.create({
      data: {
        projectId,
        userId,
      },
      include: {
        user: {
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

  async removeMember(projectId: string, userId: string) {
    return prisma.projectMember.deleteMany({
      where: {
        projectId,
        userId,
      },
    });
  }

  async isMember(projectId: string, userId: string): Promise<boolean> {
    const member = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
      },
    });
    return !!member;
  }
}
