import React, { useState } from "react";

type Message = {
  senderId: string;
  text: string;
};

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

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage({ senderId: currentUserId, text: newMessage });
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md border rounded-xl shadow-lg bg-white">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.senderId === currentUserId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg text-sm max-w-xs break-words ${
                msg.senderId === currentUserId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="flex items-center p-2 border-t">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 mr-2 text-sm focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
