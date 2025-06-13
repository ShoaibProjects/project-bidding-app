import React from "react";
import { Conversation } from "../types";

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
    <div className="w-64 border-r overflow-auto p-4">
      <h3 className="font-semibold text-lg mb-4">Your Chats</h3>
      {conversations.length === 0 ? (
        <p className="text-gray-500">No conversations found.</p>
      ) : (
        <ul>
          {conversations.map((convo) => {
            const otherUser =
              convo.users?.find((u) => u.id !== currentUserId);

            return (
              <li
                key={convo.id}
                className={`p-2 mb-1 rounded cursor-pointer hover:bg-gray-100 ${
                  selectedConversationId === convo.id
                    ? "bg-gray-200 font-medium"
                    : ""
                }`}
                onClick={() => onSelect(convo)}
              >
                {otherUser?.name || otherUser?.id || convo.otherUser?.email || "Unknown"}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
