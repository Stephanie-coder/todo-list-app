import { api } from "encore.dev/api";
import { userDB } from "./db";
import type { UserPreferences, UpdatePreferencesRequest } from "./types";

// Gets the current user's preferences.
export const getPreferences = api<void, UserPreferences>(
  { expose: true, method: "GET", path: "/user/preferences" },
  async () => {
    const userId = "default-user"; // Simplified for now
    
    const prefs = await userDB.queryRow<UserPreferences>`
      SELECT 
        user_id as "userId",
        email_notifications as "emailNotifications",
        push_notifications as "pushNotifications",
        reminder_time as "reminderTime",
        timezone,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM user_preferences 
      WHERE user_id = ${userId}
    `;
    
    if (!prefs) {
      // Create default preferences
      const now = new Date();
      const defaultPrefs = await userDB.queryRow<UserPreferences>`
        INSERT INTO user_preferences (user_id, created_at, updated_at)
        VALUES (${userId}, ${now}, ${now})
        RETURNING 
          user_id as "userId",
          email_notifications as "emailNotifications",
          push_notifications as "pushNotifications",
          reminder_time as "reminderTime",
          timezone,
          created_at as "createdAt",
          updated_at as "updatedAt"
      `;
      return defaultPrefs!;
    }
    
    return prefs;
  }
);

// Updates the current user's preferences.
export const updatePreferences = api<UpdatePreferencesRequest, UserPreferences>(
  { expose: true, method: "PUT", path: "/user/preferences" },
  async (req) => {
    const userId = "default-user"; // Simplified for now
    const now = new Date();
    
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    if (req.emailNotifications !== undefined) {
      updates.push(`email_notifications = $${paramIndex}`);
      params.push(req.emailNotifications);
      paramIndex++;
    }
    
    if (req.pushNotifications !== undefined) {
      updates.push(`push_notifications = $${paramIndex}`);
      params.push(req.pushNotifications);
      paramIndex++;
    }
    
    if (req.reminderTime !== undefined) {
      updates.push(`reminder_time = $${paramIndex}`);
      params.push(req.reminderTime);
      paramIndex++;
    }
    
    if (req.timezone !== undefined) {
      updates.push(`timezone = $${paramIndex}`);
      params.push(req.timezone);
      paramIndex++;
    }
    
    updates.push(`updated_at = $${paramIndex}`);
    params.push(now);
    paramIndex++;
    
    const query = `
      UPDATE user_preferences 
      SET ${updates.join(", ")}
      WHERE user_id = $${paramIndex}
      RETURNING 
        user_id as "userId",
        email_notifications as "emailNotifications",
        push_notifications as "pushNotifications",
        reminder_time as "reminderTime",
        timezone,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    
    const result = await userDB.rawQueryRow<UserPreferences>(query, ...params, userId);
    return result!;
  }
);
