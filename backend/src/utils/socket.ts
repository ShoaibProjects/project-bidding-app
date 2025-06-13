// src/utils/socket.ts
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let ioInstance: SocketIOServer | null = null;

export const initSocket = (server: HTTPServer) => {
  if (!ioInstance) {
    ioInstance = new SocketIOServer(server, {
      cors: {
        origin: [
          'https://project-bidding-app.vercel.app',
          'http://localhost:3000'
        ],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    console.log('✅ Socket.IO initialized');
  }
  return ioInstance;
};

export const getIO = (): SocketIOServer => {
  if (!ioInstance) {
    throw new Error('Socket.IO not initialized. Call initSocket(server) first.');
  }
  return ioInstance;
};
