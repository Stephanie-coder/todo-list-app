import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import TodoHeader from "./TodoHeader";
import TodoStats from "./TodoStats";
import TodoForm from "./TodoForm";
import TodoList from "./TodoList";
import TodoFilters from "./TodoFilters";
import backend from "~backend/client";
import { useToast } from "@/components/ui/use-toast";
import type { TaskSuggestion } from "~backend/ai/types";

export default function TodoApp() {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const { toast } = useToast();

  const { data: todosData, refetch: refetchTodos, isLoading: todosLoading } = useQuery({
    queryKey: ["todos", filter, categoryFilter],
    queryFn: async () => {
      try {
        const completed = filter === "all" ? undefined : filter === "completed";
        const category = categoryFilter || undefined;
        return await backend.todo.list({ completed, category });
      } catch (error) {
        console.error("Failed to fetch todos:", error);
        toast({
          title: "Error",
          description: "Failed to fetch todos. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["todo-stats"],
    queryFn: async () => {
      try {
        return await backend.todo.getStats();
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        return { total: 0, completed: 0, pending: 0, overdue: 0 };
      }
    },
  });

  const createTodoMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      priority: number;
      category?: string;
      dueDate?: Date;
    }) => {
      return await backend.todo.create(data);
    },
    onSuccess: () => {
      handleRefresh();
      toast({
        title: "Success",
        description: "Todo created successfully!",
      });
    },
    onError: (error) => {
      console.error("Failed to create todo:", error);
      toast({
        title: "Error",
        description: "Failed to create todo. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    refetchTodos();
    refetchStats();
  };

  const handleTaskSuggestionAccept = (suggestion: TaskSuggestion) => {
    createTodoMutation.mutate({
      title: suggestion.title,
      description: suggestion.description,
      priority: suggestion.priority,
      category: suggestion.category,
    });
  };

  const todos = todosData?.todos || [];
  const categories = Array.from(new Set(todos.map(todo => todo.category).filter(Boolean)));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <TodoHeader onTaskSuggestionAccept={handleTaskSuggestionAccept} />
      
      <div className="space-y-6">
        <TodoStats stats={stats} />
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <TodoForm onSuccess={handleRefresh} />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <TodoFilters
            filter={filter}
            onFilterChange={setFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            categories={categories}
          />
          
          <TodoList
            todos={todos}
            onUpdate={handleRefresh}
            onDelete={handleRefresh}
            isLoading={todosLoading}
          />
        </div>
      </div>
    </div>
  );
}
