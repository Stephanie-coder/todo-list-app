import React from "react";
import { CheckCircle, Clock, AlertTriangle, ListTodo } from "lucide-react";
import type { TodoStats } from "~backend/todo/types";

interface TodoStatsProps {
  stats?: TodoStats;
}

export default function TodoStats({ stats }: TodoStatsProps) {
  if (!stats) return null;

  const statItems = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: ListTodo,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${item.bgColor}`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="text-sm text-gray-600">{item.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
