
import * as Notifications from 'expo-notifications';
import { ReminderStorage } from '../services/reminderStorage';
import { NotificationService } from '../services/notificationService';

export class BackgroundTaskManager {
  static async scheduleAllPendingReminders(): Promise<void> {
    try {
      const activeReminders = await ReminderStorage.getActiveReminders();
      const now = new Date();
      
      // Cancel all existing notifications first
      await NotificationService.cancelAllNotifications();
      
      // Schedule notifications for future reminders
      for (const reminder of activeReminders) {
        if (reminder.dateTime > now) {
          const notificationId = await NotificationService.scheduleNotification(reminder);
          if (notificationId && reminder.notificationId !== notificationId) {
            reminder.notificationId = notificationId;
            await ReminderStorage.updateReminder(reminder);
          }
        }
      }
      
      console.log(`Scheduled ${activeReminders.length} reminder notifications`);
    } catch (error) {
      console.log('Error scheduling pending reminders:', error);
    }
  }

  static async cleanupExpiredReminders(): Promise<void> {
    try {
      const activeReminders = await ReminderStorage.getActiveReminders();
      const now = new Date();
      const expiredCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      let cleanedCount = 0;
      
      for (const reminder of activeReminders) {
        // Mark very old overdue reminders as inactive
        if (reminder.dateTime < expiredCutoff) {
          reminder.isActive = false;
          await ReminderStorage.updateReminder(reminder);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} expired reminders`);
      }
    } catch (error) {
      console.log('Error cleaning up expired reminders:', error);
    }
  }

  static async initializeBackgroundTasks(): Promise<void> {
    try {
      // Schedule all pending reminders
      await this.scheduleAllPendingReminders();
      
      // Clean up expired reminders
      await this.cleanupExpiredReminders();
      
      console.log('Background tasks initialized');
    } catch (error) {
      console.log('Error initializing background tasks:', error);
    }
  }
}
