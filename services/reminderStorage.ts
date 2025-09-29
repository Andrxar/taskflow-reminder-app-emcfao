
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reminder } from '../types/reminder';

const REMINDERS_KEY = 'reminders';

export class ReminderStorage {
  static async getReminders(): Promise<Reminder[]> {
    try {
      const remindersJson = await AsyncStorage.getItem(REMINDERS_KEY);
      if (!remindersJson) return [];
      
      const reminders = JSON.parse(remindersJson);
      return reminders.map((reminder: any) => ({
        ...reminder,
        dateTime: new Date(reminder.dateTime),
        createdAt: new Date(reminder.createdAt),
        updatedAt: new Date(reminder.updatedAt),
      }));
    } catch (error) {
      console.log('Error loading reminders:', error);
      return [];
    }
  }

  static async saveReminders(reminders: Reminder[]): Promise<void> {
    try {
      const remindersJson = JSON.stringify(reminders);
      await AsyncStorage.setItem(REMINDERS_KEY, remindersJson);
    } catch (error) {
      console.log('Error saving reminders:', error);
    }
  }

  static async addReminder(reminder: Reminder): Promise<void> {
    try {
      const reminders = await this.getReminders();
      reminders.push(reminder);
      await this.saveReminders(reminders);
    } catch (error) {
      console.log('Error adding reminder:', error);
    }
  }

  static async updateReminder(updatedReminder: Reminder): Promise<void> {
    try {
      const reminders = await this.getReminders();
      const index = reminders.findIndex(r => r.id === updatedReminder.id);
      if (index !== -1) {
        reminders[index] = updatedReminder;
        await this.saveReminders(reminders);
      }
    } catch (error) {
      console.log('Error updating reminder:', error);
    }
  }

  static async deleteReminder(id: string): Promise<void> {
    try {
      const reminders = await this.getReminders();
      const filteredReminders = reminders.filter(r => r.id !== id);
      await this.saveReminders(filteredReminders);
    } catch (error) {
      console.log('Error deleting reminder:', error);
    }
  }

  static async getActiveReminders(): Promise<Reminder[]> {
    const reminders = await this.getReminders();
    return reminders.filter(r => r.isActive && !r.isCompleted);
  }

  static async getCompletedReminders(): Promise<Reminder[]> {
    const reminders = await this.getReminders();
    return reminders.filter(r => r.isCompleted);
  }
}
