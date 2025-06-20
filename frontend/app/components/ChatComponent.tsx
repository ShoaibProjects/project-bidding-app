import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare } from "lucide-react";

// Assuming Message type is defined globally or imported from a types file
// type Message = {
//   senderId: string;
//   text: string;
//   timestamp?: number; // Added optional timestamp for display
// };

// Mock Message Type for compilation purposes only if not imported
interface Message {
    senderId: string;
    text: string;
    timestamp?: number;
}


type ChatComponentProps = {
  currentUserId: string;
  messages: Message[];
  onSendMessage: (msg: Message) => void;
};

const ChatComponent: React.FC<ChatComponentProps> = ({
  currentUserId,
  messages,
  onSendMessage,
}) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage({ senderId: currentUserId, text: newMessage, timestamp: Date.now() });
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { // Allow Shift+Enter for new line
      e.preventDefault(); // Prevent default Enter key behavior (e.g., new line in textarea)
      handleSend();
    }
  };

  return (
    // Removed fixed height and width to allow parent to control sizing.
    // Updated background and border colors for dark mode.
    <div className="flex flex-col h-full w-full rounded-lg shadow-inner bg-gray-800 text-gray-100">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-700 bg-gray-900 rounded-t-lg">
        <MessageSquare className="w-6 h-6 text-purple-400" /> {/* Updated icon color */}
        <h3 className="font-semibold text-xl">Chat</h3>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-700"> {/* Darker background for message area */}
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index} // Consider a more stable key if possible (e.g., message.id)
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${
                msg.senderId === currentUserId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-xl text-sm max-w-[70%] break-words shadow-md
                  ${
                    msg.senderId === currentUserId
                      ? "bg-purple-600 text-white rounded-br-none" // Sender's messages (purple)
                      : "bg-gray-600 text-gray-100 rounded-bl-none" // Other user's messages (dark gray)
                  }`}
              >
                <p>{msg.text}</p>
                {msg.timestamp && (
                    <span className="block text-xs text-right opacity-75 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} /> {/* For auto-scrolling */}
      </div>

      {/* Input area */}
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
