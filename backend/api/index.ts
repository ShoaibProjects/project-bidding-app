import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { createServer } from "http";
import dotenv from "dotenv";

// Route imports
import projectRoutes from "../src//routes/project.routes";
import bidRoutes from "../src/routes/bid.routes";
import userRoutes from "../src/routes/userRoutes";
import authRoutes from "../src/routes/auth.routes";
import chatRoutes from "../src/routes/chat.routes";

// Utility imports
import { initSocket } from "../src/utils/socket";
import { scheduleDeadlineReminders } from "../src/services/cron.service";

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize Socket.IO
const io = initSocket(httpServer);

// ------------------------------------
// Middleware Setup
// ------------------------------------

// Enable CORS for frontend origins
app.use(
  cors({
    origin: [
      "https://project-bidding-app.vercel.app", // Deployed frontend
      "http://localhost:3000",                 // Local frontend dev
    ],
    credentials: true,
  })
);

// Parse incoming JSON requests
app.use(express.json());

// ------------------------------------
// Health Check Endpoint
// ------------------------------------
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "OK", message: "API is running" });
});

// ------------------------------------
// Schedule CRON jobs (e.g., deadline reminders)
// ------------------------------------
scheduleDeadlineReminders();

// ------------------------------------
// Register API Routes
// ------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// ------------------------------------
// Socket.IO Event Handlers
// ------------------------------------
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  // Join conversation room
  socket.on("join_conversation", (conversationId: string) => {
    socket.join(conversationId);
    console.log(`🟢 ${socket.id} joined ${conversationId}`);
  });

  // Leave conversation room
  socket.on("leave_conversation", (conversationId: string) => {
    socket.leave(conversationId);
    console.log(`🔴 ${socket.id} left ${conversationId}`);
  });

  // Send and broadcast message
  socket.on("send_message", async (data) => {
    try {
      const { conversationId, message } = data;
      socket.to(conversationId).emit("receive_message", { conversationId, message });
      console.log(`📨 Message sent in ${conversationId}`);
    } catch (error) {
      console.error("❌ Error handling message:", error);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  // Typing indicator
  socket.on("typing_start", (data) => {
    socket.to(data.conversationId).emit("user_typing", { ...data, isTyping: true });
  });

  socket.on("typing_stop", (data) => {
    socket.to(data.conversationId).emit("user_typing", {
      userId: data.userId,
      isTyping: false,
    });
  });

  // Mark messages as read
  socket.on("mark_messages_read", (data) => {
    socket.to(data.conversationId).emit("messages_read", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  });

  // Online status broadcast
  socket.on("user_online", (userId: string) => {
    socket.broadcast.emit("user_status_change", { userId, status: "online" });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// ------------------------------------
// Global Error Handler
// ------------------------------------
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("🔥 Global Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// ------------------------------------
// Test Database Connection
// ------------------------------------
async function testDbConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection successful");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}

testDbConnection();

// ------------------------------------
// Local Development Server
// ------------------------------------
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("📡 Socket.IO server ready");
});


// ------------------------------------
// Export for Serverless / Vercel
// ------------------------------------
export { httpServer, io };
export default app;
