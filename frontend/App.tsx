import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import TodoApp from "./components/TodoApp";
import { NotificationProvider } from "./components/NotificationProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 3,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <NotificationProvider>
          <TodoApp />
        </NotificationProvider>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}
