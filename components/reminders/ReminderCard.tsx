'use client';

import { useState } from 'react';
import { Reminder } from '@/lib/types';
import { formatReminderTime, getTimeUntilReminder, getPlatformIcon, getStatusColor } from '@/lib/utils';
import { Clock, MessageSquare, MoreVertical, CheckCircle, Timer, Trash2, Lightbulb } from 'lucide-react';

interface ReminderCardProps {
  reminder: Reminder;
  onComplete: (id: string) => void;
  onSnooze: (id: string) => void;
  onDelete: (id: string) => void;
  onGetSuggestions: (id: string) => void;
}

export function ReminderCard({ 
  reminder, 
  onComplete, 
  onSnooze, 
  onDelete, 
  onGetSuggestions 
}: ReminderCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const isOverdue = new Date(reminder.reminderTime) < new Date() && reminder.status === 'pending';

  return (
    <div className={`bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 relative ${isOverdue ? 'border-red-200 bg-red-50' : ''} animate-slide-up`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">{getPlatformIcon(reminder.platform)}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reminder.status)}`}>
              {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{reminder.title}</h3>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Clock className="w-4 h-4 mr-1" />
            <span>{formatReminderTime(new Date(reminder.reminderTime))}</span>
            <span className={`ml-2 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              ({getTimeUntilReminder(new Date(reminder.reminderTime))})
            </span>
          </div>

          {reminder.note && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2 mb-3">
              {reminder.note}
            </p>
          )}

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {reminder.platform}
            </span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[160px]">
              {reminder.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      onGetSuggestions(reminder.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Get Reply Suggestions
                  </button>
                  <button
                    onClick={() => {
                      onComplete(reminder.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Replied
                  </button>
                  <button
                    onClick={() => {
                      onSnooze(reminder.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Timer className="w-4 h-4 mr-2" />
                    Snooze
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  onDelete(reminder.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick action buttons for pending reminders */}
      {reminder.status === 'pending' && (
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => onGetSuggestions(reminder.id)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Get Suggestions
          </button>
          <button
            onClick={() => onComplete(reminder.id)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Mark Replied
          </button>
        </div>
      )}
    </div>
  );
}
