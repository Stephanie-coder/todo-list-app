import { api } from "encore.dev/api";
import { todoDB } from "./db";
import { logActivity } from "./activity";
import type { CreateTodoRequest, Todo } from "./types";

// Creates a new todo item.
export const create = api<CreateTodoRequest, Todo>(
  { expose: true, method: "POST", path: "/todos" },
  async (req) => {
    const userId = "default-user"; // Simplified for now
    const now = new Date();
    
    const row = await todoDB.queryRow<Todo>`
      INSERT INTO todos (title, description, priority, category, due_date, user_id, created_at, updated_at)
      VALUES (${req.title}, ${req.description || null}, ${req.priority || 1}, ${req.category || null}, ${req.dueDate || null}, ${userId}, ${now}, ${now})
      RETURNING 
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
    `;
    
    // Log activity
    await logActivity(userId, 'created', 'todo', row!.id, {
      title: row!.title,
      priority: row!.priority,
      category: row!.category
    });
    
    return row!;
  }
);
