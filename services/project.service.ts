import { ProjectRepository, ProjectFilters } from '../repositories/project.repository.js';
import { ActivityLogRepository } from '../repositories/activity.repository.js';
import { NotificationRepository } from '../repositories/notification.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { sendNotificationToUser } from '../config/socket.js';

const projectRepository = new ProjectRepository();
const activityLogRepository = new ActivityLogRepository();
const notificationRepository = new NotificationRepository();
const userRepository = new UserRepository();

export class ProjectService {
  async create(data: any, creatorUserId: string) {
    const { name, description, deadline, status } = data;

    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      throw new Error('Please select a valid future deadline.');
    }

    const existing = await projectRepository.findByName(name);
    if (existing) {
      throw new Error('Project name already exists.');
    }

    const project = await projectRepository.create(
      {
        name,
        description,
        deadline: deadlineDate,
        status: status || 'ACTIVE',
      },
      creatorUserId
    );

    await activityLogRepository.create(creatorUserId, 'PROJECT_CREATED', {
      projectId: project.id,
      projectName: project.name,
    });

    return project;
  }

  async getProjectById(id: string, userId: string, userRole: string) {
    if (userRole !== 'ADMIN') {
      const isMember = await projectRepository.isMember(id, userId);
      if (!isMember) {
        throw new Error('Access denied. You are not a member of this project.');
      }
    }

    const project = await projectRepository.findById(id);
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }

  async getAllProjects(filters: ProjectFilters, userId: string, userRole: string) {
    return projectRepository.findAll(filters, userId, userRole);
  }

  async update(id: string, data: any, userId: string) {
    const { name, description, deadline, status } = data;
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new Error('Project not found');
    }

    if (deadline) {
      const deadlineDate = new Date(deadline);
      if (deadlineDate <= new Date() && status !== 'COMPLETED') {
        throw new Error('Please select a valid future deadline.');
      }
    }

    if (name && name.toLowerCase() !== project.name.toLowerCase()) {
      const existing = await projectRepository.findByName(name);
      if (existing) {
        throw new Error('Project name already exists.');
      }
    }

    const updatedProject = await projectRepository.update(id, {
      name,
      description,
      deadline: deadline ? new Date(deadline) : undefined,
      status,
    });

    await activityLogRepository.create(userId, 'PROJECT_UPDATED', {
      projectId: project.id,
      projectName: updatedProject.name,
    });

    return updatedProject;
  }

  async delete(id: string, userId: string) {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new Error('Project not found');
    }

    await projectRepository.delete(id);

    await activityLogRepository.create(userId, 'PROJECT_DELETED', {
      projectName: project.name,
    });

    return { success: true };
  }

  async addMember(projectId: string, memberUserId: string, actionByUserId: string) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const isMember = await projectRepository.isMember(projectId, memberUserId);
    if (isMember) {
      throw new Error('User is already a member of this project.');
    }

    const user = await userRepository.findById(memberUserId);
    if (!user) {
      throw new Error('User to add not found.');
    }

    const member = await projectRepository.addMember(projectId, memberUserId);

    await activityLogRepository.create(actionByUserId, 'MEMBER_ADDED', {
      projectId,
      projectName: project.name,
      memberName: user.name,
      memberUserId,
    });

    const note = await notificationRepository.create(
      memberUserId,
      'PROJECT_ASSIGNED',
      `You have been added to the project: ${project.name}`
    );
    sendNotificationToUser(memberUserId, note);

    return member;
  }

  async removeMember(projectId: string, memberUserId: string, actionByUserId: string) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const isMember = await projectRepository.isMember(projectId, memberUserId);
    if (!isMember) {
      throw new Error('User is not a member of this project.');
    }

    const user = await userRepository.findById(memberUserId);
    if (!user) {
      throw new Error('User to remove not found.');
    }

    await projectRepository.removeMember(projectId, memberUserId);

    await activityLogRepository.create(actionByUserId, 'MEMBER_REMOVED', {
      projectId,
      projectName: project.name,
      memberName: user.name,
      memberUserId,
    });

    const note = await notificationRepository.create(
      memberUserId,
      'PROJECT_REMOVED',
      `You have been removed from the project: ${project.name}`
    );
    sendNotificationToUser(memberUserId, note);

    return { success: true };
  }
}
