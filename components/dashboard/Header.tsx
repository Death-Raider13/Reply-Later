'use client';

import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/providers/AuthProvider';
import { Plus, Settings, LogOut, Bell } from 'lucide-react';
import { notificationService } from '@/lib/notifications';
import toast from 'react-hot-toast';

interface HeaderProps {
  onAddReminder: () => void;
  onOpenSettings: () => void;
}

export function Header({ onAddReminder, onOpenSettings }: HeaderProps) {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleTestNotification = async () => {
    try {
      const hasPermission = await notificationService.requestPermission();
      if (hasPermission) {
        await notificationService.testNotification();
        toast.success('🔔 Test notification sent! Check your desktop.');
      } else {
        toast.error('⚠️ Notifications are blocked. Please enable them in your browser settings.');
      }
    } catch (error) {
      console.error('Failed to test notification:', error);
      toast.error('Failed to test notification');
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">ReplyLater</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onAddReminder}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Reminder
            </button>

            <div className="flex items-center space-x-2">
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user?.displayName || user?.email}
              </span>
            </div>

            <button
              onClick={handleTestNotification}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Test Notification"
            >
              <Bell className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
