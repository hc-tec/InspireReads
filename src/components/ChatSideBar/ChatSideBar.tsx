// src/components/ChatSideBar/ChatSideBar.tsx
"use client";

import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { MessageCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

type PlotOption = {
  label: string;
  pages: string; // 页码范围，例如 "01-10"
};

import plotOptions from '@/plotOptions.json';


type Props = {
  chats: DrizzleChat[];
  chatId: number;
  isPro: boolean;
  onInterpret?: (pages: string, plotLabel: string) => void;
  onPlotChange?: (pages: string | undefined, plotLabel: string | undefined) => void;
};

const ChatSideBar: React.FC<Props> = ({ chats, chatId, isPro, onInterpret = () => {}, onPlotChange = () => {} }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<PlotOption>(plotOptions[0]);

  const handlePlotChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = plotOptions.find(option => option.label === e.target.value);
    if (selected) {
      setSelectedPlot(selected);
    }

    if (typeof onInterpret !== "function") {
      console.error("onInterpret is not a function");
      return;
    }
    console.log(selected);
    

    await onPlotChange(selected.pages, selected.label);

  };

  const handleInterpretClick = async () => {
    if (typeof onInterpret !== "function") {
      console.error("onInterpret is not a function");
      return;
    }

    setLoading(true);
    try {
      await onInterpret(selectedPlot.pages, selectedPlot.label);
    } catch (error) {
      console.error("解读章节时出错：", error);
      toast.error("解读章节时出错，请查看控制台。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full p-4 text-gray-200 bg-gray-900 overflow-y-auto">
      {/* 新建聊天按钮 */}
      <Link href="/">
        <Button className="w-full border-dashed border-white border mb-4">
          <PlusCircle className="mr-2 w-4 h-4" />
          New Chat
        </Button>
      </Link>

      {/* 情节选择和解读按钮 */}
      <div className="p-4 bg-gray-800 rounded-lg mb-4">
        <label htmlFor="plot-select" className="block text-sm font-medium text-gray-300 mb-2">
          选择情节
        </label>
        <select
          id="plot-select"
          value={selectedPlot.label}
          onChange={handlePlotChange}
          className="block w-full p-2 mb-4 bg-gray-700 text-white rounded"
        >
          {plotOptions.map(option => (
            <option key={option.label} value={option.label}>
              {option.label} ({option.pages}页)
            </option>
          ))}
        </select>
        <Button
          onClick={handleInterpretClick}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {loading ? "解读中..." : "解读章节"}
        </Button>
      </div>

      {/* 聊天列表 */}
      <div className="flex flex-col gap-2">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn(
                "rounded-lg p-3 flex items-center cursor-pointer transition-colors duration-200",
                {
                  "bg-blue-600 text-white": chat.id === chatId,
                  "hover:bg-gray-700": chat.id !== chatId,
                }
              )}
            >
              <MessageCircle className="mr-2" />
              <p className="w-full text-sm truncate">{chat.pdfName}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatSideBar;
