// src/app/chat/[chatId]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import ChatComponent from "@/components/ChatComponent/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar/ChatSideBar";
import PDFViewer, { PDFViewerHandle } from "@/components/PDFViewer/PDFViewer";
import { usePDF } from "@/app/PDFContext";
import { useChat } from "@/hooks/useChat";
import { DrizzleChat } from "@/lib/db/schema";
type Props = {
  params: {
    chatId: string;
  };
};

const read_prompt = `情节概述：
简要描述情节发生的背景、主要事件及其发展过程。
概述情节中的主要利益冲突、背景设定和外部压力等因素。
分析这些因素如何影响角色的决策和行动。
逐角色深入分析

对于每个主要角色，按照以下结构进行系统、连贯且深入的分析：
对于决策方面的分析，应该非常详细才行！！！不放过任何一个细节！！！
角色分析模板
角色名称： [角色A]

1. 角色背景与定位

背景介绍：
角色的历史、地位、性格特点等。
角色在情节中的定位及其重要性。
2. 核心问题与目标

核心问题：
角色在当前情节中面临的最关键问题是什么？
这些问题如何相互交织，影响角色的决策？
目标：
明确角色的短期和长期目标。
这些目标是战略性的还是应急性的？
3. 动机与驱动因素

动机：
角色的决策背后的心理驱动力，如权力欲、忠诚、个人情感、恐惧、利益等。
这些动机如何具体影响角色的行为和选择？
内在驱动：
角色的个人价值观、信念体系如何引导其决策？
角色的情感状态（如压力、焦虑、决心）如何影响其选择？
4. 决策过程与选择
对于决策方面的分析，应该非常详细才行！！！不放过任何一个细节！！！你需要做到决策以情节为基础进行分析！！！绝对不是空话分析！
决策过程：
描述角色在复杂环境下的决策过程，包括信息收集、分析和评估。
角色在做出决策时所采用的思维方式（如理性分析、直觉判断）。
具体选择：
列出角色面临的具体选择，每个选择的详细描述。
选择理由：
深入解释角色为何选择某一措施，详细探讨其背后的原因。
结合角色的目标、动机和外部环境，说明选择的逻辑和合理性。
替代方案分析：
分析角色可能的替代方案，讨论每个方案的优缺点。
解释为何角色最终放弃其他选项，选择特定的路径。
权衡与妥协：
探讨角色在决策过程中如何权衡不同因素（如短期与长期利益、个人与集体利益）。
分析角色是否在某些方面做出了妥协，及其原因。
5. 决策的执行与互动

执行过程：
描述角色如何将决策付诸实践，具体采取了哪些措施。
分析执行过程中遇到的困难、阻力及必要的调整。
人物互动：
描述角色与其他人物之间的互动方式，如合作、对抗、背叛等。
分析这些互动如何影响角色的决策和执行过程。
探讨互动中的妥协或冲突对角色最终决策的影响。
6. 决策的后果与影响

直接后果：
角色决策执行后的直接结果，是否实现了其初衷和目标。
长期与短期影响：
分析这些后果在短期和长期内对角色及整个情节的影响。
探讨角色是否因过度关注眼前利益而忽视了长远目标，或反之。
假设情境分析：
讨论如果角色选择了其他路径，情节可能会如何发展，带来哪些不同的结果。
对其他角色的影响：
分析该角色的决策是否对其他人物或整体局势产生了连锁反应。
讨论某一角色的成功或失败决策如何影响他人的命运，或引发对手的反应，进而改变整个情节走向。
7. 综合总结

决策合理性：
评估角色决策的合理性及其背后的逻辑。
一致性与矛盾：
分析角色的行为是否与其目标和动机一致，是否存在内在矛盾或自相矛盾之处。
推动情节发展：
讨论角色的决策如何推动整个情节的发展。
总结与引导性问题

总体总结：
对所有角色的分析进行综合总结，展示各角色决策之间的关联及其对情节的整体影响。
引导性问题：
这些问题旨在进一步深化分析，帮助读者思考和理解角色的决策过程。例如：
各角色的决策是否存在相互影响或制约？
角色之间的互动如何共同推动情节发展？
是否有其他潜在的决策路径未被探索，这些路径可能带来哪些不同的结果？
角色在决策过程中是否有未被充分利用的资源或信息？
角色的情感状态在多大程度上影响了其决策？


解读内容如下`

