
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
      console.log('Refreshing reminders...');
      setLoading(true);
      const active = await ReminderStorage.getActiveReminders();
      const completed = await ReminderStorage.getCompletedReminders();
      
      console.log('Active reminders loaded:', active.length);
      console.log('Completed reminders loaded:', completed.length);
      
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
      console.log('Adding reminder:', { title, description, dateTime });
      
      const reminder: Reminder = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title,
        description,
        dateTime,
        isCompleted: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('Created reminder object:', reminder);

      // Schedule notification
      const notificationId = await NotificationService.scheduleNotification(reminder);
      if (notificationId) {
        reminder.notificationId = notificationId;
        console.log('Notification scheduled with ID:', notificationId);
      } else {
        console.log('Failed to schedule notification');
      }

      await ReminderStorage.addReminder(reminder);
      console.log('Reminder saved to storage');
      
      await refreshReminders();
      console.log('Reminders refreshed after adding');
    } catch (error) {
      console.log('Error adding reminder:', error);
      throw error;
    }
  }, [refreshReminders]);

  const updateReminder = useCallback(async (reminder: Reminder) => {
    try {
      console.log('Updating reminder:', reminder);
      
      reminder.updatedAt = new Date();
      
      // Cancel old notification and schedule new one if needed
      if (reminder.notificationId) {
        await NotificationService.cancelNotification(reminder.notificationId);
        console.log('Cancelled old notification:', reminder.notificationId);
      }
      
      if (reminder.isActive && !reminder.isCompleted) {
        const notificationId = await NotificationService.scheduleNotification(reminder);
        if (notificationId) {
          reminder.notificationId = notificationId;
          console.log('Scheduled new notification:', notificationId);
        }
      }

      await ReminderStorage.updateReminder(reminder);
      console.log('Reminder updated in storage');
      
      await refreshReminders();
      console.log('Reminders refreshed after updating');
    } catch (error) {
      console.log('Error updating reminder:', error);
      throw error;
    }
  }, [refreshReminders]);

  const deleteReminder = useCallback(async (id: string) => {
    try {
      console.log('Starting deletion process for reminder ID:', id);
      
      // Find the reminder in both active and completed lists
      const allReminders = [...activeReminders, ...completedReminders];
      const reminder = allReminders.find(r => r.id === id);
      
      if (!reminder) {
        console.log('Reminder not found with ID:', id);
        throw new Error('Напоминание не найдено');
      }
      
      console.log('Found reminder to delete:', reminder);
      
      // Cancel notification if exists
      if (reminder.notificationId) {
        try {
          await NotificationService.cancelNotification(reminder.notificationId);
          console.log('Cancelled notification for deleted reminder:', reminder.notificationId);
        } catch (notificationError) {
          console.log('Error cancelling notification:', notificationError);
          // Continue with deletion even if notification cancellation fails
        }
      }
      
      // Delete from storage
      await ReminderStorage.deleteReminder(id);
      console.log('Reminder deleted from storage successfully');
      
      // Refresh the reminders list
      await refreshReminders();
      console.log('Reminders refreshed after deletion');
      
    } catch (error) {
      console.log('Error in deleteReminder function:', error);
      throw error;
    }
  }, [activeReminders, completedReminders, refreshReminders]);

  const completeReminder = useCallback(async (id: string) => {
    try {
      console.log('Completing reminder:', id);
      
      const reminder = activeReminders.find(r => r.id === id);
      if (reminder) {
        reminder.isCompleted = true;
        reminder.isActive = false;
        reminder.updatedAt = new Date();
        
        if (reminder.notificationId) {
          await NotificationService.cancelNotification(reminder.notificationId);
          console.log('Cancelled notification for completed reminder');
        }
        
        await ReminderStorage.updateReminder(reminder);
        console.log('Reminder marked as completed in storage');
        
        await refreshReminders();
        console.log('Reminders refreshed after completing');
      }
    } catch (error) {
      console.log('Error completing reminder:', error);
      throw error;
    }
  }, [activeReminders, refreshReminders]);

  const postponeReminder = useCallback(async (id: string, minutes: number) => {
    try {
      console.log('Postponing reminder:', id, 'by', minutes, 'minutes');
      
      const reminder = activeReminders.find(r => r.id === id);
      if (reminder) {
        const newDateTime = new Date(reminder.dateTime.getTime() + minutes * 60 * 1000);
        reminder.dateTime = newDateTime;
        reminder.updatedAt = new Date();
        
        console.log('New reminder time:', newDateTime);
        
        await updateReminder(reminder);
      }
    } catch (error) {
      console.log('Error postponing reminder:', error);
      throw error;
    }
  }, [activeReminders, updateReminder]);

  useEffect(() => {
    const initializeApp = async () => {
      console.log('Initializing reminder app...');
      await refreshReminders();
      await BackgroundTaskManager.initializeBackgroundTasks();
      console.log('App initialization complete');
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
