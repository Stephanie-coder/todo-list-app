import { api, APIError } from "encore.dev/api";
import { notificationsDB } from "./db";

interface MarkReadRequest {
  id: number;
}

// Marks a notification as read.
export const markRead = api<MarkReadRequest, void>(
  { expose: true, method: "PUT", path: "/notifications/:id/read" },
  async (req) => {
    const userId = "default-user"; // Simplified for now
    
    const result = await notificationsDB.exec`
      UPDATE notifications 
      SET read = true 
      WHERE id = ${req.id} AND user_id = ${userId}
    `;
  }
);
