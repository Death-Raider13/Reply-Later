import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { Reminder } from './types';

export const reminderService = {
  // Add a new reminder
  async addReminder(
    userId: string,
    reminderData: {
      title: string;
      platform: string;
      reminderTime: Date;
      note?: string;
      status: 'pending' | 'completed' | 'snoozed';
    }
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'reminders'), {
        userId,
        title: reminderData.title,
        platform: reminderData.platform,
        reminderTime: Timestamp.fromDate(reminderData.reminderTime),
        note: reminderData.note || '',
        status: reminderData.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding reminder:', error);
      throw new Error('Failed to add reminder');
    }
  },

  // Update reminder status
  async updateReminderStatus(
    reminderId: string,
    status: 'pending' | 'completed' | 'snoozed'
  ): Promise<void> {
    try {
      const reminderRef = doc(db, 'reminders', reminderId);
      await updateDoc(reminderRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating reminder status:', error);
      throw new Error('Failed to update reminder status');
    }
  },

  // Snooze a reminder (add 1 hour to reminder time)
  async snoozeReminder(reminderId: string): Promise<void> {
    try {
      const newTime = new Date();
      newTime.setHours(newTime.getHours() + 1);
      
      const reminderRef = doc(db, 'reminders', reminderId);
      await updateDoc(reminderRef, {
        reminderTime: Timestamp.fromDate(newTime),
        status: 'snoozed',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error snoozing reminder:', error);
      throw new Error('Failed to snooze reminder');
    }
  },

  // Delete a reminder
  async deleteReminder(reminderId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'reminders', reminderId));
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw new Error('Failed to delete reminder');
    }
  },

  // Subscribe to user's reminders (real-time updates)
  subscribeToUserReminders(
    userId: string,
    callback: (reminders: Reminder[]) => void,
    errorCallback?: (error: any) => void
  ): () => void {
    const q = query(
      collection(db, 'reminders'),
      where('userId', '==', userId),
      orderBy('reminderTime', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const reminders: Reminder[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          reminders.push({
            id: doc.id,
            userId: data.userId,
            title: data.title,
            platform: data.platform,
            reminderTime: data.reminderTime.toDate(),
            note: data.note,
            status: data.status,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        });
        callback(reminders);
      },
      (error) => {
        console.error('Error fetching reminders:', error);
        if (errorCallback) {
          errorCallback(error);
        } else {
          callback([]);
        }
      }
    );

    return unsubscribe;
  },

  // Get overdue reminders for notifications
  async getOverdueReminders(userId: string): Promise<Reminder[]> {
    try {
      const now = new Date();
      const q = query(
        collection(db, 'reminders'),
        where('userId', '==', userId),
        where('status', '==', 'pending'),
        where('reminderTime', '<=', Timestamp.fromDate(now))
      );

      return new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const reminders: Reminder[] = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              reminders.push({
                id: doc.id,
                userId: data.userId,
                title: data.title,
                platform: data.platform,
                reminderTime: data.reminderTime.toDate(),
                note: data.note,
                status: data.status,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
              });
            });
            unsubscribe();
            resolve(reminders);
          },
          (error) => {
            console.error('Error fetching overdue reminders:', error);
            unsubscribe();
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error('Error getting overdue reminders:', error);
      throw new Error('Failed to get overdue reminders');
    }
  },

  // Get user reminders (for notification checking)
  async getUserReminders(userId: string): Promise<Reminder[]> {
    try {
      const q = query(
        collection(db, 'reminders'),
        where('userId', '==', userId),
        orderBy('reminderTime', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const reminders: Reminder[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reminders.push({
          id: doc.id,
          userId: data.userId,
          title: data.title,
          platform: data.platform,
          reminderTime: data.reminderTime.toDate(),
          note: data.note,
          status: data.status,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      
      return reminders;
    } catch (error) {
      console.error('Error getting user reminders:', error);
      throw new Error('Failed to get user reminders');
    }
  },

  // Update reminder (generic update method)
  async updateReminder(reminderId: string, reminderData: Partial<Reminder>): Promise<void> {
    try {
      const reminderRef = doc(db, 'reminders', reminderId);
      const updateData: any = {
        ...reminderData,
        updatedAt: serverTimestamp(),
      };
      
      // Convert Date objects to Timestamps
      if (reminderData.reminderTime) {
        updateData.reminderTime = Timestamp.fromDate(reminderData.reminderTime);
      }
      if (reminderData.createdAt) {
        updateData.createdAt = Timestamp.fromDate(reminderData.createdAt);
      }
      
      await updateDoc(reminderRef, updateData);
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw new Error('Failed to update reminder');
    }
  },
};
