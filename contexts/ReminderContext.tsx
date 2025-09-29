
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Reminder, POSTPONE_OPTIONS } from '../types/reminder';
import { ReminderStorage } from '../services/reminderStorage';
import { NotificationService } from '../services/notificationService';
import { BackgroundTaskManager } from '../utils/backgroundTasks';
import * as Notifications from 'expo-notifications';

interface ReminderContextType {
  activeReminders: Reminder[];
  completedReminders: Reminder[];
  loading: boolean;
  addReminder: (title: string, description: string, dateTime: Date) => Promise<void>;
  updateReminder: (reminder: Reminder) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  completeReminder: (id: string) => Promise<void>;
  postponeReminder: (id: string, minutes: number) => Promise<void>;
  refreshReminders: () => Promise<void>;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
};

export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeReminders, setActiveReminders] = useState<Reminder[]>([]);
  const [completedReminders, setCompletedReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshReminders = useCallback(async () => {
    try {
      setLoading(true);
      const active = await ReminderStorage.getActiveReminders();
      const completed = await ReminderStorage.getCompletedReminders();
      
      // Sort by date
      active.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
      completed.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      
      setActiveReminders(active);
      setCompletedReminders(completed);
    } catch (error) {
      console.log('Error refreshing reminders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addReminder = useCallback(async (title: string, description: string, dateTime: Date) => {
    try {
      const reminder: Reminder = {
        id: Date.now().toString(),
        title,
        description,
        dateTime,
        isCompleted: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Schedule notification
      const notificationId = await NotificationService.scheduleNotification(reminder);
      if (notificationId) {
        reminder.notificationId = notificationId;
      }

      await ReminderStorage.addReminder(reminder);
      await refreshReminders();
    } catch (error) {
      console.log('Error adding reminder:', error);
    }
  }, [refreshReminders]);

  const updateReminder = useCallback(async (reminder: Reminder) => {
    try {
      reminder.updatedAt = new Date();
      
      // Cancel old notification and schedule new one if needed
      if (reminder.notificationId) {
        await NotificationService.cancelNotification(reminder.notificationId);
      }
      
      if (reminder.isActive && !reminder.isCompleted) {
        const notificationId = await NotificationService.scheduleNotification(reminder);
        if (notificationId) {
          reminder.notificationId = notificationId;
        }
      }

      await ReminderStorage.updateReminder(reminder);
      await refreshReminders();
    } catch (error) {
      console.log('Error updating reminder:', error);
    }
  }, [refreshReminders]);

  const deleteReminder = useCallback(async (id: string) => {
    try {
      const reminder = [...activeReminders, ...completedReminders].find(r => r.id === id);
      if (reminder?.notificationId) {
        await NotificationService.cancelNotification(reminder.notificationId);
      }
      
      await ReminderStorage.deleteReminder(id);
      await refreshReminders();
    } catch (error) {
      console.log('Error deleting reminder:', error);
    }
  }, [activeReminders, completedReminders, refreshReminders]);

  const completeReminder = useCallback(async (id: string) => {
    try {
      const reminder = activeReminders.find(r => r.id === id);
      if (reminder) {
        reminder.isCompleted = true;
        reminder.isActive = false;
        reminder.updatedAt = new Date();
        
        if (reminder.notificationId) {
          await NotificationService.cancelNotification(reminder.notificationId);
        }
        
        await ReminderStorage.updateReminder(reminder);
        await refreshReminders();
      }
    } catch (error) {
      console.log('Error completing reminder:', error);
    }
  }, [activeReminders, refreshReminders]);

  const postponeReminder = useCallback(async (id: string, minutes: number) => {
    try {
      const reminder = activeReminders.find(r => r.id === id);
      if (reminder) {
        const newDateTime = new Date(reminder.dateTime.getTime() + minutes * 60 * 1000);
        reminder.dateTime = newDateTime;
        reminder.updatedAt = new Date();
        
        await updateReminder(reminder);
      }
    } catch (error) {
      console.log('Error postponing reminder:', error);
    }
  }, [activeReminders, updateReminder]);

  useEffect(() => {
    const initializeApp = async () => {
      await refreshReminders();
      await BackgroundTaskManager.initializeBackgroundTasks();
    };
    
    initializeApp();
    
    // Set up notification listeners
    const notificationListener = NotificationService.addNotificationListener((notification) => {
      console.log('Notification received:', notification);
    });

    const responseListener = NotificationService.addNotificationResponseListener((response) => {
      console.log('Notification response:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [refreshReminders]);

  const value: ReminderContextType = {
    activeReminders,
    completedReminders,
    loading,
    addReminder,
    updateReminder,
    deleteReminder,
    completeReminder,
    postponeReminder,
    refreshReminders,
  };

  return (
    <ReminderContext.Provider value={value}>
      {children}
    </ReminderContext.Provider>
  );
};
