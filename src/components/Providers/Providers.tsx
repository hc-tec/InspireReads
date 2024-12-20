// src/components/Providers/Providers.tsx
"use client";

import React from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { PDFProvider } from "@/app/PDFContext";
import { WebSocketProvider } from "@/context/WebSocketContext";

type Props = {
  children: React.ReactNode;
};

const queryClient = new QueryClient();

const Providers = ({ children }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <PDFProvider>
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
      </PDFProvider>
    </QueryClientProvider>
  );
};

export default Providers;
