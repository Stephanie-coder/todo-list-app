import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { secret } from "encore.dev/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { aiDB } from "./db";
import type { SuggestTasksRequest, SuggestTasksResponse, TaskSuggestion } from "./types";

const geminiApiKey = secret("GeminiApiKey");
const genAI = new GoogleGenerativeAI(geminiApiKey());

// Suggests tasks based on user input and context.
export const suggestTasks = api<SuggestTasksRequest, SuggestTasksResponse>(
  { expose: true, method: "POST", path: "/ai/suggest-tasks", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    
    // Get user's recent todos for context
    const recentTodos = await aiDB.queryAll<{title: string, category: string, description: string}>`
      SELECT title, category, description 
      FROM todos 
      WHERE user_id = ${auth.userID} 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const context = recentTodos.length > 0 
      ? `User's recent tasks: ${recentTodos.map(t => `${t.title} (${t.category || 'No category'})`).join(', ')}`
      : "No previous tasks found.";
    
    const prompt = `
      You are a helpful task management assistant. Based on the user's input and their task history, suggest 3-5 relevant tasks.
      
      User input: "${req.input}"
      ${context}
      
      Please respond with a JSON array of task suggestions. Each suggestion should have:
      - title: A clear, actionable task title
      - description: A brief description of what needs to be done
      - category: A relevant category (Work, Personal, Health, Learning, etc.)
      - priority: A number from 1-3 (1=low, 2=medium, 3=high)
      - estimatedDuration: Estimated time to complete (e.g., "30 minutes", "2 hours")
      
      Make the suggestions specific, actionable, and relevant to the user's input.
      
      Example format:
      [
        {
          "title": "Review quarterly budget",
          "description": "Analyze Q3 expenses and prepare budget adjustments for Q4",
          "category": "Work",
          "priority": 2,
          "estimatedDuration": "1 hour"
        }
      ]
    `;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in AI response");
      }
      
      const suggestions: TaskSuggestion[] = JSON.parse(jsonMatch[0]);
      
      // Validate and clean suggestions
      const validSuggestions = suggestions
        .filter(s => s.title && s.description && s.category)
        .slice(0, 5) // Limit to 5 suggestions
        .map(s => ({
          ...s,
          priority: Math.max(1, Math.min(3, s.priority || 1)), // Ensure priority is 1-3
        }));
      
      return { suggestions: validSuggestions };
    } catch (error) {
      console.error("AI suggestion error:", error);
      
      // Fallback suggestions based on input keywords
      const fallbackSuggestions = generateFallbackSuggestions(req.input);
      return { suggestions: fallbackSuggestions };
    }
  }
);

function generateFallbackSuggestions(input: string): TaskSuggestion[] {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('work') || lowerInput.includes('job') || lowerInput.includes('meeting')) {
    return [
      {
        title: "Schedule team meeting",
        description: "Organize a meeting to discuss project progress",
        category: "Work",
        priority: 2,
        estimatedDuration: "30 minutes"
      },
      {
        title: "Review project timeline",
        description: "Check current project milestones and deadlines",
        category: "Work",
        priority: 2,
        estimatedDuration: "45 minutes"
      }
    ];
  }
  
  if (lowerInput.includes('health') || lowerInput.includes('exercise') || lowerInput.includes('fitness')) {
    return [
      {
        title: "30-minute workout",
        description: "Complete a cardio or strength training session",
        category: "Health",
        priority: 2,
        estimatedDuration: "30 minutes"
      },
      {
        title: "Plan healthy meals",
        description: "Prepare a meal plan for the week",
        category: "Health",
        priority: 1,
        estimatedDuration: "20 minutes"
      }
    ];
  }
  
  return [
    {
      title: "Organize daily tasks",
      description: "Review and prioritize today's activities",
      category: "Personal",
      priority: 1,
      estimatedDuration: "15 minutes"
    }
  ];
}
