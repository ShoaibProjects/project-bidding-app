import React from "react";
import { Conversation } from "../types"; // Assuming correct path for Conversation type
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, User, AlertCircle } from "lucide-react";

type ConversationListProps = {
  currentUserId: string;
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelect: (convo: Conversation) => void;
};

export const ConversationList: React.FC<ConversationListProps> = ({
  currentUserId,
  conversations,
  selectedConversationId,
  onSelect,
}) => {
  return (
    // Removed fixed width (w-64) as parent sidebar handles it.
    // Updated background and border colors for dark mode.
    <div className="flex-1 overflow-auto p-4 bg-gray-800 text-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-purple-400" /> {/* Updated icon color */}
        <h3 className="font-semibold text-lg">Your Chats</h3>
      </div>
      <AnimatePresence>
        {conversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-gray-400" // Adjusted text color
          >
            <AlertCircle className="w-4 h-4 text-purple-300" /> {/* Updated icon color */}
            <p>No conversations found.</p>
          </motion.div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((convo) => {
              const otherUser = convo.users?.find((u) => u.id !== currentUserId);

              return (
                <motion.li
                  key={convo.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-colors duration-200
                    ${
                      selectedConversationId === convo.id
                        ? "bg-purple-700 bg-opacity-30 text-white shadow-md" // Highlight selected
                        : "hover:bg-gray-700" // Dark mode hover
                    }`}
                  onClick={() => onSelect(convo)}
                >
                  <User className="w-5 h-5 text-purple-300" /> {/* Updated icon color */}
                  <span className="truncate text-gray-100"> {/* Ensured text is light */}
                    {otherUser?.name || otherUser?.id || convo.otherUser?.email || "Unknown User"}
                  </span>
                </motion.li>
              );
            })}
          </ul>
        )}
      </AnimatePresence>
    </div>
  );
};
