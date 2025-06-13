import express, { RequestHandler } from "express";
import {
  getOrCreateConversation,
  sendMessage,
  getMessagesByConversationId,
  getConversationsByUserId,
  markMessagesAsRead,
  getUnreadMessageCount,
} from "../controllers/chat.controller";
import { requireAuth } from "../middleware/jwt.middleware";

const router = express.Router();

// Create or get existing conversation between two users
router.post("/conversation", requireAuth as RequestHandler, getOrCreateConversation as RequestHandler);

// Send a message in a conversation
router.post("/message", requireAuth as RequestHandler, sendMessage as RequestHandler);

// Get messages for a specific conversation with pagination
router.get("/messages/:conversationId", requireAuth as RequestHandler, getMessagesByConversationId as RequestHandler);

// Get all conversations for a user
router.get("/conversations/:userId", requireAuth as RequestHandler, getConversationsByUserId as RequestHandler);

// Mark messages as read in a conversation
router.put("/messages/read", requireAuth as RequestHandler, markMessagesAsRead as RequestHandler);

// Get unread message count for a user
router.get("/unread/:userId", requireAuth as RequestHandler, getUnreadMessageCount as RequestHandler);

export default router;