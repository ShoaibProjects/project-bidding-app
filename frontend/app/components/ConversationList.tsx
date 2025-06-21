import React from "react";
import { Conversation } from "../types"; // Assuming correct path for Conversation type
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, User, AlertCircle } from "lucide-react";

/**
 * Props for the ConversationList component
 * @property {string} currentUserId - ID of the currently logged-in user
 * @property {Conversation[]} conversations - Array of conversation objects
 * @property {string} [selectedConversationId] - ID of the currently selected conversation
 * @property {(convo: Conversation) => void} onSelect - Callback when a conversation is selected
 */
type ConversationListProps = {
  currentUserId: string;
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelect: (convo: Conversation) => void;
};

/**
 * ConversationList component displays a list of chat conversations.
 * It shows the user's chats with animation effects and allows selecting a conversation.
 * @param {ConversationListProps} props - Component props
 * @returns {React.ReactElement} A list of conversations with interactive elements
 */
export const ConversationList: React.FC<ConversationListProps> = ({
  currentUserId,
  conversations,
  selectedConversationId,
  onSelect,
}) => {
  return (
    // Main container with styling for dark mode
    // Removed fixed width (w-64) as parent sidebar handles it
    <div className="flex-1 overflow-auto p-4 bg-gray-800 text-gray-100">
      {/* Header section with icon and title */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-lg">Your Chats</h3>
      </div>

      {/* Animation wrapper for the list */}
      <AnimatePresence>
        {/* Conditional rendering based on whether there are conversations */}
        {conversations.length === 0 ? (
          // Empty state with animation
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-gray-400"
          >
            <AlertCircle className="w-4 h-4 text-purple-300" />
            <p>No conversations found.</p>
          </motion.div>
        ) : (
          // List of conversations
          <ul className="space-y-1">
            {conversations.map((convo) => {
              // Find the other user in the conversation (not the current user)
              const otherUser = convo.users?.find((u) => u.id !== currentUserId);

              return (
                // Animated list item for each conversation
                <motion.li
                  key={convo.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-colors duration-200
                    ${
                      selectedConversationId === convo.id
                        ? "bg-purple-700 bg-opacity-30 text-white shadow-md" // Highlight selected conversation
                        : "hover:bg-gray-700" // Hover state for unselected conversations
                    }`}
                  onClick={() => onSelect(convo)}
                >
                  {/* User icon */}
                  <User className="w-5 h-5 text-purple-300" />
                  {/* Display name of the other user in the conversation */}
                  <span className="truncate text-gray-100">
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