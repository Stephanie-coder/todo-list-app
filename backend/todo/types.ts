export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: number;
  category?: string;
  dueDate?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: number;
  category?: string;
  dueDate?: Date;
}

export interface UpdateTodoRequest {
  id: number;
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: number;
  category?: string;
  dueDate?: Date;
}

export interface ListTodosRequest {
  completed?: boolean;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface ListTodosResponse {
  todos: Todo[];
  total: number;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}
