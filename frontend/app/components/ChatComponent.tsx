import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare } from "lucide-react";

/**
 * Interface defining the structure of a message
 * @property {string} senderId - ID of the message sender
 * @property {string} text - Content of the message
 * @property {number} [timestamp] - Optional timestamp of when the message was sent
 */
interface Message {
    senderId: string;
    text: string;
    timestamp?: number;
}

/**
 * Props for the ChatComponent
 * @property {string} currentUserId - ID of the currently logged-in user
 * @property {Message[]} messages - Array of message objects to display
 * @property {(msg: Message) => void} onSendMessage - Callback when a new message is sent
 */
type ChatComponentProps = {
  currentUserId: string;
  messages: Message[];
  onSendMessage: (msg: Message) => void;
};

/**
 * ChatComponent renders a chat interface with messages and input field
 * Features include:
 * - Displaying messages with sender distinction
 * - Auto-scrolling to new messages
 * - Message input with send button and keyboard support
 * - Animated message appearance
 */
const ChatComponent: React.FC<ChatComponentProps> = ({
  currentUserId,
  messages,
  onSendMessage,
}) => {
  // State for the new message input
  const [newMessage, setNewMessage] = useState<string>("");
  
  // Ref for auto-scrolling to the bottom of the chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Handles sending a new message
   * - Validates the message isn't empty
   * - Calls the onSendMessage callback with the new message
   * - Clears the input field
   */
  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage({ 
        senderId: currentUserId, 
        text: newMessage, 
        timestamp: Date.now() 
      });
      setNewMessage("");
    }
  };

  /**
   * Handles key press events in the input field
   * @param {React.KeyboardEvent<HTMLInputElement>} e - Keyboard event
   * - Sends message on Enter key (without Shift)
   * - Allows Shift+Enter for new lines
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    // Main chat container with dark mode styling
    <div className="flex flex-col h-full w-full rounded-lg shadow-inner bg-gray-800 text-gray-100">
      {/* Chat header section */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-700 bg-gray-900 rounded-t-lg">
        <MessageSquare className="w-6 h-6 text-purple-400" />
        <h3 className="font-semibold text-xl">Chat</h3>
      </div>

      {/* Messages display area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-700">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index} // Note: Consider using a more stable key if available
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${
                msg.senderId === currentUserId ? "justify-end" : "justify-start"
              }`}
            >
              {/* Individual message bubble */}
              <div
                className={`px-4 py-2 rounded-xl text-sm max-w-[70%] break-words shadow-md
                  ${
                    msg.senderId === currentUserId
                      ? "bg-purple-600 text-white rounded-br-none" // Current user's messages
                      : "bg-gray-600 text-gray-100 rounded-bl-none" // Other user's messages
                  }`}
              >
                <p>{msg.text}</p>
                {/* Message timestamp if available */}
                {msg.timestamp && (
                    <span className="block text-xs text-right opacity-75 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                    </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {/* Invisible element for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input area */}
      <div className="flex items-center p-4 border-t border-gray-700 bg-gray-900 rounded-b-lg">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 border border-gray-600 rounded-full px-4 py-2 mr-3 text-sm
                     bg-gray-700 text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        />
        {/* Send button with hover/tap animations */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSend}
          className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default ChatComponent;