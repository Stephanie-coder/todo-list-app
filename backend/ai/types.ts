export interface TaskSuggestion {
  title: string;
  description: string;
  category: string;
  priority: number;
  estimatedDuration: string;
}

export interface SuggestTasksRequest {
  input: string;
}

export interface SuggestTasksResponse {
  suggestions: TaskSuggestion[];
}

export interface ProductivityAnalysisResponse {
  insights: string[];
  recommendations: string[];
  completionRate: number;
  averageCompletionTime: string;
  mostProductiveCategory: string;
}

export interface SmartCategorizeRequest {
  title: string;
  description?: string;
}

export interface SmartCategorizeResponse {
  category: string;
  priority: number;
  reasoning: string;
}
