// src/hooks/useChat.ts
import { useState, useEffect, useCallback } from "react";
import { Message } from "@/lib/types";
import { useWebSocketContext } from "@/context/WebSocketContext";

type UseChatProps = {
  chatId: number;
};

export const useChat = ({ chatId }: UseChatProps) => {
  const { isConnected, sendMessage, registerMessageHandler, error: wsError } = useWebSocketContext();
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>(() => {
    // 从 localStorage 中读取消息
    if (typeof window !== "undefined") {
      const storedMessages = localStorage.getItem(`chat_messages_${chatId}`);
      return storedMessages ? JSON.parse(storedMessages) : [];
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 处理来自 WebSocket 的 AI 消息
  const handleAssistantMessage = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (
        parsed.header &&
        parsed.payload &&
        parsed.payload.choices &&
        Array.isArray(parsed.payload.choices.text)
      ) {
        parsed.payload.choices.text.forEach((textItem: any) => {
          if (textItem.role === "assistant" && textItem.content) {
            const isComplete = parsed.payload.choices.status === 2; // 完整消息标识

            if (isComplete) {
              // 完整的 AI 回复，追加到消息列表
              setMessages((prev) => {
                const updatedMessages = [...prev];
                // 确保有至少一条消息存在
                if (updatedMessages.length > 0) {
                  updatedMessages[updatedMessages.length - 1].content += textItem.content;
                  updatedMessages[updatedMessages.length - 1].isComplete = true;
                } else {
                  updatedMessages.push({
                    id: Date.now(),
                    role: "assistant",
                    content: textItem.content,
                    isComplete: true,
                  });
                }
                return updatedMessages;
              });
              setIsLoading(false);
            } else {
              // 部分 AI 回复，实时更新最后一条未完成的 AI 消息
              setMessages((prev) => {
                if (prev.length > 0) {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage.role === "assistant" && !lastMessage.isComplete) {
                    const updatedMessages = [...prev];
                    updatedMessages[updatedMessages.length - 1].content += textItem.content;
                    return updatedMessages;
                  }
                }
                // 否则，添加新的部分消息
                return [...prev, { id: Date.now(), role: "assistant", content: textItem.content, isComplete: false }];
              });
            }
          }
        });
      }
    } catch (err) {
      console.error("Error parsing AI message:", err);
      setError("收到无效的 AI 回复");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // 注册 AI 消息处理回调
    registerMessageHandler(handleAssistantMessage);
  }, [registerMessageHandler, handleAssistantMessage]);

  // 处理 WebSocket 错误
  useEffect(() => {
    if (wsError) {
      setError(wsError);
      setIsLoading(false);
    }
  }, [wsError]);

  // 持久化消息到 localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`chat_messages_${chatId}`, JSON.stringify(messages));
    }
  }, [messages, chatId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
      isComplete: true, // 用户消息始终完整
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    // 构建符合 API 文档要求的消息格式
    const formattedMessage = {
      header: {
        app_id: "a28e68da",
        uid: "1234", // 示例用户ID，应该动态获取
        // patch_id: "resource_id_if_any", // 如果有微调模型，传入对应的 resource_id
      },
      parameter: {
        chat: {
          domain: "xqwen14bchat",
          temperature: 0.5, // 根据需要调整
          // top_k: 4, // 可选，根据需要添加
          // chat_id: "unique_chat_id_if_any", // 可选，根据需要添加
        },
      },
      payload: {
        message: {
          text: [
            { role: "user", content: userMessage.content },
          ],
        },
      },
    };

    try {
      // 发送消息到 WebSocket 服务器
      console.log("发送的用户消息格式:", JSON.stringify(formattedMessage)); // 调试用
      sendMessage(JSON.stringify(formattedMessage));
    } catch (error: any) {
      console.error(error);
      setError("发送消息时出错。");
      setIsLoading(false);
    }
  };

  return {
    input,
    handleInputChange,
    handleSubmit,
    messages,
    setMessages, // 暴露 setMessages 以便外部组件调用
    isLoading,
    error,
    isConnected,
    sendMessage,
  };
};
