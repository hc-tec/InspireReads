// src/app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import FileUpload from "@/components/FileUpload";

export default function Home() {
  // 假设用户已认证
  const isAuth = true;
  const firstChat = { id: 1 };

  return (
    <div 
    className="w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100 flex items-center justify-center">
      <div className="flex flex-col items-center text-center" style={{width: "50%"}}>
        <div className="flex items-center">
          <h1 className="mr-3 text-5xl font-semibold">Book AI</h1>
        </div>

        <div className="flex mt-2">
          {isAuth && firstChat && (
            <Link href={`/chat/${firstChat.id}`}>
              <Button>
                进入聊天 <ArrowRight className="ml-2" />
              </Button>
            </Link>
          )}
        </div>

        <p className="max-w-xl mt-1 text-lg text-slate-600">
          解读书籍的最佳助手，支持 PDF 上传。
        </p>

        <div className="w-full mt-4">
          {isAuth ? (
            <FileUpload />
          ) : (
            <Link href="/sign-in">
              <Button>
                登录开始
                <LogIn className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
