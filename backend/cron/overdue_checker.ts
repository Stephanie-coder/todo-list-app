import { CronJob } from "encore.dev/cron";
import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const db = SQLDatabase.named("postgres");

// API endpoint for checking overdue todos
export const checkOverdueTodos = api<void, void>(
  { method: "POST", path: "/cron/check-overdue" },
  async () => {
    // Call the stored function to create overdue notifications
    await db.exec`SELECT create_overdue_notifications()`;
    
    // Also create reminders for todos due in the next 24 hours
    await db.exec`
      INSERT INTO notifications (user_id, title, message, type)
      SELECT 
        t.user_id,
        'Upcoming Deadline',
        'Task "' || t.title || '" is due tomorrow',
        'info'
      FROM todos t
      WHERE t.due_date BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
        AND t.completed = FALSE
        AND t.user_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM notifications n 
          WHERE n.user_id = t.user_id 
            AND n.message LIKE '%' || t.title || '%'
            AND n.type = 'info'
            AND n.created_at > NOW() - INTERVAL '1 day'
        )
    `;
  }
);

// Check for overdue todos and create notifications every hour
const overdueChecker = new CronJob("overdue-checker", {
  title: "Check for overdue todos",
  schedule: "0 * * * *", // Every hour
  endpoint: checkOverdueTodos,
});
