// src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import dotenv from 'dotenv';

import projectRoutes from '../src/routes/project.routes';
import bidRoutes from '../src/routes/bid.routes';
import userRoutes from '../src/routes/userRoutes';
import authRoutes from '../src/routes/auth.routes';
import chatRoutes from '../src/routes/chat.routes';

import { initSocket, getIO } from '../src/utils/socket';
import { scheduleDeadlineReminders } from '../src/services/cron.service';

// Load environment variables from .env file
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const httpServer = createServer(app);

// Initialize singleton Socket.IO instance
const io = initSocket(httpServer);

// ------------------------------
// Middleware setup
app.use(cors({
  origin: ['https://project-bidding-app.vercel.app', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
// Simple health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

scheduleDeadlineReminders();

// Register API route handlers
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// Socket.IO handlers
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join_conversation', (conversationId: string) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId: string) => {
    socket.leave(conversationId);
    console.log(`User ${socket.id} left conversation ${conversationId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { conversationId, message } = data;
      socket.to(conversationId).emit('receive_message', { conversationId, message });
      console.log(`Message sent in conversation ${conversationId}`);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  socket.on('typing_start', (data) => {
    socket.to(data.conversationId).emit('user_typing', { ...data, isTyping: true });
  });

  socket.on('typing_stop', (data) => {
    socket.to(data.conversationId).emit('user_typing', { userId: data.userId, isTyping: false });
  });

  socket.on('mark_messages_read', (data) => {
    socket.to(data.conversationId).emit('messages_read', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('user_online', (userId: string) => {
    socket.broadcast.emit('user_status_change', { userId, status: 'online' });
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Global error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// DB connection test
async function testDbConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testDbConnection();

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO server ready`);
  });
}

// Export for Vercel and external use
export { httpServer, io };
export default app;
