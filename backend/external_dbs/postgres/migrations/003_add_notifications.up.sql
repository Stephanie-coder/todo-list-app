-- Add notifications table for user alerts
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Add user preferences table
CREATE TABLE user_preferences (
  user_id TEXT PRIMARY KEY,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_time INTEGER NOT NULL DEFAULT 9, -- hour of day (0-23)
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add activity log table
CREATE TABLE activity_log (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'completed'
  entity_type TEXT NOT NULL, -- 'todo'
  entity_id BIGINT NOT NULL,
  details JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

-- Add function to automatically create notifications for overdue todos
CREATE OR REPLACE FUNCTION create_overdue_notifications()
RETURNS void AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type)
  SELECT 
    t.user_id,
    'Overdue Task',
    'Task "' || t.title || '" is overdue',
    'warning'
  FROM todos t
  WHERE t.due_date < NOW()
    AND t.completed = FALSE
    AND t.user_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.user_id = t.user_id 
        AND n.message LIKE '%' || t.title || '%'
        AND n.type = 'warning'
        AND n.created_at > NOW() - INTERVAL '1 day'
    );
END;
$$ LANGUAGE plpgsql;
