'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Header } from './Header';
import { ReminderCard } from '@/components/reminders/ReminderCard';
import { AddReminderModal } from '@/components/reminders/AddReminderModal';
import { ReplySuggestionsModal } from '@/components/ai/ReplySuggestionsModal';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { reminderService } from '@/lib/firestore';
import { notificationService } from '@/lib/notifications';
import { Reminder } from '@/lib/types';
import { Calendar, CheckCircle, Clock, Plus, MessageSquare, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'snoozed'>('all');

  useEffect(() => {
    if (!user) return;

    const unsubscribe = reminderService.subscribeToUserReminders(
      user.uid, 
      (updatedReminders) => {
        setReminders(updatedReminders);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore error:', error);
        toast.error('Failed to connect to database. Please check your Firestore setup.');
        setLoading(false);
      }
    );

    // Initialize notifications (only once)
    const initNotifications = async () => {
      // Check if notifications are already granted to avoid duplicate toasts
      if (Notification.permission === 'granted') {
        notificationService.startMonitoring(user.uid);
        return;
      }
      
      // Only show toast if permission is denied or default
      if (Notification.permission === 'default') {
        // Don't auto-request permission, just start monitoring
        notificationService.startMonitoring(user.uid);
      } else if (Notification.permission === 'denied') {
        // Only show one toast for denied permission
        toast.error('⚠️ Notifications are blocked. Click the bell icon to enable them.');
      }
    };

    initNotifications();

    // Set a timeout to stop loading after 10 seconds
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        toast.error('Database connection timeout. Please check your Firebase configuration.');
      }
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [user, loading]);

  const handleAddReminder = async (reminderData: {
    title: string;
    platform: string;
    reminderTime: Date;
    note?: string;
  }) => {
    if (!user) return;

    try {
      await reminderService.addReminder(user.uid, {
        ...reminderData,
        status: 'pending',
      });
      toast.success('Reminder added successfully!');
    } catch (error) {
      toast.error('Failed to add reminder');
      throw error;
    }
  };

  const handleCompleteReminder = async (reminderId: string) => {
    try {
      await reminderService.updateReminderStatus(reminderId, 'completed');
      toast.success('Reminder marked as completed!');
    } catch (error) {
      toast.error('Failed to update reminder');
    }
  };

  const handleSnoozeReminder = async (reminderId: string) => {
    try {
      await reminderService.snoozeReminder(reminderId);
      toast.success('Reminder snoozed for 1 hour');
    } catch (error) {
      toast.error('Failed to snooze reminder');
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      await reminderService.deleteReminder(reminderId);
      toast.success('Reminder deleted');
    } catch (error) {
      toast.error('Failed to delete reminder');
    }
  };

  const handleGetSuggestions = (reminderId: string) => {
    const reminder = reminders.find((r: Reminder) => r.id === reminderId);
    if (reminder) {
      setSelectedReminder(reminder);
      setShowAIModal(true);
    }
  };

  const filteredReminders = reminders.filter(reminder => {
    if (filter === 'all') return true;
    return reminder.status === filter;
  });

  const stats = {
    total: reminders.length,
    pending: reminders.filter(r => r.status === 'pending').length,
    completed: reminders.filter(r => r.status === 'completed').length,
    overdue: reminders.filter(r => 
      r.status === 'pending' && new Date(r.reminderTime) < new Date()
    ).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header 
        onAddReminder={() => setShowAddModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
      />
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reminders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'all', label: 'All', count: stats.total },
            { key: 'pending', label: 'Pending', count: stats.pending },
            { key: 'completed', label: 'Completed', count: stats.completed },
            { key: 'snoozed', label: 'Snoozed', count: reminders.filter(r => r.status === 'snoozed').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Reminders List */}
        {filteredReminders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No reminders yet' : `No ${filter} reminders`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Create your first reminder to get started!'
                : `You don't have any ${filter} reminders at the moment.`
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Reminder
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onComplete={handleCompleteReminder}
                onSnooze={handleSnoozeReminder}
                onDelete={handleDeleteReminder}
                onGetSuggestions={handleGetSuggestions}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <AddReminderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddReminder}
      />
      
      {selectedReminder && (
        <ReplySuggestionsModal
          isOpen={showAIModal}
          onClose={() => {
            setShowAIModal(false);
            setSelectedReminder(null);
          }}
          reminder={selectedReminder}
        />
      )}
    </div>
  );
}
