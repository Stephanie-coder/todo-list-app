import { api } from "encore.dev/api";
import { todoDB } from "./db";
import type { TodoStats } from "./types";

// Retrieves statistics about todos.
export const getStats = api<void, TodoStats>(
  { expose: true, method: "GET", path: "/todos/stats" },
  async () => {
    const userId = "default-user"; // Simplified for now
    
    const stats = await todoDB.queryRow<{
      total: number;
      completed: number;
      pending: number;
      overdue: number;
    }>`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE completed = true) as completed,
        COUNT(*) FILTER (WHERE completed = false) as pending,
        COUNT(*) FILTER (WHERE completed = false AND due_date < NOW()) as overdue
      FROM todos
      WHERE user_id = ${userId}
    `;
    
    return stats || { total: 0, completed: 0, pending: 0, overdue: 0 };
  }
);
