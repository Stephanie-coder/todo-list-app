import React from "react";
import { Filter, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TodoFiltersProps {
  filter: "all" | "pending" | "completed";
  onFilterChange: (filter: "all" | "pending" | "completed") => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  categories: string[];
}

export default function TodoFilters({
  filter,
  onFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
}: TodoFiltersProps) {
  const filterOptions = [
    { value: "all", label: "All Tasks", count: "" },
    { value: "pending", label: "Pending", count: "" },
    { value: "completed", label: "Completed", count: "" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 pb-4 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filter:</span>
        <div className="flex gap-1">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(option.value as any)}
              className={
                filter === option.value
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Category:</span>
          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger className="w-40 border-gray-200">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
