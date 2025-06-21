"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, User, AlertCircle, ArrowLeft } from "lucide-react";

import ChatComponent from "../../components/ChatComponent";
import { ConversationList } from "@/app/components/ConversationList";
import {
  getMessagesByConversationId,
  sendMessage,
  getConversationsByUserId,
  getOrCreateConversation,
} from "../../services/chatService";
import { Conversation, Message } from "@/app/types";
import { useUserStore } from "@/store/userStore";
import { useSearchParams } from "next/navigation";
import SocketService from "@/app/utils/socket";

// Interface for new conversation data structure
interface NewConversationData {
  conversation: Conversation;
  participants: string[];
}

/**
 * ChatPage Component - Main chat interface for the application
 * Handles:
 * - Conversation listing
 * - Message display and sending
 * - Real-time updates via WebSocket
 * - Responsive sidebar behavior
 */
const ChatPage: React.FC = () => {
  // Get current user from global state
  const { user } = useUserStore();
  const currentUserId = user?.id || "";

  // State management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Get URL search parameters for direct conversation access
  const searchParams = useSearchParams();
  const sellerId = searchParams.get("sellerId");
  
  // Ref to track previous conversation ID for socket cleanup
  const previousConversationId = useRef<string | null>(null);

  // Effect: Handle direct conversation access via URL parameter
  useEffect(() => {
    if (sellerId && currentUserId) {
      getOrCreateConversation(currentUserId, sellerId)
        .then((res) => {
          setSelectedConversation(res.data.conversation);
        })
        .catch((err) => {
          console.error("Failed to create or get conversation:", err);
        });
    }
  }, [sellerId, currentUserId]);

  // Effect: Fetch conversations and setup socket listeners
  useEffect(() => {
    if (!currentUserId) return;

    const fetchConversations = () => {
      getConversationsByUserId(currentUserId)
        .then((res) => {
          const convos = res.data.conversations;
          setConversations(convos);
          // Auto-select first conversation if none selected
          if (convos.length > 0 && !selectedConversation) {
            setSelectedConversation(convos[0]);
          }
        })
        .catch((err) => {
          console.error("Failed to load conversations:", err);
        });
    };

    fetchConversations();

    // Socket handler for new conversation events
    const handleNewConversation = (data: NewConversationData) => {
      if (data.participants.includes(currentUserId)) {
        fetchConversations(); // Refresh conversation list
      }
    };

    SocketService.onNewConversation(handleNewConversation);

    // Cleanup: Remove socket listener
    return () => {
      SocketService.removeListener("new_conversation_created");
    };
  }, [currentUserId, selectedConversation]);

  // Effect: Handle conversation selection and message loading
  useEffect(() => {
    // Leave previous conversation room
    if (previousConversationId.current) {
      SocketService.leaveConversation(previousConversationId.current);
    }

    if (selectedConversation) {
      // Join new conversation room
      SocketService.joinConversation(selectedConversation.id);
      previousConversationId.current = selectedConversation.id;

      // Load messages for selected conversation
      getMessagesByConversationId(selectedConversation.id)
        .then((res) => {
          setMessages(res.data.messages);
        })
        .catch((err) => {
          console.error("Failed to load messages:", err);
        });
    }

    // Socket handler for incoming messages
    const handleReceiveMessage = (data: { conversationId: string; message: Message }) => {
      if (data.conversationId === selectedConversation?.id) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    };

    SocketService.onReceiveMessage(handleReceiveMessage);

    // Cleanup: Remove socket listener and leave conversation
    return () => {
      SocketService.removeListener("receive_message");
      if (previousConversationId.current) {
        SocketService.leaveConversation(previousConversationId.current);
      }
    };
  }, [selectedConversation]);

  /**
   * Handles sending a new message
   * @param msg - Object containing senderId and message text
   */
  const handleSendMessage = (msg: { senderId: string; text: string }) => {
    if (!selectedConversation) return;

    sendMessage(selectedConversation.id, msg.senderId, msg.text).catch((err) => {
      console.error("Failed to send message:", err);
    });
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-inter antialiased overflow-hidden">
      {/* --- Sidebar: List of Conversations --- */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen ? 0 : "-100%" }}
        transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
        className={`fixed inset-y-0 left-0 w-full bg-gray-800 shadow-xl border-r border-gray-700 z-30 flex flex-col
                   sm:w-80 
                   lg:static lg:translate-x-0 lg:flex-shrink-0 ${
                   isSidebarOpen && "lg:block" 
                   }`}
      >
        {/* Sidebar header */}
        <div className="p-4 md:p-6 border-b border-gray-700 flex items-center justify-between bg-gray-900 flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-3">
            <MessageSquare className="w-6 h-6 md:w-7 md:h-7 text-purple-400" />
            Chats
          </h2>
          {/* Close sidebar button (mobile only) */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Close sidebar"
          >
            <ArrowLeft className="w-6 h-6 text-gray-300" />
          </button>
        </div>
        
        {/* Conversation list */}
        <div className="overflow-y-auto flex-1 pb-4">
          <ConversationList
            currentUserId={currentUserId}
            conversations={conversations}
            selectedConversationId={selectedConversation?.id}
            onSelect={(conversation) => {
              setSelectedConversation(conversation);
              // Auto-close sidebar on mobile when selecting a conversation
              if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
              }
            }}
          />
        </div>
      </motion.div>
      
      {/* Mobile sidebar backdrop (click to close) */}
      <AnimatePresence>
        {isSidebarOpen && (
           <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-20"
            />
        )}
      </AnimatePresence>

      {/* --- Main Chat Area --- */}
      <div className="flex-1 flex flex-col bg-gray-800 md:rounded-lg shadow-2xl md:m-4 overflow-hidden relative">
        {/* Open sidebar button (mobile only, when sidebar is closed) */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 p-3 rounded-full bg-purple-600 text-white shadow-lg lg:hidden z-10
                       hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Open sidebar"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        )}
        
        {/* Chat header */}
        <div className="p-4 md:p-6 border-b border-gray-700 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Back button (mobile only) */}
            {selectedConversation && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedConversation(null)}
                className="lg:hidden p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </motion.button>
            )}
            {/* Chat title */}
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
              {selectedConversation ? (
                <>
                  <User className="w-6 h-6 text-purple-300" />
                  {selectedConversation.users?.find((u) => u.id !== currentUserId)?.name || "User"}
                </>
              ) : (
                <>
                  <MessageSquare className="w-6 h-6 text-purple-300" />
                  Select a Chat
                </>
              )}
            </h2>
          </div>
        </div>

        {/* Main chat content area */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-700">
          <AnimatePresence mode="wait">
            {selectedConversation ? (
              // Chat interface for selected conversation
              <motion.div
                key={selectedConversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col"
              >
                <ChatComponent
                  currentUserId={currentUserId}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                />
              </motion.div>
            ) : (
              // Empty state when no conversation is selected
              <motion.div
                key="no-conversation"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center h-full text-gray-300 bg-gray-800 md:rounded-lg p-4 md:p-8 shadow-inner"
              >
                <AlertCircle className="w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6 text-purple-500" />
                <p className="text-lg md:text-xl font-semibold text-center leading-relaxed">
                  Welcome to your chat!
                  <br />
                  Select a conversation to start messaging.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;