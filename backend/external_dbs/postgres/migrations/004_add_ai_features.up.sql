-- Add AI-related tables and features

-- Table to store AI suggestions and user feedback
CREATE TABLE ai_suggestions (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  suggestion_type TEXT NOT NULL, -- 'task_suggestion', 'categorization', 'productivity_insight'
  input_data JSONB NOT NULL,
  ai_response JSONB NOT NULL,
  user_feedback TEXT, -- 'helpful', 'not_helpful', 'partially_helpful'
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_suggestions_user_id ON ai_suggestions(user_id);
CREATE INDEX idx_ai_suggestions_type ON ai_suggestions(suggestion_type);
CREATE INDEX idx_ai_suggestions_created_at ON ai_suggestions(created_at);

-- Table to store user AI preferences
CREATE TABLE ai_preferences (
  user_id TEXT PRIMARY KEY,
  auto_categorize BOOLEAN NOT NULL DEFAULT TRUE,
  auto_prioritize BOOLEAN NOT NULL DEFAULT TRUE,
  suggestion_frequency TEXT NOT NULL DEFAULT 'daily', -- 'never', 'daily', 'weekly'
  preferred_categories TEXT[] DEFAULT ARRAY['Work', 'Personal', 'Health', 'Learning'],
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add AI-related columns to todos table
ALTER TABLE todos ADD COLUMN IF NOT EXISTS ai_suggested BOOLEAN DEFAULT FALSE;
ALTER TABLE todos ADD COLUMN IF NOT EXISTS ai_category_confidence DECIMAL(3,2); -- 0.00 to 1.00
ALTER TABLE todos ADD COLUMN IF NOT EXISTS estimated_duration TEXT;

-- Function to get productivity insights
CREATE OR REPLACE FUNCTION get_productivity_metrics(p_user_id TEXT, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_tasks INTEGER,
  completed_tasks INTEGER,
  completion_rate DECIMAL(5,2),
  avg_completion_time_hours DECIMAL(10,2),
  most_productive_category TEXT,
  overdue_tasks INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH task_stats AS (
    SELECT 
      COUNT(*)::INTEGER as total,
      COUNT(*) FILTER (WHERE completed = true)::INTEGER as completed,
      COUNT(*) FILTER (WHERE completed = false AND due_date < NOW())::INTEGER as overdue
    FROM todos 
    WHERE user_id = p_user_id 
      AND created_at > NOW() - INTERVAL '1 day' * p_days
  ),
  completion_times AS (
    SELECT 
      AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) as avg_hours
    FROM todos 
    WHERE user_id = p_user_id 
      AND completed = true 
      AND created_at > NOW() - INTERVAL '1 day' * p_days
  ),
  category_stats AS (
    SELECT 
      COALESCE(category, 'Uncategorized') as cat,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE completed = true) as completed
    FROM todos 
    WHERE user_id = p_user_id 
      AND created_at > NOW() - INTERVAL '1 day' * p_days
    GROUP BY COALESCE(category, 'Uncategorized')
    HAVING COUNT(*) > 0
    ORDER BY (COUNT(*) FILTER (WHERE completed = true)::DECIMAL / COUNT(*)) DESC
    LIMIT 1
  )
  SELECT 
    ts.total,
    ts.completed,
    CASE WHEN ts.total > 0 THEN (ts.completed::DECIMAL / ts.total * 100) ELSE 0 END,
    COALESCE(ct.avg_hours, 0),
    COALESCE(cs.cat, 'No data'),
    ts.overdue
  FROM task_stats ts
  CROSS JOIN completion_times ct
  LEFT JOIN category_stats cs ON true;
END;
$$ LANGUAGE plpgsql;
