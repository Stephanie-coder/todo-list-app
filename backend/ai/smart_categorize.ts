import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SmartCategorizeRequest, SmartCategorizeResponse } from "./types";

const geminiApiKey = secret("GeminiApiKey");
const genAI = new GoogleGenerativeAI(geminiApiKey());

// Automatically categorizes and prioritizes a task based on its content.
export const smartCategorize = api<SmartCategorizeRequest, SmartCategorizeResponse>(
  { expose: true, method: "POST", path: "/ai/smart-categorize" },
  async (req) => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      Analyze this task and suggest an appropriate category and priority:
      
      Title: "${req.title}"
      Description: "${req.description || 'No description provided'}"
      
      Please respond with JSON in this exact format:
      {
        "category": "suggested category",
        "priority": number (1-3, where 1=low, 2=medium, 3=high),
        "reasoning": "brief explanation of the categorization"
      }
      
      Common categories include: Work, Personal, Health, Learning, Finance, Home, Shopping, Travel, etc.
      
      Priority guidelines:
      - 3 (High): Urgent deadlines, important meetings, critical tasks
      - 2 (Medium): Important but not urgent, regular work tasks
      - 1 (Low): Nice to have, routine tasks, long-term goals
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
        category: aiResponse.category || "Personal",
        priority: Math.max(1, Math.min(3, aiResponse.priority || 1)),
        reasoning: aiResponse.reasoning || "Automatically categorized based on task content"
      };
    } catch (error) {
      console.error("AI categorization error:", error);
      
      // Fallback categorization based on keywords
      const title = req.title.toLowerCase();
      const description = (req.description || '').toLowerCase();
      const content = `${title} ${description}`;
      
      let category = "Personal";
      let priority = 1;
      
      if (content.includes('work') || content.includes('meeting') || content.includes('project') || content.includes('deadline')) {
        category = "Work";
        priority = 2;
      } else if (content.includes('health') || content.includes('doctor') || content.includes('exercise') || content.includes('gym')) {
        category = "Health";
        priority = 2;
      } else if (content.includes('learn') || content.includes('study') || content.includes('course') || content.includes('read')) {
        category = "Learning";
        priority = 1;
      } else if (content.includes('buy') || content.includes('shop') || content.includes('purchase')) {
        category = "Shopping";
        priority = 1;
      } else if (content.includes('urgent') || content.includes('asap') || content.includes('important')) {
        priority = 3;
      }
      
      return {
        category,
        priority,
        reasoning: "Categorized based on keyword analysis"
      };
    }
  }
);
