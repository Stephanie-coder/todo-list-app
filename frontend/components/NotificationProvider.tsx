import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { config } from "../config";
import type { Notification } from "~backend/notifications/types";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  refetch: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { data, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      return await backend.notifications.list({ limit: config.notifications.maxDisplayCount });
    },
    refetchInterval: config.notifications.pollInterval,
  });

  useEffect(() => {
    if (data?.notifications) {
      setNotifications(data.notifications);
    }
  }, [data]);

  const markAsRead = async (id: number) => {
    try {
      await backend.notifications.markRead({ id });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await backend.notifications.markAllRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      refetch,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
