import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { secret } from "encore.dev/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { aiDB } from "./db";
import type { ProductivityAnalysisResponse } from "./types";

const geminiApiKey = secret("GeminiApiKey");
const genAI = new GoogleGenerativeAI(geminiApiKey());

// Analyzes user's productivity patterns and provides insights.
export const analyzeProductivity = api<void, ProductivityAnalysisResponse>(
  { expose: true, method: "GET", path: "/ai/analyze-productivity", auth: true },
  async () => {
    const auth = getAuthData()!;
    
    // Get user's task completion data
    const taskData = await aiDB.queryAll<{
      completed: boolean,
      priority: number,
      category: string,
      created_at: Date,
      updated_at: Date,
      due_date: Date | null
    }>`
      SELECT 
        completed, 
        priority, 
        category, 
        created_at, 
        updated_at,
        due_date
      FROM todos 
      WHERE user_id = ${auth.userID} 
        AND created_at > NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
    `;
    
    if (taskData.length === 0) {
      return {
        insights: [
          "Start by creating some tasks to track your productivity!",
          "Set due dates for your tasks to better manage deadlines.",
          "Use categories to organize your tasks by type or project."
        ],
        recommendations: [
          "Create your first task to begin tracking productivity",
          "Set up categories like 'Work', 'Personal', and 'Health'",
          "Add due dates to important tasks"
        ],
        completionRate: 0,
        averageCompletionTime: "No data available",
        mostProductiveCategory: "No data available"
      };
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Calculate basic metrics
    const completedTasks = taskData.filter(t => t.completed).length;
    const completionRate = Math.round((completedTasks / taskData.length) * 100);
    
    // Calculate average completion time for completed tasks
    const completedTasksWithTime = taskData.filter(t => 
      t.completed && t.created_at && t.updated_at
    );
    
    let averageCompletionTime = "No data available";
    if (completedTasksWithTime.length > 0) {
      const totalTime = completedTasksWithTime.reduce((sum, task) => {
        const timeDiff = new Date(task.updated_at).getTime() - new Date(task.created_at).getTime();
        return sum + timeDiff;
      }, 0);
      const avgHours = Math.round(totalTime / (1000 * 60 * 60 * completedTasksWithTime.length));
      averageCompletionTime = avgHours < 24 ? `${avgHours} hours` : `${Math.round(avgHours / 24)} days`;
    }
    
    // Find most productive category
    const categoryStats = taskData.reduce((acc, task) => {
      const category = task.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { total: 0, completed: 0 };
      }
      acc[category].total++;
      if (task.completed) {
        acc[category].completed++;
      }
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);
    
    const mostProductiveCategory = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        rate: stats.total > 0 ? stats.completed / stats.total : 0
      }))
      .sort((a, b) => b.rate - a.rate)[0]?.category || 'No data available';
    
    const prompt = `
      Analyze this user's productivity data and provide insights and recommendations:
      
      Total tasks: ${taskData.length}
      Completed tasks: ${completedTasks}
      Completion rate: ${completionRate}%
      Most productive category: ${mostProductiveCategory}
      Average completion time: ${averageCompletionTime}
      
      Task breakdown by category:
      ${Object.entries(categoryStats).map(([cat, stats]) => 
        `${cat}: ${stats.completed}/${stats.total} completed (${Math.round(stats.completed/stats.total*100)}%)`
      ).join('\n')}
      
      Overdue tasks: ${taskData.filter(t => !t.completed && t.due_date && new Date(t.due_date) < new Date()).length}
      
      Please provide:
      1. 3-5 insights about their productivity patterns
      2. 3-5 actionable recommendations for improvement
      
      Respond in JSON format:
      {
        "insights": ["insight1", "insight2", ...],
        "recommendations": ["rec1", "rec2", ...]
      }
      
      Make the insights specific and the recommendations actionable.
    `;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in AI response");
      }
      
      const aiResponse = JSON.parse(jsonMatch[0]);
      
      return {
        insights: aiResponse.insights || [],
        recommendations: aiResponse.recommendations || [],
        completionRate,
        averageCompletionTime,
        mostProductiveCategory
      };
    } catch (error) {
      console.error("AI analysis error:", error);
      
      // Fallback analysis
      return {
        insights: [
          `Your completion rate is ${completionRate}% - ${completionRate >= 70 ? 'Great job!' : 'there\'s room for improvement'}`,
          `You're most productive in the ${mostProductiveCategory} category`,
          taskData.filter(t => !t.completed && t.due_date && new Date(t.due_date) < new Date()).length > 0 
            ? "You have some overdue tasks that need attention"
            : "You're staying on top of your deadlines"
        ],
        recommendations: [
          completionRate < 70 ? "Try breaking large tasks into smaller, manageable pieces" : "Keep up the great work!",
          "Set realistic due dates for your tasks",
          "Review and prioritize your tasks daily"
        ],
        completionRate,
        averageCompletionTime,
        mostProductiveCategory
      };
    }
  }
);
