
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Reminder } from '../types/reminder';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          console.log('Failed to get push token for push notification!');
          return false;
        }
        
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('reminders', {
            name: 'Напоминания',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#4A90E2',
            sound: 'default',
            enableLights: true,
            enableVibrate: true,
            showBadge: true,
          });
        }
        
        return true;
      } else {
        console.log('Must use physical device for Push Notifications');
        return false;
      }
    } catch (error) {
      console.log('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async scheduleNotification(reminder: Reminder): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Напоминание',
          body: reminder.title,
          subtitle: reminder.description || undefined,
          data: { 
            reminderId: reminder.id,
            reminderTitle: reminder.title,
            reminderDescription: reminder.description,
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
          categoryIdentifier: 'reminder',
        },
        trigger: {
          date: reminder.dateTime,
          channelId: 'reminders',
        },
      });

      return notificationId;
    } catch (error) {
      console.log('Error scheduling notification:', error);
      return null;
    }
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.log('Error canceling notification:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.log('Error canceling all notifications:', error);
    }
  }

  static addNotificationListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  static addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}
