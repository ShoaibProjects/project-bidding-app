"use client";

import React, { useEffect, useState, useRef } from "react";
import ChatComponent from "../../components/ChatComponent";
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
import { ConversationList } from "@/app/components/ConversationList";

// (MODIFIED) Define the type for the data from the socket event for clarity
interface NewConversationData {
  conversation: Conversation;
  participants: string[];
}

const ChatPage: React.FC = () => {
  const { user } = useUserStore();
  const currentUserId = user?.id || "";

  // (MODIFIED) Initialize socket using the custom hook
  const socket = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const sellerId = searchParams.get("sellerId");
  
  // Ref to keep track of the current conversation room to leave it later
  const previousConversationId = useRef<string | null>(null);

  // Effect to create or get a conversation when a sellerId is present in the URL
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

  // (MODIFIED) Fetch conversations on mount and listen for new conversations in real-time
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
    
    // (MODIFIED) Use the new, type-safe method from SocketService
    const handleNewConversation = (data: NewConversationData) => {
        if (data.participants.includes(currentUserId)) {
            fetchConversations(); // Refetch list to show the new conversation
        }
    };

    SocketService.onNewConversation(handleNewConversation);

    // Cleanup the listener when the component unmounts
    return () => {
        SocketService.removeListener('new_conversation_created');
    }

  }, [currentUserId, selectedConversation]);

  // (MODIFIED) Fetch messages, manage socket rooms, and listen for new messages
  useEffect(() => {
    // Leave the previous conversation room to avoid getting messages from old chats
    if (previousConversationId.current) {
      SocketService.leaveConversation(previousConversationId.current);
    }

    if (selectedConversation) {
      // Join the new conversation room
      SocketService.joinConversation(selectedConversation.id);
      previousConversationId.current = selectedConversation.id;

      // Fetch initial message history
      getMessagesByConversationId(selectedConversation.id)
        .then((res) => {
          setMessages(res.data.messages);
        })
        .catch((err) => {
          console.error("Failed to load messages:", err);
        });
    }

    // (MODIFIED) Set up listener for receiving messages in real-time
    const handleReceiveMessage = (data: { conversationId: string; message: Message }) => {
      if (data.conversationId === selectedConversation?.id) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    };

    SocketService.onReceiveMessage(handleReceiveMessage);

    // Cleanup: remove listener and leave room when component unmounts or conversation changes
    return () => {
      SocketService.removeListener("receive_message");
      if (previousConversationId.current) {
        SocketService.leaveConversation(previousConversationId.current);
      }
    };
  }, [selectedConversation]); // This effect now correctly depends on the selected conversation

  // Handle sending a message
  const handleSendMessage = (msg: { senderId: string; text: string }) => {
    if (!selectedConversation) return;

    console.log(msg.text)
    // The message is sent via API. The backend will then save it and
    // broadcast it via socket to all participants in the room.
    // The `onReceiveMessage` listener above will catch it and update the state.
    sendMessage(selectedConversation.id, msg.senderId, msg.text)
      .catch((err) => {
        console.error("Failed to send message:", err);
        // Optionally, show a "message failed to send" UI to the user
      });
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar: List of Conversations */}
      {/* <div className="w-64 border-r overflow-auto p-4">
        <h3 className="font-semibold text-lg mb-4">Your Chats</h3>
        {conversations.length === 0 ? (
          <p className="text-gray-500">No conversations found.</p>
        ) : (
          <ul>
            {conversations.map((convo) => {
              // Determine the other user in the conversation
              const otherUser = convo.users?.find((u) => u.id !== currentUserId);
              return (
                <li
                  key={convo.id}
                  className={`p-2 mb-1 rounded cursor-pointer hover:bg-gray-100 ${
                    selectedConversation?.id === convo.id
                      ? "bg-gray-200 font-medium"
                      : ""
                  }`}
                  onClick={() => setSelectedConversation(convo)}
                >
                  {otherUser?.name || otherUser?.id || "Unknown"}
                </li>
              );
            })}
          </ul>
        )}
      </div> */}
<ConversationList
  currentUserId={currentUserId}
  conversations={conversations}
  selectedConversationId={selectedConversation?.id}
  onSelect={setSelectedConversation}
/>


      {/* Main Chat Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {selectedConversation
            ? `Chat with ${
                selectedConversation.users?.find((u) => u.id !== currentUserId)
                  ?.name || "User"
              }`
            : "No conversation selected"}
        </h2>

        {selectedConversation ? (
          <ChatComponent
            currentUserId={currentUserId}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <p className="text-gray-500">
            Select a conversation from the left panel to start chatting.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatPage;