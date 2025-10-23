import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatReminderTime(date: Date): string {
  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }
  if (isTomorrow(date)) {
    return `Tomorrow at ${format(date, 'h:mm a')}`;
  }
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }
  return format(date, 'MMM d, yyyy \'at\' h:mm a');
}

export function getTimeUntilReminder(date: Date): string {
  const now = new Date();
  if (date < now) {
    return 'Overdue';
  }
  return formatDistanceToNow(date, { addSuffix: true });
}

export function getPlatformIcon(platform: string): string {
  const platformIcons: Record<string, string> = {
    whatsapp: '💬',
    email: '📧',
    instagram: '📷',
    twitter: '🐦',
    linkedin: '💼',
    telegram: '✈️',
    discord: '🎮',
    slack: '💬',
    other: '📱',
  };
  
  return platformIcons[platform.toLowerCase()] || platformIcons.other;
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    snoozed: 'bg-blue-100 text-blue-800',
  };
  
  return statusColors[status] || statusColors.pending;
}
