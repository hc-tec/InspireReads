// src/lib/auth.ts
import crypto from 'crypto';

export function generateWebSocketUrl(): string {
  const host = process.env.HOST || "spark-api.xf-yun.com";
  const path = "/v1.1/chat";
  
  // 生成date参数，RFC1123格式
  const date = new Date().toUTCString();

  // 拼接tmp字符串
  let tmp = `host: ${host}\n`;
  tmp += `date: ${date}\n`;
  tmp += `GET ${path} HTTP/1.1`;

  // 生成HMAC-SHA256签名
  const apiSecret = process.env.API_SECRET || "";
  const hmac = crypto.createHmac('sha256', apiSecret);
  hmac.update(tmp);
  const tmp_sha = hmac.digest();

  // Base64编码签名
  const signature = Buffer.from(tmp_sha).toString('base64');

  // 组装authorization_origin字符串
  const apiKey = process.env.API_KEY || "";
  const authorization_origin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;

  // Base64编码authorization_origin
  const authorization = Buffer.from(authorization_origin).toString('base64');

  // 组装最终WebSocket URL
  const params = new URLSearchParams({
    authorization: authorization,
    date: date,
    host: host,
  });

  const wsUrl = `wss://${host}${path}?${params.toString()}`;

  return wsUrl;
}
