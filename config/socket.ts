import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;

export function initSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: '*', // Allow connections from frontend
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO]: Client connected: ${socket.id}`);

    // Allow clients to join their user-specific notification channel
    socket.on('join_user', (userId: string) => {
      socket.join(userId);
      console.log(`[Socket.IO]: User ${userId} joined room`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO]: Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO is not initialized!');
  }
  return io;
}

export function sendNotificationToUser(userId: string, notification: any) {
  try {
    if (io) {
      io.to(userId).emit('notification_received', notification);
      console.log(`[Socket.IO]: Realtime notification sent to user ${userId}`);
    }
  } catch (error) {
    console.error('[Socket.IO] Error dispatching event:', error);
  }
}
