// src/components/PDFViewer/PDFViewer.tsx
"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

type PDFViewerProps = {
  file: File | string; // 可以是本地 File 对象或 URL 字符串
};

export type PDFViewerHandle = {
  extractTextFromPages: (startPage: number, endPage: number) => Promise<string>;
  jumpToPage: (pageNumber: number) => void;
  setCurrentPage: (pageNumber: number) => void; // 新增暴露的 setCurrentPage 方法
};

async function loadPDFData(fileOrUrl: File | string): Promise<ArrayBuffer> {
  if (fileOrUrl instanceof File) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error("无法读取文件为ArrayBuffer"));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(fileOrUrl);
    });
  } else {
    const response = await fetch(fileOrUrl);
    return response.arrayBuffer();
  }
}

async function getPageText(pdf: pdfjs.PDFDocumentProxy, pageNumber: number): Promise<string> {
  const page = await pdf.getPage(pageNumber);
  const textContent = await page.getTextContent();
  return textContent.items.map((item: any) => item.str).join(' ');
}

const PDFViewer = forwardRef<PDFViewerHandle, PDFViewerProps>(({ file }, ref) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfDocument, setPdfDocument] = useState<pdfjs.PDFDocumentProxy | null>(null);

  useImperativeHandle(ref, () => ({
    extractTextFromPages: async (startPage: number, endPage: number) => {
      if (!pdfDocument) {
        throw new Error("PDF 尚未加载完成");
      }
      let extractedText = "";
      for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
        if (pageNum > pdfDocument.numPages) break;
        const pageText = await getPageText(pdfDocument, pageNum);
        extractedText += pageText + "\n";
      }
      return extractedText.trim();
    },
    jumpToPage: (pageNumber: number) => {
      if (pageNumber >= 1 && pageNumber <= (numPages || 1)) {
        setCurrentPage(pageNumber);
      } else {
        console.warn(`页面编号 ${pageNumber} 超出范围。`);
      }
    },
    setCurrentPage: (pageNumber: number) => { // 新增的方法
      if (pageNumber >= 1 && pageNumber <= (numPages || 1)) {
        setCurrentPage(pageNumber);
      } else {
        console.warn(`页面编号 ${pageNumber} 超出范围。`);
      }
    },
  }));

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const arrayBuffer = await loadPDFData(file);
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;

        if (!isMounted) return;

        console.log("PDF 加载完成，总页数：", pdf.numPages);
        setNumPages(pdf.numPages);
        setPdfDocument(pdf);
      } catch (error) {
        console.error("加载或解析 PDF 文件时出错：", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    if (numPages) {
      setCurrentPage((prev) => Math.min(prev + 1, numPages));
    }
  };

  return (
    <div className="pdf-viewer h-full flex flex-col">
      {/* 控制按钮 */}
      <div className="controls mb-4 flex justify-center items-center">
        <button
          onClick={goToPrevPage}
          disabled={currentPage <= 1}
          className="px-4 py-2 mr-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          上一页
        </button>
        <span className="mx-2">
          第 {currentPage} 页 / 共 {numPages} 页
        </span>
        <button
          onClick={goToNextPage}
          disabled={numPages ? currentPage >= numPages : true}
          className="px-4 py-2 ml-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          下一页
        </button>
      </div>

      {/* PDF 文档显示 */}
      <div className="document-container flex-1 flex justify-center overflow-auto">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => console.error("加载 PDF 失败:", error)}
        >
          <Page
            pageNumber={currentPage}
            width={600} // 可根据需求调整
            renderTextLayer={true}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    </div>
  );
});

export default PDFViewer;
