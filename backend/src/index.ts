// src/index.ts (or wherever your server entry is)
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import projectRoutes from "./routes/project.routes";
import bidRoutes from "./routes/bid.routes";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/auth.routes";
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();

// Ensure uploads directory exists (defensive check)
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir)); // ✅ serve uploaded files

// Test database connection
async function testDbConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server after checking database connection
async function startServer() {
  const isDbConnected = await testDbConnection();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (isDbConnected) {
      console.log(`Connected to PostgreSQL database at ${process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] || "unknown host"}`);
    } else {
      console.log("Warning: Server started but database connection failed");
    }
  });
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer().catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
