import { api } from "encore.dev/api";
import { notificationsDB } from "./db";

// Marks all notifications as read for the authenticated user.
export const markAllRead = api<void, void>(
  { expose: true, method: "PUT", path: "/notifications/read-all" },
  async () => {
    const userId = "default-user"; // Simplified for now
    
    await notificationsDB.exec`
      UPDATE notifications 
      SET read = true 
      WHERE user_id = ${userId} AND read = false
    `;
  }
);