const ChatPage: React.FC<Props> = ({ params: { chatId } }) => {
  const { file } = usePDF();
  const [fileURL, setFileURL] = useState<string>("");

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileURL(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  // 获取当前聊天信息，这里使用假数据或从数据库获取
  const currentChat: DrizzleChat = {
    id: 1,
    pdfName: file ? file.name : "未上传",
    pdfUrl: fileURL,
    createdAt: new Date(),
    userId: "1234", // 使用动态获取的 userId
    fileKey: "string",
  };
  const chats: DrizzleChat[] = [currentChat];

  const isPro = true;

  // 使用 useChat 钩子
  const chat = useChat({
    chatId: parseInt(chatId),
  });

  // 引用 PDFViewer 以调用其方法
  const pdfViewerRef = React.useRef<PDFViewerHandle>(null);

  const handlePlotChange = async (pages: string, plotLabel: string) => {
    // 解析页码范围，例如 "01-10" => startPage: 1, endPage: 10
    const [start, end] = pages.split("-").map((p) => parseInt(p, 10));
    if (isNaN(start) || isNaN(end)) {
      return;
    }
    if (pdfViewerRef.current) {
      await pdfViewerRef.current.jumpToPage(start);
    }
  }

  const handleInterpret = async (pages: string, plotLabel: string) => {
    // 解析页码范围，例如 "01-10" => startPage: 1, endPage: 10
    const [start, end] = pages.split("-").map((p) => parseInt(p, 10));
    if (isNaN(start) || isNaN(end)) {
      return;
    }

    if (pdfViewerRef.current) {
      try {
        const extractedText = await pdfViewerRef.current.extractTextFromPages(start, end);
        const interpretMessageContent = `请解读「${plotLabel} ${pages}」的内容。`;
        const prompt = `${read_prompt}\n${extractedText}`
        // 创建用户消息
        const userMessage = {
          id: Date.now(),
          role: "user",
          content: interpretMessageContent,
          isComplete: true, // 用户消息始终完整
        };

        // 将用户消息添加到消息列表
        chat.setMessages((prev) => [...prev, userMessage]);

        // 构建符合 API 文档要求的消息格式
        const formattedMessage = {
          header: {
            app_id: "a28e68da",
            uid: "1234" // 动态获取用户ID
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
                { role: "user", content: prompt },
              ],
            },
          },
        };

        // 发送序列化后的消息
        chat.sendMessage(JSON.stringify(formattedMessage));
      } catch (error) {
        console.error("提取文本或发送消息时出错：", error);
      }
    } else {
    }
  };

  return (
    <div className="flex h-screen">
      {/* 聊天侧边栏 */}
      <div className="w-1/4 max-w-xs">
        <ChatSideBar
          chats={chats}
          chatId={parseInt(chatId)}
          isPro={isPro}
          onInterpret={handleInterpret} // 传递解读章节的回调
          onPlotChange={handlePlotChange}
        />
      </div>

      {/* PDF 查看器 */}
      <div className="w-2/4 p-4 overflow-auto">
        {fileURL ? (
          <PDFViewer ref={pdfViewerRef} file={fileURL} />
        ) : (
          <p>未上传 PDF 文件。</p>
        )}
      </div>

      {/* 聊天组件 */}
      <div className="w-1/4 flex-1 border-l-4 border-l-slate-200">
        <ChatComponent chat={chat} /> {/* 传递 chat 对象 */}
      </div>
    </div>
  );
};

export default ChatPage;
