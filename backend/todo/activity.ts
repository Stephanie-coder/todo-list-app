import { todoDB } from "./db";

export async function logActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId: number,
  details?: any
) {
  await todoDB.exec`
    INSERT INTO activity_log (user_id, action, entity_type, entity_id, details, created_at)
    VALUES (${userId}, ${action}, ${entityType}, ${entityId}, ${JSON.stringify(details || {})}, ${new Date()})
  `;
}

export interface ActivityLogEntry {
  id: number;
  userId: string;
  action: string;
  entityType: string;
  entityId: number;
  details: any;
  createdAt: Date;
}
