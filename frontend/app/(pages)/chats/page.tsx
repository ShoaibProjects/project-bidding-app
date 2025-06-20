"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, User, AlertCircle, ArrowLeft, Send } from "lucide-react";

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
import { useRouter, useSearchParams } from "next/navigation";
import { useSocket } from "../../hooks/useSocket";
import SocketService from "@/app/utils/socket";


interface NewConversationData {
  conversation: Conversation;
  participants: string[];
}

const ChatPage: React.FC = () => {
  const { user } = useUserStore();
  const currentUserId = user?.id || "";

  const socket = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const sellerId = searchParams.get("sellerId");
  const previousConversationId = useRef<string | null>(null);

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

  useEffect(() => {
    if (!currentUserId) return;

    const fetchConversations = () => {
      getConversationsByUserId(currentUserId)
        .then((res) => {
          const convos = res.data.conversations;
          setConversations(convos);
          if (convos.length > 0 && !selectedConversation) {
            setSelectedConversation(convos[0]);
          }
        })
        .catch((err) => {
          console.error("Failed to load conversations:", err);
        });
    };

    fetchConversations();

    const handleNewConversation = (data: NewConversationData) => {
      if (data.participants.includes(currentUserId)) {
        fetchConversations();
      }
    };

    SocketService.onNewConversation(handleNewConversation);

    return () => {
      SocketService.removeListener("new_conversation_created");
    };
  }, [currentUserId, selectedConversation]);

  useEffect(() => {
    if (previousConversationId.current) {
      SocketService.leaveConversation(previousConversationId.current);
    }

    if (selectedConversation) {
      SocketService.joinConversation(selectedConversation.id);
      previousConversationId.current = selectedConversation.id;

      getMessagesByConversationId(selectedConversation.id)
        .then((res) => {
          setMessages(res.data.messages);
        })
        .catch((err) => {
          console.error("Failed to load messages:", err);
        });
    }

    const handleReceiveMessage = (data: { conversationId: string; message: Message }) => {
      if (data.conversationId === selectedConversation?.id) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    };

    SocketService.onReceiveMessage(handleReceiveMessage);

    return () => {
      SocketService.removeListener("receive_message");
      if (previousConversationId.current) {
        SocketService.leaveConversation(previousConversationId.current);
      }
    };
  }, [selectedConversation]);

  const handleSendMessage = (msg: { senderId: string; text: string }) => {
    if (!selectedConversation) return;

    sendMessage(selectedConversation.id, msg.senderId, msg.text).catch((err) => {
      console.error("Failed to send message:", err);
    });
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-inter antialiased">
      {/* Sidebar: List of Conversations */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        transition={{ type: "tween", duration: 0.3 }}
        className={`fixed inset-y-0 left-0 w-80 bg-gray-800 shadow-xl border-r border-gray-700 z-30
                    lg:static lg:translate-x-0 lg:w-80 lg:flex-shrink-0 lg:block ${
                      isSidebarOpen ? "block" : "hidden"
                    }`}
      >
        <div className="p-6 border-b border-gray-700 flex items-center justify-between bg-gray-900">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-purple-400" />
            Chats
          </h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Close sidebar"
          >
            <ArrowLeft className="w-6 h-6 text-gray-300" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 pb-4">
          <ConversationList
            currentUserId={currentUserId}
            conversations={conversations}
            selectedConversationId={selectedConversation?.id}
            onSelect={(conversation) => {
              setSelectedConversation(conversation);
              if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
              }
            }}
          />
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-800 rounded-lg shadow-2xl m-4 overflow-hidden relative">
        {!selectedConversation && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 p-3 rounded-full bg-purple-600 text-white shadow-lg lg:hidden z-40
                       hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Open sidebar"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        )}
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            {selectedConversation && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedConversation(null)}
                className="lg:hidden p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </motion.button>
            )}
            <h2 className="text-2xl font-bold flex items-center gap-3">
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

        <div className="flex-1 p-6 overflow-y-auto bg-gray-700">
          <AnimatePresence mode="wait">
            {selectedConversation ? (
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
              <motion.div
                key="no-conversation"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center h-full text-gray-300 bg-gray-800 rounded-lg p-8 shadow-inner"
              >
                <AlertCircle className="w-16 h-16 mb-6 text-purple-500" />
                <p className="text-xl font-semibold text-center leading-relaxed">
                  Welcome to your chat!
                  <br />
                  Select a conversation from the left to start messaging.
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