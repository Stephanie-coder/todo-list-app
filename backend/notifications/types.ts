export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  expiresAt?: Date;
}

export interface ListNotificationsResponse {
  notifications: Notification[];
  total: number;
}
