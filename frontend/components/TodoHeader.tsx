import React from "react";
import { CheckSquare, Sparkles, Settings, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationDropdown from "./NotificationDropdown";
import UserPreferences from "./UserPreferences";
import AIAssistant from "./AIAssistant";
import type { TaskSuggestion } from "~backend/ai/types";

interface TodoHeaderProps {
  onTaskSuggestionAccept?: (suggestion: TaskSuggestion) => void;
}

export default function TodoHeader({ onTaskSuggestionAccept }: TodoHeaderProps) {
  const [showPreferences, setShowPreferences] = React.useState(false);
  const [showAIAssistant, setShowAIAssistant] = React.useState(false);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <CheckSquare className="h-10 w-10 text-blue-600" />
            <Sparkles className="h-4 w-4 text-purple-500 absolute -top-1 -right-1" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TodoFlow
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIAssistant(true)}
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Assistant
          </Button>
          <NotificationDropdown />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreferences(true)}
            className="border-gray-200"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            U
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-gray-600 text-lg">
          Organize your tasks with style and efficiency
        </p>
      </div>
      
      {showPreferences && (
        <UserPreferences 
          open={showPreferences}
          onClose={() => setShowPreferences(false)}
        />
      )}
      
      {showAIAssistant && (
        <AIAssistant
          open={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
          onTaskSuggestionAccept={onTaskSuggestionAccept || (() => {})}
        />
      )}
    </div>
  );
}
