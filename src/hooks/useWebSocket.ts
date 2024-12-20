// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from "react";

type UseWebSocketProps = {
  url: string | null;
  onMessage: (message: string) => void;
};

export const useWebSocket = ({ url, onMessage }: UseWebSocketProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 5; // 最大重连次数

  const connect = useCallback(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
      console.log("WebSocket connected");
      retryCountRef.current = 0; // 重置重连次数
    };

    ws.onmessage = (event) => {
      onMessage(event.data);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setError("WebSocket error");
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");

      if (retryCountRef.current < maxRetries) {
        const timeout = Math.pow(2, retryCountRef.current) * 1000; // 指数退避
        console.log(`Attempting to reconnect WebSocket in ${timeout / 1000} seconds...`);
        setTimeout(() => {
          retryCountRef.current += 1;
          connect();
        }, timeout);
      } else {
        console.log("Max retries reached. WebSocket will not reconnect.");
        setError("无法连接到服务器");
      }
    };
  }, [url, onMessage]);

  useEffect(() => {
    connect();

    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback(
    (message: string) => {
      if (wsRef.current && isConnected) {
        console.log("发送消息到 WebSocket:", message); // 调试用
        wsRef.current.send(message);
      } else {
        console.error("WebSocket is not connected");
      }
    },
    [isConnected]
  );

  return { isConnected, sendMessage, error };
};
