import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Plus, Calendar, Tag, Flag, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";

interface SmartTodoFormProps {
  onSuccess: () => void;
}

export default function SmartTodoForm({ onSuccess }: SmartTodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("1");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: string;
    priority: number;
    reasoning: string;
  } | null>(null);
  const { toast } = useToast();

  const createMutation = useMutation({
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
      setTitle("");
      setDescription("");
      setPriority("1");
      setCategory("");
      setDueDate("");
      setIsExpanded(false);
      setAiSuggestion(null);
      onSuccess();
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

  const categorizeMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      return await backend.ai.smartCategorize(data);
    },
    onSuccess: (data) => {
      setAiSuggestion(data);
      setCategory(data.category);
      setPriority(data.priority.toString());
      toast({
        title: "AI Suggestion",
        description: "Task has been automatically categorized and prioritized!",
      });
    },
    onError: (error) => {
      console.error("Failed to categorize task:", error);
      toast({
        title: "AI Error",
        description: "Failed to get AI suggestions, but you can still create the task manually.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      priority: parseInt(priority),
      category: category.trim() || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
  };

  const handleAISuggest = () => {
    if (!title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter a task title first.",
        variant: "destructive",
      });
      return;
    }
    
    categorizeMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
    });
  };

  const priorityOptions = [
    { value: "3", label: "High Priority", color: "text-red-600" },
    { value: "2", label: "Medium Priority", color: "text-yellow-600" },
    { value: "1", label: "Low Priority", color: "text-green-600" },
  ];

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return "bg-red-100 text-red-800";
      case 2: return "bg-yellow-100 text-yellow-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3: return "High";
      case 2: return "Medium";
      default: return "Low";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          onFocus={() => setIsExpanded(true)}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAISuggest}
          disabled={!title.trim() || categorizeMutation.isPending}
          className="border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          {categorizeMutation.isPending ? "AI..." : "AI"}
        </Button>
        <Button
          type="submit"
          disabled={!title.trim() || createMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {aiSuggestion && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-2 mb-2">
            <Wand2 className="h-4 w-4 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-900">AI Suggestion Applied</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{aiSuggestion.category}</Badge>
                <Badge className={getPriorityColor(aiSuggestion.priority)}>
                  {getPriorityLabel(aiSuggestion.priority)} Priority
                </Badge>
              </div>
              <p className="text-xs text-purple-700 mt-1">{aiSuggestion.reasoning}</p>
            </div>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <Textarea
            placeholder="Add a description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Priority
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className={option.color}>{option.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Category
              </label>
              <Input
                placeholder="e.g., Work, Personal"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsExpanded(false);
                setAiSuggestion(null);
              }}
              className="border-gray-200"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
