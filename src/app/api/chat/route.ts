// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import WebSocket from "ws";
import { generateWebSocketUrl } from "@/lib/auth"; // 引入鉴权函数

export const runtime = "nodejs"; // 使用 Node.js 运行时以支持 WebSocket

export async function POST(req: NextRequest) {
  try {
    const { messages, chatId } = await req.json();

    // 获取最后一条用户消息
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // 生成WebSocket URL
    const wsUrl = generateWebSocketUrl();

    // 构建请求 payload
    const payload = {
      header: {
        app_id: process.env.APP_ID, // 从环境变量中获取
        uid: process.env.UID, // 从环境变量中获取，或默认值
        // patch_id: ["xxx"], // 如果调用微调模型时使用
      },
      parameter: {
        chat: {
          domain: process.env.SERVICE_ID, // 从环境变量中获取
          temperature: 0.5,
          top_k: 4, // 可选，根据需要调整
          // chat_id: "unique_chat_id", // 如果需要
        },
      },
      payload: {
        message: {
          text: [
            { role: "user", content: lastMessage.content },
          ],
        },
      },
    };

    // 创建一个 Promise 来处理 WebSocket 通信
    const responseData = await new Promise<string>((resolve, reject) => {
      const ws = new WebSocket(wsUrl);

      ws.on('open', () => {
        // 发送实际的请求 payload
        ws.send(JSON.stringify(payload));
      });

      let accumulatedData = "";

      ws.on('message', (data) => {
        const parsedData = JSON.parse(data.toString());

        if (parsedData.header.code !== 0) {
          reject(new Error(parsedData.header.message));
          ws.close();
          return;
        }

        if (parsedData.payload.choices.text) {
          parsedData.payload.choices.text.forEach((msg: any) => {
            accumulatedData += msg.content;
          });

          if (parsedData.payload.choices.status === 2) { // 最后一个结果
            resolve(accumulatedData);
            ws.close();
          }
        }
      });

      ws.on('error', (err) => {
        reject(err);
      });

      ws.on('close', () => {
        if (accumulatedData === "") {
          reject(new Error("WebSocket connection closed without receiving data."));
        }
      });
    });

    // 返回 AI 回复
    return NextResponse.json({ content: responseData });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// 示例：获取上下文的函数（假设已实现）
async function getContext(content: string, fileKey: string): Promise<string> {
  // 实现获取上下文的逻辑，例如从数据库或文件中获取相关上下文
  return `Context for fileKey ${fileKey} and content ${content}`;
}
