import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { getIO } from "../utils/socket"; 

/**
 * Creates or fetches a one-to-one conversation between two users.
 * Expects `senderId` and `receiverId` in req.body.
 */
export const getOrCreateConversation = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId } = req.body;
    
    if (senderId === receiverId) {
      return res.status(400).json({ error: "Cannot create chat with self" });
    }

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { AND: [{ senderId }, { receiverId }] },
          { AND: [{ senderId: receiverId }, { receiverId: senderId }] },
        ],
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true }
        },
        receiver: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (existingConversation) {
      return res.json({ conversation: existingConversation, isNew: false });
    }

    const newConversation = await prisma.conversation.create({
      data: {
        senderId,
        receiverId,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true }
        },
        receiver: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Emit to both users that a new conversation was created
    getIO().emit('new_conversation_created', {
      conversation: newConversation,
      participants: [senderId, receiverId]
    });

    res.status(201).json({ conversation: newConversation, isNew: true });
  } catch (error) {
    console.error("Error creating/getting conversation:", error);
    res.status(500).json({ error: "Failed to create or get conversation" });
  }
};

/**
 * Sends a message in a conversation with real-time broadcasting.
 * Expects `conversationId`, `senderId`, and `text` in req.body.
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, senderId, text } = req.body;

    // Validate conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } }
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Validate sender is part of the conversation
    if (conversation.senderId !== senderId && conversation.receiverId !== senderId) {
      return res.status(403).json({ error: "Unauthorized to send message in this conversation" });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        text,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Update conversation's lastMessage and lastUpdated
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { 
        lastMessage: text,
        lastUpdated: new Date() 
      }
    });

    // Real-time broadcast to conversation room
    getIO().to(conversationId).emit('receive_message', {
      conversationId,
      message: {
        id: message.id,
        text: message.text,
        senderId: message.senderId,
        receiverId: conversation.senderId === senderId ? conversation.receiverId : conversation.senderId,
        timestamp: message.createdAt.toISOString(),
        sender: message.sender
      }
    });

    // Also emit to participants who might not be in the room yet
    const receiverId = conversation.senderId === senderId ? conversation.receiverId : conversation.senderId;
    getIO().emit('new_message_notification', {
      conversationId,
      receiverId,
      message: {
        id: message.id,
        text: message.text,
        senderId: message.senderId,
        sender: message.sender,
        timestamp: message.createdAt.toISOString()
      }
    });

    res.status(201).json({ 
      message: {
        ...message,
        timestamp: message.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

/**
 * Fetches all messages for a given conversation.
 * Expects `conversationId` in URL params.
 */
export const getMessagesByConversationId = async (
  req: Request,
  res: Response
) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Validate conversation exists and user has access
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: Number(limit),
      skip: skip,
      include: {
        sender: {
          select: { id: true, name: true, email: true }
        }
      },
    });

    // Reverse to get chronological order (oldest first)
    const reversedMessages = messages.reverse();

    // Get total count for pagination
    const totalMessages = await prisma.message.count({
      where: { conversationId }
    });

    res.json({ 
      messages: reversedMessages.map(msg => ({
        ...msg,
        timestamp: msg.createdAt.toISOString()
      })),
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalMessages / Number(limit)),
        totalMessages,
        hasMore: skip + messages.length < totalMessages
      }
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

/**
 * Fetches all conversations for a given user with real-time status.
 * Expects `userId` in URL params.
 */
export const getConversationsByUserId = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.params;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: {
        lastUpdated: "desc",
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true }
        },
        receiver: {
          select: { id: true, name: true, email: true }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: { id: true, name: true }
            }
          }
        },
        _count: {
          select: { messages: true }
        }
      },
    });

    // Format conversations for frontend
    const formattedConversations = conversations.map(conv => {
      const otherUser = conv.senderId === userId ? conv.receiver : conv.sender;
      const lastMessage = conv.messages[0] || null;
      
      return {
        id: conv.id,
        otherUser,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          text: lastMessage.text,
          senderId: lastMessage.senderId,
          timestamp: lastMessage.createdAt.toISOString(),
          sender: lastMessage.sender
        } : null,
        messageCount: conv._count.messages,
        lastUpdated: conv.lastUpdated.toISOString(),
        createdAt: conv.createdAt.toISOString()
      };
    });

    res.json({ conversations: formattedConversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

/**
 * Mark messages as read in a conversation
 * Expects `conversationId` and `userId` in req.body
 */
export const markMessagesAsRead = async (req: Request, res: Response) => {
  try {
    const { conversationId, userId } = req.body;

    // Validate conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Update unread messages to read
    const updatedMessages = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId }, // Only mark messages from others as read
        seen: false
      },
      data: {
        seen: true
      }
    });

    // Emit read status to the conversation
    getIO().to(conversationId).emit('messages_read', {
      conversationId,
      readByUserId: userId,
      timestamp: new Date().toISOString(),
      messagesMarked: updatedMessages.count
    });

    res.json({ 
      success: true, 
      messagesMarked: updatedMessages.count 
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
};

/**
 * Get unread message count for a user
 * Expects `userId` in URL params
 */
export const getUnreadMessageCount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const unreadCount = await prisma.message.count({
      where: {
        conversation: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        senderId: { not: userId }, // Only count messages from others
        seen: false
      }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ error: "Failed to get unread count" });
  }
};