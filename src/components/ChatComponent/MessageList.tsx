// src/components/ChatComponent/MessageList.tsx
import { cn } from "@/lib/utils";
import { Message } from "@/lib/types";
import { Loader2 } from "lucide-react";
import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  isLoading: boolean;
  messages: Message[];
};

const MessageList: React.FC<Props> = ({ messages, isLoading }) => {
  const bottomRef = useRef<HTMLDivElement | null>(null); // 创建引用

  useEffect(() => {
    // 每次 messages 变化时，滚动到底部
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '100%' }}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn("flex", {
            "justify-end": message.role === "user",
            "justify-start": message.role === "assistant",
          })}
        >
          <div
            className={cn(
              "rounded-lg px-3 py-2 max-w-full",
              {
                "bg-blue-600 text-white": message.role === "user",
                "bg-gray-200 text-black": message.role === "assistant",
              }
            )}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
            >
              {message.content}
            </ReactMarkdown>

            {/* 未完成的消息显示加载指示器 */}
            {message.role === "assistant" && !message.isComplete && (
              <Loader2 className="w-4 h-4 inline-block ml-2 animate-spin" />
            )}
          </div>
        </div>
      ))}

      {/* 底部引用元素 */}
      <div ref={bottomRef} />
      
      {/* 全局加载指示器 */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="flex items-center p-2 bg-gray-200 text-black rounded-lg">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            正在回复...
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
