import { api, APIError } from "encore.dev/api";
import { todoDB } from "./db";
import { logActivity } from "./activity";

interface DeleteTodoRequest {
  id: number;
}

// Deletes a todo item.
export const deleteTodo = api<DeleteTodoRequest, void>(
  { expose: true, method: "DELETE", path: "/todos/:id" },
  async (req) => {
    const userId = "default-user"; // Simplified for now
    
    // First get the todo to log its details
    const todo = await todoDB.queryRow<{id: number, title: string}>`
      SELECT id, title FROM todos WHERE id = ${req.id} AND user_id = ${userId}
    `;
    
    if (!todo) {
      throw APIError.notFound("todo not found");
    }
    
    await todoDB.exec`DELETE FROM todos WHERE id = ${req.id} AND user_id = ${userId}`;
    
    // Log activity
    await logActivity(userId, 'deleted', 'todo', todo.id, {
      title: todo.title
    });
  }
);
