export interface Reminder {
  id: string;
  userId: string;
  title: string;
  platform: string;
  reminderTime: Date;
  note?: string;
  status: 'pending' | 'completed' | 'snoozed' | 'notified';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notificationType: 'browser' | 'email' | 'both';
  defaultReplyTone: 'friendly' | 'professional' | 'casual' | 'apologetic';
  timezone: string;
  smartScheduling: boolean;
}

export interface AIReplyTemplate {
  id: string;
  category: 'friendly' | 'professional' | 'apologetic' | 'casual';
  template: string;
  editable: boolean;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    reminderId: string;
    url: string;
  };
}
