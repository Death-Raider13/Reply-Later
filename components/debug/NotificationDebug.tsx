'use client';

import { useState } from 'react';
import { notificationService } from '@/lib/notifications';
import { useAuth } from '@/components/providers/AuthProvider';
import toast from 'react-hot-toast';

export function NotificationDebug() {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  const handleManualCheck = async () => {
    if (!user) {
      toast.error('Please log in first');
      return;
    }

    setIsChecking(true);
    try {
      // Manually trigger the check function
      console.log('🔍 Manual notification check triggered');
      
      // Access the private method by calling it through the service
      // We'll need to make it public temporarily for debugging
      await (notificationService as any).checkDueReminders();
      
      toast.success('✅ Manual check completed - see console for details');
    } catch (error) {
      console.error('❌ Manual check failed:', error);
      toast.error('Manual check failed - see console');
    } finally {
      setIsChecking(false);
    }
  };

  const handleForceNotification = async () => {
    try {
      console.log('🧪 Forcing test notification');
      await notificationService.testNotification();
      toast.success('🔔 Test notification sent');
    } catch (error) {
      console.error('❌ Test notification failed:', error);
      toast.error('Test notification failed');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
      <h3 className="font-semibold text-sm mb-3 text-gray-800">🔧 Notification Debug</h3>
      <div className="space-y-2">
        <button
          onClick={handleManualCheck}
          disabled={isChecking}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-xs px-3 py-2 rounded transition-colors"
        >
          {isChecking ? 'Checking...' : '🔍 Manual Check'}
        </button>
        
        <button
          onClick={handleForceNotification}
          className="w-full bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-2 rounded transition-colors"
        >
          🧪 Test Notification
        </button>
        
        <p className="text-xs text-gray-600 mt-2">
          Check browser console (F12) for detailed logs
        </p>
      </div>
    </div>
  );
}
