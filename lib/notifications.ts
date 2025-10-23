'use client';

import { Reminder } from './types';
// import { fcmClientService } from './fcm-client'; // Temporarily disabled

class NotificationService {
  private static instance: NotificationService;
  private checkInterval: NodeJS.Timeout | null = null;
  private userId: string | null = null;
  private fcmToken: string | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async showNotification(reminder: Reminder): Promise<void> {
    // TODO: Re-enable FCM once undici issue is resolved
    // Try FCM first (works even when tab is closed)
    /*
    if (this.fcmToken) {
      try {
        console.log('📱 Sending FCM notification for:', reminder.title);
        
        const response = await fetch('/api/send-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: this.fcmToken,
            title: '⏰ Time to Reply!',
            body: `Don't forget to reply to "${reminder.title}" on ${reminder.platform}`,
            reminderId: reminder.id,
            userId: this.userId,
          }),
        });

        if (response.ok) {
          console.log('✅ FCM notification sent successfully');
          return;
        } else {
          console.log('❌ FCM notification failed, falling back to browser notification');
        }
      } catch (error) {
        console.error('❌ FCM notification error:', error);
      }
    }
    */

    // Fallback to browser notification
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      // Fallback to browser alert if notifications not available
      this.showBrowserAlert(reminder);
      return;
    }

    const notification = new Notification(`⏰ Time to Reply!`, {
      body: `Don't forget to reply to "${reminder.title}" on ${reminder.platform}`,
      icon: '/notification-icon.svg',
      tag: reminder.id,
      requireInteraction: true
    });

    notification.onclick = () => {
      window.focus();
      // Open the app and focus on this reminder
      window.location.href = `/?reminder=${reminder.id}`;
      notification.close();
    };

    // Auto-close after 30 seconds
    setTimeout(() => {
      notification.close();
    }, 30000);
  }

  private showBrowserAlert(reminder: Reminder): void {
    const message = `⏰ REMINDER: Time to reply to "${reminder.title}" on ${reminder.platform}!\n\nClick OK to open ReplyLater.`;
    
    if (confirm(message)) {
      window.focus();
      window.location.href = `/?reminder=${reminder.id}`;
    }
  }

  startMonitoring(userId: string): void {
    this.userId = userId;
    this.stopMonitoring(); // Clear any existing interval
    
    console.log('🔔 Starting notification monitoring for user:', userId);
    
    // Check for due reminders every 30 seconds (more frequent)
    this.checkInterval = setInterval(() => {
      console.log('⏰ Checking for due reminders...');
      this.checkDueReminders();
    }, 30000); // 30 seconds

    // Add Page Visibility API to check when tab becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Tab became active - checking for missed notifications...');
        this.checkDueReminders();
      }
    };

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also check immediately
    console.log('🔍 Initial check for due reminders...');
    this.checkDueReminders();
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  async checkDueReminders(): Promise<void> {
    if (!this.userId) {
      console.log('❌ No userId set for notification monitoring');
      return;
    }

    try {
      // Import reminderService dynamically to avoid circular imports
      const { reminderService } = await import('./firestore');
      
      // Get all pending reminders for this user
      const reminders = await reminderService.getUserReminders(this.userId);
      const now = new Date();
      console.log(`📋 Found ${reminders.length} total reminders for user`);
      
      const dueReminders = reminders.filter(reminder => 
        reminder.status === 'pending' && 
        new Date(reminder.reminderTime) <= now
      );
      
      console.log(`⏰ Found ${dueReminders.length} due reminders (pending and past due time)`);
      
      if (dueReminders.length === 0) {
        console.log('✅ No due reminders at this time');
        return;
      }

      for (const reminder of dueReminders) {
        console.log('🔔 Due reminder found:', reminder.title, 'at', reminder.reminderTime);
        
        try {
          // Force notification even if tab is inactive
          console.log('🚀 Forcing notification for:', reminder.title);
          await this.showNotification(reminder);
          console.log('✅ Notification sent successfully for:', reminder.title);
          
          // Mark as notified to avoid duplicate notifications
          await reminderService.updateReminder(reminder.id, {
            ...reminder,
            status: 'notified'
          });
          console.log('📝 Reminder marked as notified:', reminder.title);
          
          // Also show browser alert as backup if tab is hidden
          if (document.hidden) {
            console.log('📱 Tab is hidden - showing backup browser alert');
            setTimeout(() => {
              this.showBrowserAlert(reminder);
            }, 1000);
          }
        } catch (notificationError) {
          console.error('❌ Failed to send notification for:', reminder.title, notificationError);
          // Fallback to browser alert
          console.log('🔄 Falling back to browser alert');
          this.showBrowserAlert(reminder);
          
          // Still mark as notified to avoid infinite retries
          await reminderService.updateReminder(reminder.id, {
            ...reminder,
            status: 'notified'
          });
        }
      }
    } catch (error) {
      console.error('Error checking due reminders:', error);
    }
  }

  // Test notification function
  async testNotification(): Promise<void> {
    const hasPermission = await this.requestPermission();
    
    if (hasPermission) {
      const testReminder: Reminder = {
        id: 'test',
        title: 'Test Message',
        platform: 'WhatsApp',
        reminderTime: new Date(),
        status: 'pending',
        userId: 'test',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await this.showNotification(testReminder);
    } else {
      alert('⚠️ Notifications are blocked! Please enable notifications in your browser settings to receive reminders.');
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
