
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reminder } from '../types/reminder';

const REMINDERS_KEY = 'reminders';

export class ReminderStorage {
  static async getReminders(): Promise<Reminder[]> {
    try {
      console.log('Loading reminders from storage...');
      const remindersJson = await AsyncStorage.getItem(REMINDERS_KEY);
      if (!remindersJson) {
        console.log('No reminders found in storage');
        return [];
      }
      
      const reminders = JSON.parse(remindersJson);
      console.log('Loaded reminders from storage:', reminders.length);
      
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
      console.log('Saving reminders to storage:', reminders.length);
      const remindersJson = JSON.stringify(reminders);
      await AsyncStorage.setItem(REMINDERS_KEY, remindersJson);
      console.log('Reminders saved successfully');
    } catch (error) {
      console.log('Error saving reminders:', error);
      throw error;
    }
  }

  static async addReminder(reminder: Reminder): Promise<void> {
    try {
      console.log('Adding reminder to storage:', reminder.id);
      const reminders = await this.getReminders();
      reminders.push(reminder);
      await this.saveReminders(reminders);
      console.log('Reminder added successfully');
    } catch (error) {
      console.log('Error adding reminder:', error);
      throw error;
    }
  }

  static async updateReminder(updatedReminder: Reminder): Promise<void> {
    try {
      console.log('Updating reminder in storage:', updatedReminder.id);
      const reminders = await this.getReminders();
      const index = reminders.findIndex(r => r.id === updatedReminder.id);
      if (index !== -1) {
        reminders[index] = updatedReminder;
        await this.saveReminders(reminders);
        console.log('Reminder updated successfully');
      } else {
        console.log('Reminder not found for update:', updatedReminder.id);
        console.log('Available reminder IDs:', reminders.map(r => r.id));
        throw new Error('Reminder not found for update');
      }
    } catch (error) {
      console.log('Error updating reminder:', error);
      throw error;
    }
  }

  static async deleteReminder(id: string): Promise<void> {
    try {
      console.log('Deleting reminder from storage:', id);
      const reminders = await this.getReminders();
      console.log('Current reminders count before deletion:', reminders.length);
      console.log('Available reminder IDs:', reminders.map(r => r.id));
      
      const reminderExists = reminders.some(r => r.id === id);
      if (!reminderExists) {
        console.log('Reminder not found for deletion:', id);
        throw new Error('Reminder not found for deletion');
      }
      
      const filteredReminders = reminders.filter(r => r.id !== id);
      console.log('Reminders count after filtering:', filteredReminders.length);
      
      await this.saveReminders(filteredReminders);
      console.log('Reminder deleted successfully from storage');
    } catch (error) {
      console.log('Error deleting reminder:', error);
      throw error;
    }
  }

  static async getActiveReminders(): Promise<Reminder[]> {
    try {
      const reminders = await this.getReminders();
      const activeReminders = reminders.filter(r => r.isActive && !r.isCompleted);
      console.log('Active reminders found:', activeReminders.length);
      return activeReminders;
    } catch (error) {
      console.log('Error getting active reminders:', error);
      return [];
    }
  }

  static async getCompletedReminders(): Promise<Reminder[]> {
    try {
      const reminders = await this.getReminders();
      const completedReminders = reminders.filter(r => r.isCompleted);
      console.log('Completed reminders found:', completedReminders.length);
      return completedReminders;
    } catch (error) {
      console.log('Error getting completed reminders:', error);
      return [];
    }
  }

  // Debug method to clear all reminders (for testing)
  static async clearAllReminders(): Promise<void> {
    try {
      console.log('Clearing all reminders from storage');
      await AsyncStorage.removeItem(REMINDERS_KEY);
      console.log('All reminders cleared successfully');
    } catch (error) {
      console.log('Error clearing reminders:', error);
      throw error;
    }
  }

  // Debug method to get raw storage data
  static async getRawStorageData(): Promise<string | null> {
    try {
      const data = await AsyncStorage.getItem(REMINDERS_KEY);
      console.log('Raw storage data:', data);
      return data;
    } catch (error) {
      console.log('Error getting raw storage data:', error);
      return null;
    }
  }
}
