import { PrismaClient, Role, ProjectStatus, TaskPriority, TaskStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const passwordAdmin = await bcrypt.hash('Admin@123', salt);
  const passwordPM = await bcrypt.hash('Manager@123', salt);
  const passwordMember = await bcrypt.hash('Member@123', salt);

  const admin = await prisma.user.create({
    data: {
      name: 'Sarah Admin (Demo)',
      email: 'admin@demo.com',
      password: passwordAdmin,
      role: Role.ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const pm = await prisma.user.create({
    data: {
      name: 'Alex Manager (Demo)',
      email: 'pm@demo.com',
      password: passwordPM,
      role: Role.PROJECT_MANAGER,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  const member1 = await prisma.user.create({
    data: {
      name: 'Jordan Member (Demo)',
      email: 'member@demo.com',
      password: passwordMember,
      role: Role.TEAM_MEMBER,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: 'Emily Chen',
      email: 'emily@demo.com',
      password: passwordMember,
      role: Role.TEAM_MEMBER,
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    },
  });

  console.log('Users created successfully.');

  const project1 = await prisma.project.create({
    data: {
      name: 'Enterprise Dashboard Redesign',
      description: 'Revamping the core customer-facing metrics platform using Next.js 16 and Tailwind CSS v4.',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: ProjectStatus.ACTIVE,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Cloud Infrastructure Migration',
      description: 'Migrating backend services from legacy servers to AWS containerized microservices.',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: ProjectStatus.ACTIVE,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Mobile App Beta Launch',
      description: 'Finalizing the React Native mobile client for iOS and Android deployment.',
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: ProjectStatus.ON_HOLD,
    },
  });

  console.log('Projects created.');

  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: admin.id },
      { projectId: project1.id, userId: pm.id },
      { projectId: project1.id, userId: member1.id },
      { projectId: project1.id, userId: member2.id },
      
      { projectId: project2.id, userId: pm.id },
      { projectId: project2.id, userId: member1.id },
      
      { projectId: project3.id, userId: admin.id },
      { projectId: project3.id, userId: member2.id },
    ],
  });

  console.log('Project memberships assigned.');

  const t1 = await prisma.task.create({
    data: {
      title: 'Design UI/UX Mockups',
      description: 'Create high-fidelity screens for the analytics charts in Figma.',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      priority: TaskPriority.HIGH,
      status: TaskStatus.COMPLETED,
      projectId: project1.id,
      assignedUserId: member1.id,
    },
  });

  const t2 = await prisma.task.create({
    data: {
      title: 'Configure Next.js State Management',
      description: 'Set up Zustand stores and TanStack Query client for API sync.',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      projectId: project1.id,
      assignedUserId: member1.id,
    },
  });

  const t3 = await prisma.task.create({
    data: {
      title: 'Implement Dark Mode Toggle',
      description: 'Integrate next-themes and add transition styles across layouts.',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      priority: TaskPriority.LOW,
      status: TaskStatus.TODO,
      projectId: project1.id,
      assignedUserId: member2.id,
    },
  });

  const t4 = await prisma.task.create({
    data: {
      title: 'Integrate Recharts Widgets',
      description: 'Build components representing project productivity and tasks summary.',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      projectId: project1.id,
      assignedUserId: admin.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Create Dockerfiles for Express APIs',
      description: 'Write optimized multi-stage build files and verify image size.',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      projectId: project2.id,
      assignedUserId: member1.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Deploy RDS Database Instance',
      description: 'Provision AWS PostgreSQL database and apply schemas.',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      projectId: project2.id,
      assignedUserId: pm.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Setup Apple Developer Accounts',
      description: 'Purchase Developer Program membership and configure certificates.',
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      priority: TaskPriority.HIGH,
      status: TaskStatus.TODO,
      projectId: project3.id,
      assignedUserId: member2.id,
    },
  });

  console.log('Tasks created.');

  await prisma.comment.create({
    data: {
      content: 'Figma mockups are approved, proceeding to components development.',
      taskId: t1.id,
      userId: pm.id,
    },
  });

  const parentComment = await prisma.comment.create({
    data: {
      content: 'Do we have client-side routing logic set up for Zustand stores?',
      taskId: t2.id,
      userId: admin.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Yes, Zustand will handle the sidebar and UI filters. TanStack Query will fetch data.',
      taskId: t2.id,
      userId: member1.id,
      parentId: parentComment.id,
    },
  });

  console.log('Comments seeded.');

  await prisma.activityLog.createMany({
    data: [
      { userId: admin.id, action: 'PROJECT_CREATED', metadata: { projectName: project1.name } },
      { userId: pm.id, action: 'MEMBER_ADDED', metadata: { projectName: project1.name, memberName: member1.name } },
      { userId: pm.id, action: 'MEMBER_ADDED', metadata: { projectName: project1.name, memberName: member2.name } },
      { userId: pm.id, action: 'TASK_ASSIGNED', metadata: { taskTitle: t1.title, assigneeName: member1.name } },
      { userId: pm.id, action: 'TASK_ASSIGNED', metadata: { taskTitle: t2.title, assigneeName: member1.name } },
      { userId: pm.id, action: 'TASK_ASSIGNED', metadata: { taskTitle: t3.title, assigneeName: member2.name } },
      { userId: member1.id, action: 'TASK_COMPLETED', metadata: { taskTitle: t1.title } },
      { userId: pm.id, action: 'PROJECT_CREATED', metadata: { projectName: project2.name } },
      { userId: pm.id, action: 'PROJECT_CREATED', metadata: { projectName: project3.name } },
      { userId: admin.id, action: 'PROJECT_UPDATED', metadata: { projectName: project3.name } },
    ],
  });

  console.log('Activity logs created.');

  await prisma.notification.createMany({
    data: [
      { userId: member1.id, type: 'TASK_ASSIGNED', message: 'You have been assigned: Configure Next.js State Management' },
      { userId: member2.id, type: 'TASK_ASSIGNED', message: 'You have been assigned: Implement Dark Mode Toggle' },
      { userId: admin.id, type: 'PROJECT_DEADLINE', message: 'The project Mobile App Beta Launch is approaching its deadline!' },
    ],
  });

  console.log('Notifications seeded.');
  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
