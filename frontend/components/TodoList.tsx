import React from "react";
import { CheckCircle2, Circle, Calendar, Flag, Tag, Trash2, Clock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { Todo } from "~backend/todo/types";

interface TodoListProps {
  todos: Todo[];
  onUpdate: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

export default function TodoList({ todos, onUpdate, onDelete, isLoading }: TodoListProps) {
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; completed: boolean }) => {
      return await backend.todo.update(data);
    },
    onSuccess: () => {
      onUpdate();
      toast({
        title: "Success",
        description: "Todo updated successfully!",
      });
    },
    onError: (error) => {
      console.error("Failed to update todo:", error);
      toast({
        title: "Error",
        description: "Failed to update todo. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await backend.todo.deleteTodo({ id });
    },
    onSuccess: () => {
      onDelete();
      toast({
        title: "Success",
        description: "Todo deleted successfully!",
      });
    },
    onError: (error) => {
      console.error("Failed to delete todo:", error);
      toast({
        title: "Error",
        description: "Failed to delete todo. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleComplete = (todo: Todo) => {
    updateMutation.mutate({
      id: todo.id,
      completed: !todo.completed,
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return "text-red-600 bg-red-50";
      case 2: return "text-yellow-600 bg-yellow-50";
      default: return "text-green-600 bg-green-50";
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3: return "High";
      case 2: return "Medium";
      default: return "Low";
    }
  };

  const isOverdue = (dueDate?: Date, completed?: boolean) => {
    if (!dueDate || completed) return false;
    return new Date(dueDate) < new Date();
  };

  const isDueSoon = (dueDate?: Date, completed?: boolean) => {
    if (!dueDate || completed) return false;
    const now = new Date();
    const due = new Date(dueDate);
    const timeDiff = due.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    return hoursDiff > 0 && hoursDiff <= 24;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No todos found</h3>
        <p className="text-gray-500">Create your first todo to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className={`group p-4 rounded-lg border transition-all hover:shadow-md ${
            todo.completed
              ? "bg-gray-50 border-gray-200"
              : isOverdue(todo.dueDate, todo.completed)
              ? "bg-red-50 border-red-200"
              : isDueSoon(todo.dueDate, todo.completed)
              ? "bg-yellow-50 border-yellow-200"
              : "bg-white border-gray-200 hover:border-blue-200"
          }`}
        >
          <div className="flex items-start gap-3">
            <button
              onClick={() => handleToggleComplete(todo)}
              className="mt-1 flex-shrink-0 transition-colors"
              disabled={updateMutation.isPending}
            >
              {todo.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400 hover:text-blue-600" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3
                    className={`font-medium ${
                      todo.completed
                        ? "text-gray-500 line-through"
                        : "text-gray-900"
                    }`}
                  >
                    {todo.title}
                  </h3>
                  {todo.description && (
                    <p
                      className={`mt-1 text-sm ${
                        todo.completed ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {todo.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(todo.id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3">
                {todo.priority > 1 && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                    <Flag className="h-3 w-3" />
                    {getPriorityLabel(todo.priority)}
                  </div>
                )}

                {todo.category && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    <Tag className="h-3 w-3" />
                    {todo.category}
                  </div>
                )}

                {todo.dueDate && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    isOverdue(todo.dueDate, todo.completed)
                      ? "bg-red-50 text-red-700"
                      : isDueSoon(todo.dueDate, todo.completed)
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-gray-50 text-gray-700"
                  }`}>
                    {isOverdue(todo.dueDate, todo.completed) ? (
                      <Clock className="h-3 w-3" />
                    ) : (
                      <Calendar className="h-3 w-3" />
                    )}
                    {new Date(todo.dueDate).toLocaleDateString()}
                    {isOverdue(todo.dueDate, todo.completed) && " (Overdue)"}
                    {isDueSoon(todo.dueDate, todo.completed) && " (Due Soon)"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
