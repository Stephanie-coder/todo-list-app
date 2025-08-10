import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { todoDB } from "./db";
import type { Todo, ListTodosResponse } from "./types";

interface ListTodosParams {
  completed?: Query<boolean>;
  category?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

// Retrieves all todos with optional filtering and pagination.
export const list = api<ListTodosParams, ListTodosResponse>(
  { expose: true, method: "GET", path: "/todos" },
  async (req) => {
    const userId = "default-user"; // Simplified for now
    const limit = req.limit ?? 50;
    const offset = req.offset ?? 0;
    
    let whereClause = "WHERE user_id = $1";
    const params: any[] = [userId];
    let paramIndex = 2;
    
    if (req.completed !== undefined) {
      whereClause += ` AND completed = $${paramIndex}`;
      params.push(req.completed);
      paramIndex++;
    }
    
    if (req.category !== undefined && req.category !== "") {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(req.category);
      paramIndex++;
    }
    
    const countQuery = `SELECT COUNT(*) as count FROM todos ${whereClause}`;
    const countResult = await todoDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;
    
    const todosQuery = `
      SELECT 
        id,
        title,
        description,
        completed,
        priority,
        category,
        due_date as "dueDate",
        user_id as "userId",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM todos 
      ${whereClause}
      ORDER BY 
        completed ASC,
        priority DESC,
        created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const todos = await todoDB.rawQueryAll<Todo>(todosQuery, ...params, limit, offset);
    
    return { todos, total };
  }
);
