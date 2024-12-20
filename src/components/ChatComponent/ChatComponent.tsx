// src/components/ChatComponent/ChatComponent.tsx
"use client";

import React from "react";
import MessageList from "./MessageList";
import { Message } from "@/lib/types";

type ChatComponentProps = {
  chat: {
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    isConnected: boolean;
    sendMessage: (message: string) => void;
  };
};

const ChatComponent: React.FC<ChatComponentProps> = ({ chat }) => {
  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div className="flex-1 overflow-auto p-4">
        <MessageList messages={chat.messages} isLoading={chat.isLoading} />
      </div>

      {/* 输入框 */}
      <form onSubmit={chat.handleSubmit} className="p-4 border-t">
        <input
          type="text"
          value={chat.input}
          onChange={chat.handleInputChange}
          placeholder="输入您的消息..."
          className="w-full p-2 border rounded"
          disabled={!chat.isConnected}
        />
      </form>

      {/* 错误信息 */}
      {chat.error && <div className="p-4 text-red-500">{chat.error}</div>}
    </div>
  );
};

export default ChatComponent;
