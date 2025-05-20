import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import projectRoutes from '../src/routes/project.routes';
import bidRoutes from '../src/routes/bid.routes';
import userRoutes from '../src/routes/userRoutes';
import authRoutes from '../src/routes/auth.routes';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Create uploads directory if it doesn't exist
// const __dirname = path.resolve();
const uploadsDir = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (error) {
  console.error('Error creating uploads directory:', error);
}

// Middleware setup
app.use(cors({
  origin:  
    ['https://project-bidding-app.vercel.app' 
    ,'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());


if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(uploadsDir));
}

// Test database connection
async function testDbConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Simple health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

// Register API route handlers
// app.use('/api/auth', authRoutes);/
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/users', userRoutes);

// Global error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Test the DB connection on startup
testDbConnection().catch(error => {
  console.error('Failed to test database connection:', error);
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express API for Vercel
export default app;