import { api } from "encore.dev/api";
import { notificationsDB } from "./db";
import type { CreateNotificationRequest, Notification } from "./types";

// Creates a new notification for the authenticated user.
export const create = api<CreateNotificationRequest, Notification>(
  { expose: true, method: "POST", path: "/notifications" },
  async (req) => {
    const userId = "default-user"; // Simplified for now
    const now = new Date();
    
    const row = await notificationsDB.queryRow<Notification>`
      INSERT INTO notifications (user_id, title, message, type, expires_at, created_at)
      VALUES (${userId}, ${req.title}, ${req.message}, ${req.type || 'info'}, ${req.expiresAt || null}, ${now})
      RETURNING 
        id,
        user_id as "userId",
        title,
        message,
        type,
        read,
        created_at as "createdAt",
        expires_at as "expiresAt"
    `;
    
    return row!;
  }
);
