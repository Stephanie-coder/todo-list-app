import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Sparkles, Brain, TrendingUp, Wand2, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { TaskSuggestion, ProductivityAnalysisResponse } from "~backend/ai/types";

interface AIAssistantProps {
  open: boolean;
  onClose: () => void;
  onTaskSuggestionAccept: (suggestion: TaskSuggestion) => void;
}

export default function AIAssistant({ open, onClose, onTaskSuggestionAccept }: AIAssistantProps) {
  const [suggestionInput, setSuggestionInput] = useState("");
  const [categorizeTitle, setCategorizeTitle] = useState("");
  const [categorizeDescription, setCategorizeDescription] = useState("");
  const { toast } = useToast();

  const suggestTasksMutation = useMutation({
    mutationFn: async (input: string) => {
      return await backend.ai.suggestTasks({ input });
    },
    onError: (error) => {
      console.error("Failed to get task suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to get AI suggestions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const categorizeMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      return await backend.ai.smartCategorize(data);
    },
    onError: (error) => {
      console.error("Failed to categorize task:", error);
      toast({
        title: "Error",
        description: "Failed to categorize task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: productivityAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["productivity-analysis"],
    queryFn: async () => {
      return await backend.ai.analyzeProductivity();
    },
    enabled: open,
  });

  const handleSuggestTasks = () => {
    if (!suggestionInput.trim()) return;
    suggestTasksMutation.mutate(suggestionInput.trim());
  };

  const handleCategorizeTask = () => {
    if (!categorizeTitle.trim()) return;
    categorizeMutation.mutate({
      title: categorizeTitle.trim(),
      description: categorizeDescription.trim() || undefined,
    });
  };

  const handleAcceptSuggestion = (suggestion: TaskSuggestion) => {
    onTaskSuggestionAccept(suggestion);
    toast({
      title: "Task Added",
      description: `"${suggestion.title}" has been added to your tasks.`,
    });
  };

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Assistant
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Task Suggestions
            </TabsTrigger>
            <TabsTrigger value="categorize" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Smart Categorize
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Productivity Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Get Task Suggestions
                </CardTitle>
                <CardDescription>
                  Describe what you want to accomplish, and I'll suggest specific tasks to help you get there.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., I want to improve my health, prepare for a presentation, organize my home..."
                    value={suggestionInput}
                    onChange={(e) => setSuggestionInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSuggestTasks()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSuggestTasks}
                    disabled={!suggestionInput.trim() || suggestTasksMutation.isPending}
                  >
                    {suggestTasksMutation.isPending ? "Thinking..." : "Suggest"}
                  </Button>
                </div>

                {suggestTasksMutation.data?.suggestions && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Suggested Tasks:</h4>
                    {suggestTasksMutation.data.suggestions.map((suggestion, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 mb-1">{suggestion.title}</h5>
                              <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline">{suggestion.category}</Badge>
                                <Badge className={getPriorityColor(suggestion.priority)}>
                                  {getPriorityLabel(suggestion.priority)} Priority
                                </Badge>
                                <Badge variant="secondary">{suggestion.estimatedDuration}</Badge>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAcceptSuggestion(suggestion)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Add Task
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categorize" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-purple-600" />
                  Smart Task Categorization
                </CardTitle>
                <CardDescription>
                  Let AI suggest the best category and priority for your task based on its content.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Input
                    placeholder="Task title"
                    value={categorizeTitle}
                    onChange={(e) => setCategorizeTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Task description (optional)"
                    value={categorizeDescription}
                    onChange={(e) => setCategorizeDescription(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={handleCategorizeTask}
                    disabled={!categorizeTitle.trim() || categorizeMutation.isPending}
                    className="w-full"
                  >
                    {categorizeMutation.isPending ? "Analyzing..." : "Categorize Task"}
                  </Button>
                </div>

                {categorizeMutation.data && (
                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <h5 className="font-medium text-gray-900 mb-2">AI Suggestion:</h5>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Category:</span>
                          <Badge variant="outline">{categorizeMutation.data.category}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Priority:</span>
                          <Badge className={getPriorityColor(categorizeMutation.data.priority)}>
                            {getPriorityLabel(categorizeMutation.data.priority)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Reasoning:</span> {categorizeMutation.data.reasoning}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Productivity Analysis
                </CardTitle>
                <CardDescription>
                  AI-powered insights into your productivity patterns and personalized recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysisLoading ? (
                  <div className="space-y-3">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ) : productivityAnalysis ? (
                  <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{productivityAnalysis.completionRate}%</div>
                        <div className="text-sm text-gray-600">Completion Rate</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{productivityAnalysis.averageCompletionTime}</div>
                        <div className="text-sm text-gray-600">Avg. Completion</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg col-span-2">
                        <div className="text-lg font-bold text-purple-600">{productivityAnalysis.mostProductiveCategory}</div>
                        <div className="text-sm text-gray-600">Most Productive Category</div>
                      </div>
                    </div>

                    {/* Insights */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        AI Insights
                      </h4>
                      <div className="space-y-2">
                        {productivityAnalysis.insights.map((insight, index) => (
                          <div key={index} className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
                            <p className="text-sm text-gray-700">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Recommendations
                      </h4>
                      <div className="space-y-2">
                        {productivityAnalysis.recommendations.map((recommendation, index) => (
                          <div key={index} className="p-3 bg-green-50 border-l-4 border-green-400 rounded-r">
                            <p className="text-sm text-gray-700">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No analysis data available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
