export interface UserPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderTime: number; // hour of day (0-23)
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdatePreferencesRequest {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  reminderTime?: number;
  timezone?: string;
}
