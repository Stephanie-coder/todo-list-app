// Application configuration
export const config = {
  // Notification settings
  notifications: {
    // How often to check for new notifications (in milliseconds)
    pollInterval: 30000, // 30 seconds
    // Maximum number of notifications to show in the dropdown
    maxDisplayCount: 10,
  },
  
  // Todo settings
  todos: {
    // Default page size for todo lists
    defaultPageSize: 20,
    // Auto-save delay for todo edits (in milliseconds)
    autoSaveDelay: 1000,
  },
  
  // UI settings
  ui: {
    // Theme settings
    defaultTheme: 'light' as 'light' | 'dark' | 'system',
    // Animation duration for transitions
    animationDuration: 200,
  }
};
