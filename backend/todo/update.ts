import { api, APIError } from "encore.dev/api";
import { todoDB } from "./db";
import { logActivity } from "./activity";
import type { UpdateTodoRequest, Todo } from "./types";

// Updates an existing todo item.
export const update = api<UpdateTodoRequest, Todo>(
  { expose: true, method: "PUT", path: "/todos/:id" },
  async (req) => {
    const userId = "default-user"; // Simplified for now
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    if (req.title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      params.push(req.title);
      paramIndex++;
    }
    
    if (req.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(req.description);
      paramIndex++;
    }
    
    if (req.completed !== undefined) {
      updates.push(`completed = $${paramIndex}`);
      params.push(req.completed);
      paramIndex++;
    }
    
    if (req.priority !== undefined) {
      updates.push(`priority = $${paramIndex}`);
      params.push(req.priority);
      paramIndex++;
    }
    
    if (req.category !== undefined) {
      updates.push(`category = $${paramIndex}`);
      params.push(req.category);
      paramIndex++;
    }
    
    if (req.dueDate !== undefined) {
      updates.push(`due_date = $${paramIndex}`);
      params.push(req.dueDate);
      paramIndex++;
    }
    
    if (updates.length === 0) {
      throw APIError.invalidArgument("no fields to update");
    }
    
    updates.push(`updated_at = $${paramIndex}`);
    params.push(new Date());
    paramIndex++;
    
    const query = `
      UPDATE todos 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
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
    
    const row = await todoDB.rawQueryRow<Todo>(query, ...params, req.id, userId);
    
    if (!row) {
      throw APIError.notFound("todo not found");
    }
    
    // Log activity
    const action = req.completed !== undefined ? 
      (req.completed ? 'completed' : 'updated') : 'updated';
    
    await logActivity(userId, action, 'todo', row.id, {
      changes: req
    });
    
    return row;
  }
);
