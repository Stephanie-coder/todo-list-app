import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { notificationsDB } from "./db";
import type { Notification, ListNotificationsResponse } from "./types";

interface ListNotificationsParams {
  unreadOnly?: Query<boolean>;
  limit?: Query<number>;
  offset?: Query<number>;
}

// Retrieves notifications for the authenticated user.
export const list = api<ListNotificationsParams, ListNotificationsResponse>(
  { expose: true, method: "GET", path: "/notifications" },
  async (req) => {
    const userId = "default-user"; // Simplified for now
    const limit = req.limit || 20;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW())";
    const params: any[] = [userId];
    let paramIndex = 2;
    
    if (req.unreadOnly) {
      whereClause += ` AND read = false`;
    }
    
    const countQuery = `SELECT COUNT(*) as count FROM notifications ${whereClause}`;
    const countResult = await notificationsDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;
    
    const notificationsQuery = `
      SELECT 
        id,
        user_id as "userId",
        title,
        message,
        type,
        read,
        created_at as "createdAt",
        expires_at as "expiresAt"
      FROM notifications 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const notifications = await notificationsDB.rawQueryAll<Notification>(
      notificationsQuery, 
      ...params, 
      limit, 
      offset
    );
    
    return { notifications, total };
  }
);
