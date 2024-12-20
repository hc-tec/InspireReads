// src/app/PDFContext.tsx
"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

type PDFContextType = {
  file: File | null;
  setFile: (file: File | null) => void;
};

const PDFContext = createContext<PDFContextType | undefined>(undefined);

export const PDFProvider = ({ children }: { children: ReactNode }) => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <PDFContext.Provider value={{ file, setFile }}>
      {children}
    </PDFContext.Provider>
  );
};

export const usePDF = () => {
  const context = useContext(PDFContext);
  if (!context) {
    throw new Error("usePDF must be used within a PDFProvider");
  }
  return context;
};
