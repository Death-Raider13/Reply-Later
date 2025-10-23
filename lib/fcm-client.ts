'use client';

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import app from './firebase';
import toast from 'react-hot-toast';

class FCMClientService {
  private messaging: any = null;
  private vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY || 'BKSvdBXVSf_IwxF5TSlddj-hAcsRPpyjZ0op9STQuQ2wHugWM9tvQPk-sNwX6jGQhiP9hqqpdAnIShF7NxzX_50';

  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      this.messaging = getMessaging(app);
      console.log('🔔 FCM Client initialized');
    } catch (error) {
      console.error('❌ FCM initialization failed:', error);
    }
  }

  async requestPermission(): Promise<string | null> {
    if (!this.messaging) {
      await this.initialize();
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        
        // Get FCM token
        const token = await getToken(this.messaging, {
          vapidKey: this.vapidKey
        });
        
        if (token) {
          console.log('🎯 FCM Token:', token);
          return token;
        } else {
          console.log('❌ No registration token available');
          return null;
        }
      } else {
        console.log('❌ Notification permission denied');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  }

  setupForegroundListener(): void {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      console.log('📱 Foreground message received:', payload);
      
      // Show toast notification when app is in foreground
      toast.success(
        `⏰ ${payload.notification?.title}\n${payload.notification?.body}`,
        {
          duration: 5000,
          position: 'top-right'
        }
      );
    });
  }

  async saveFCMToken(userId: string, token: string): Promise<void> {
    try {
      // Save FCM token to Firestore for this user
      const { reminderService } = await import('./firestore');
      
      // We'll need to add this method to firestore service
      console.log('💾 Saving FCM token for user:', userId);
      // await reminderService.saveFCMToken(userId, token);
    } catch (error) {
      console.error('❌ Error saving FCM token:', error);
    }
  }
}

export const fcmClientService = new FCMClientService();
