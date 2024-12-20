// src/lib/types.ts
export type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  isComplete: boolean; // 标记消息是否完整
};
