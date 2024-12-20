// src/components/FileUpload.tsx
"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Inbox, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { usePDF } from "@/app/PDFContext"; // 使用自定义的 usePDF 钩子
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { setFile } = usePDF(); // 直接使用 usePDF 钩子获取 setFile 方法
  const router = useRouter();

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const selectedFile = acceptedFiles[0];
      
      const MAX_SIZE = 50 * 1024 * 1024; // 50MB

      if (selectedFile.size > MAX_SIZE) {
        toast.error("文件太大，请选择不超过10MB的PDF文件");
        return;
      }

      try {
        setUploading(true);
        // 将文件存储到 Context
        setFile(selectedFile);
        toast.success("文件已选择");
        
        // 跳转到新的聊天页面
        router.push(`/chat/1`);
      } catch (error) {
        console.error("处理文件时出错:", error);
        toast.error("处理文件时出错");
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="p-4 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <>
            {/* 加载状态 */}
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">处理中...</p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">将 PDF 拖放到此处，或点击上传</p>
          </>
        )}
      </div>
      {/* 移除预览部分 */}
    </div>
  );
};

export default FileUpload;
