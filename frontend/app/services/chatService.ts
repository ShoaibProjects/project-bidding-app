import API from "./api"; // Axios instance with base URL and interceptors
import { Conversation, Message } from "../types"; // Define these types as needed

/**
 * Creates or fetches a one-to-one conversation between two users.
 * @param senderId - ID of the sender user
 * @param receiverId - ID of the receiver user
 * @returns Promise resolving to the conversation and a flag if it was newly created
 */
export const getOrCreateConversation = (senderId: string, receiverId: string) =>
  API.post<{ conversation: Conversation; isNew: boolean }>("/api/chat/conversation", {
    senderId,
    receiverId,
  });

/**
 * Sends a message in a conversation.
 * @param conversationId - ID of the conversation
 * @param senderId - ID of the sender user
 * @param text - Message text to send
 * @returns Promise resolving to the created message
 */
export const sendMessage = (
  conversationId: string,
  senderId: string,
  text: string
) =>
  API.post<{ message: Message }>("/api/chat/message", {
    conversationId,
    senderId,
    text,
  });

/**
 * Fetches all messages for a given conversation.
 * @param conversationId - ID of the conversation
 * @returns Promise resolving to an array of messages
 */
export const getMessagesByConversationId = (conversationId: string) =>
  API.get<{ messages: Message[] }>(`/api/chat/messages/${conversationId}`);

/**
 * Fetches all conversations for a given user.
 * @param userId - ID of the user
 * @returns Promise resolving to an array of conversations
 */
export const getConversationsByUserId = (userId: string) =>
  API.get<{ conversations: Conversation[] }>(`/api/chat/conversations/${userId}`);
