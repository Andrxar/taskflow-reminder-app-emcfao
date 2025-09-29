
import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Reminder } from '../types/reminder';
import { colors, commonStyles } from '../styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { useReminders } from '../contexts/ReminderContext';

interface ReminderCardProps {
  reminder: Reminder;
  onEdit?: (reminder: Reminder) => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onEdit }) => {
  const { deleteReminder, completeReminder } = useReminders();

  const formatDateTime = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    const timeString = date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    if (isToday) {
      return `Сегодня в ${timeString}`;
    } else if (isTomorrow) {
      return `Завтра в ${timeString}`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const handleDelete = () => {
    console.log('Delete button pressed for reminder:', reminder.id);
    Alert.alert(
      'Удалить напоминание',
      'Вы уверены, что хотите удалить напоминание???',
      [
        { 
          text: 'НЕТ', 
          style: 'cancel',
          onPress: () => console.log('Deletion cancelled for reminder:', reminder.id)
        },
        { 
          text: 'ДА', 
          style: 'destructive',
          onPress: async () => {
            console.log('Confirmed deletion for reminder:', reminder.id);
            try {
              await deleteReminder(reminder.id);
              console.log('Reminder deleted successfully:', reminder.id);
            } catch (error) {
              console.log('Error deleting reminder:', reminder.id, error);
              Alert.alert('Ошибка', 'Не удалось удалить напоминание. Попробуйте еще раз.');
            }
          }
        },
      ]
    );
  };

  const handleComplete = async () => {
    console.log('Complete button pressed for reminder:', reminder.id);
    try {
      await completeReminder(reminder.id);
      console.log('Reminder completed successfully:', reminder.id);
    } catch (error) {
      console.log('Error completing reminder:', reminder.id, error);
      Alert.alert('Ошибка', 'Не удалось отметить напоминание как выполненное');
    }
  };

  const handleEdit = () => {
    console.log('Edit button pressed for reminder:', reminder.id);
    if (onEdit) {
      onEdit(reminder);
    }
  };

  const isOverdue = !reminder.isCompleted && reminder.dateTime < new Date();

  return (
    <View style={[styles.card, isOverdue && styles.overdueCard]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{reminder.title}</Text>
          {isOverdue && (
            <View style={styles.overdueIndicator}>
              <Text style={styles.overdueText}>Просрочено</Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          {/* Always show edit button for both active and completed reminders */}
          <Pressable 
            style={styles.actionButton} 
            onPress={handleEdit}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <IconSymbol name="pencil" size={24} color={colors.primary} />
          </Pressable>
          <Pressable 
            style={styles.deleteButton} 
            onPress={handleDelete}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <IconSymbol name="trash" size={32} color={colors.danger} />
          </Pressable>
        </View>
      </View>
      
      {reminder.description ? (
        <Text style={styles.description}>{reminder.description}</Text>
      ) : null}
      
      <View style={styles.footer}>
        <View style={styles.dateTimeContainer}>
          <IconSymbol name="clock" size={16} color={colors.textSecondary} />
          <Text style={[styles.dateTime, isOverdue && styles.overdueDateTime]}>
            {formatDateTime(reminder.dateTime)}
          </Text>
        </View>
        
        {reminder.isCompleted ? (
          <View style={styles.completedIndicator}>
            <IconSymbol name="checkmark-circle-fill" size={16} color={colors.success} />
            <Text style={styles.completedText}>Выполнено</Text>
          </View>
        ) : (
          <Pressable 
            style={styles.completeButton} 
            onPress={handleComplete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.checkbox}>
              <IconSymbol name="checkmark" size={14} color="transparent" />
            </View>
            <Text style={styles.completeText}>Выполнено</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...commonStyles.card,
    marginHorizontal: 16,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  overdueIndicator: {
    backgroundColor: colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  overdueText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.backgroundAlt,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 6,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTime: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  overdueDateTime: {
    color: colors.danger,
    fontWeight: '600',
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 14,
    color: colors.success,
    marginLeft: 4,
    fontWeight: '600',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: colors.backgroundAlt,
  },
  completeText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});
