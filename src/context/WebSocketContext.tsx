// src/context/WebSocketContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import axios from "axios";

type WebSocketContextType = {
  isConnected: boolean;
  sendMessage: (message: any) => void;
  error: string | null;
  registerMessageHandler: (handler: (message: any) => void) => void;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [error, setError] = useState<string | null>(null);
  const messageHandlerRef = useRef<(message: any) => void>();

  // 获取签名的 WebSocket URL
  const fetchWsUrl = useCallback(async () => {
    try {
      const response = await axios.post("/api/getWebSocketUrl", {
        host: process.env.NEXT_PUBLIC_HOST || "spark-api.xf-yun.com",
        path: "/v1.1/chat",
      });
      return response.data.wsUrl;
    } catch (err: any) {
      console.error("Failed to get WebSocket URL:", err);
      setError("获取 WebSocket URL 失败");
      return null;
    }
  }, []);

  const [wsUrl, setWsUrl] = useState<string | null>(null);

  useEffect(() => {
    const getUrl = async () => {
      const url = await fetchWsUrl();
      setWsUrl(url);
    };
    getUrl();
  }, [fetchWsUrl]);

  const handleMessage = useCallback((data: string) => {
    if (messageHandlerRef.current) {
      messageHandlerRef.current(data);
    }
  }, []);

  const { isConnected, sendMessage, error: wsError } = useWebSocket({
    url: wsUrl,
    onMessage: handleMessage,
  });

  useEffect(() => {
    if (wsError) {
      setError(wsError);
    }
  }, [wsError]);

  const registerMessageHandler = useCallback((handler: (message: any) => void) => {
    messageHandlerRef.current = handler;
  }, []);

  const contextValue = useMemo(
    () => ({
      isConnected,
      sendMessage,
      error,
      registerMessageHandler,
    }),
    [isConnected, sendMessage, error, registerMessageHandler]
  );

  return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider");
  }
  return context;
};
