import prisma from '../config/db.js';

export class AnalyticsRepository {
  async getDashboardStats(userId?: string, role?: string) {
    const now = new Date();

    const projectFilter: any = {};
    const taskFilter: any = {};

    if (role !== 'ADMIN' && userId) {
      projectFilter.members = {
        some: { userId },
      };
      taskFilter.project = {
        members: {
          some: { userId },
        },
      };
    }

    const [
      totalProjects,
      totalTasks,
      completedTasks,
      todoTasks,
      inProgressTasks,
      overdueTasks,
    ] = await Promise.all([
      prisma.project.count({ where: projectFilter }),
      prisma.task.count({ where: taskFilter }),
      prisma.task.count({ where: { ...taskFilter, status: 'COMPLETED' } }),
      prisma.task.count({ where: { ...taskFilter, status: 'TODO' } }),
      prisma.task.count({ where: { ...taskFilter, status: 'IN_PROGRESS' } }),
      prisma.task.count({
        where: {
          ...taskFilter,
          status: { not: 'COMPLETED' },
          dueDate: { lt: now },
        },
      }),
    ]);

    const pendingTasks = todoTasks + inProgressTasks;

    const [priorityHigh, priorityMedium, priorityLow] = await Promise.all([
      prisma.task.count({ where: { ...taskFilter, priority: 'HIGH' } }),
      prisma.task.count({ where: { ...taskFilter, priority: 'MEDIUM' } }),
      prisma.task.count({ where: { ...taskFilter, priority: 'LOW' } }),
    ]);

    const tasksByPriority = [
      { name: 'High', value: priorityHigh },
      { name: 'Medium', value: priorityMedium },
      { name: 'Low', value: priorityLow },
    ];

    const taskStatusDistribution = [
      { name: 'Todo', value: todoTasks },
      { name: 'In Progress', value: inProgressTasks },
      { name: 'Completed', value: completedTasks },
    ];

    const projects = await prisma.project.findMany({
      where: projectFilter,
      select: {
        id: true,
        name: true,
        tasks: {
          select: {
            status: true,
          },
        },
      },
    });

    const projectProgressTrend = projects.map((p) => {
      const total = p.tasks.length;
      const completed = p.tasks.filter((t) => t.status === 'COMPLETED').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
        progress,
      };
    });

    const users = await prisma.user.findMany({
      select: {
        name: true,
        assignedTasks: {
          where: { status: 'COMPLETED' },
          select: { id: true },
        },
      },
      take: 5,
    });

    const teamProductivity = users.map((u) => ({
      name: u.name.split(' ')[0],
      completed: u.assignedTasks.length,
    }));

    return {
      kpis: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
      },
      charts: {
        tasksByPriority,
        taskStatusDistribution,
        projectProgressTrend,
        teamProductivity,
      },
    };
  }
}
