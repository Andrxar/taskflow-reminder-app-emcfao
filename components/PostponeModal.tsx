
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { Reminder, POSTPONE_OPTIONS } from '../types/reminder';
import { colors, commonStyles } from '../styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { useReminders } from '../contexts/ReminderContext';
import { SoundService } from '../services/soundService';

interface PostponeModalProps {
  visible: boolean;
  onClose: () => void;
  reminder?: Reminder;
}

export const PostponeModal: React.FC<PostponeModalProps> = ({
  visible,
  onClose,
  reminder,
}) => {
  const { postponeReminder, completeReminder } = useReminders();

  useEffect(() => {
    if (visible && reminder) {
      // Start playing sound when modal opens
      SoundService.playReminderSound();
    }

    return () => {
      // Stop sound when modal closes
      if (visible) {
        SoundService.stopSound();
      }
    };
  }, [visible, reminder]);

  const handlePostpone = async (minutes: number) => {
    if (reminder) {
      await SoundService.stopSound();
      await postponeReminder(reminder.id, minutes);
      onClose();
    }
  };

  const handleComplete = async () => {
    if (reminder) {
      await SoundService.stopSound();
      await completeReminder(reminder.id);
      onClose();
    }
  };

  const handleClose = async () => {
    await SoundService.stopSound();
    onClose();
  };

  if (!reminder) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <IconSymbol name="bell" size={32} color={colors.primary} />
            <Text style={styles.title}>Напоминание</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.reminderTitle}>{reminder.title}</Text>
            {reminder.description ? (
              <Text style={styles.reminderDescription}>{reminder.description}</Text>
            ) : null}
          </View>

          <View style={styles.actions}>
            <Text style={styles.postponeLabel}>Отложить на:</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.postponeOptions}
            >
              {POSTPONE_OPTIONS.map((option) => (
                <Pressable
                  key={option.minutes}
                  style={styles.postponeButton}
                  onPress={() => handlePostpone(option.minutes)}
                >
                  <Text style={styles.postponeButtonText}>{option.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.mainActions}>
              <Pressable style={styles.completeButton} onPress={handleComplete}>
                <IconSymbol name="checkmark" size={20} color={colors.backgroundAlt} />
                <Text style={styles.completeButtonText}>Выполнено</Text>
              </Pressable>

              <Pressable style={styles.dismissButton} onPress={handleClose}>
                <Text style={styles.dismissButtonText}>Закрыть</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  content: {
    marginBottom: 24,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  reminderDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    gap: 16,
  },
  postponeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  postponeOptions: {
    flexDirection: 'row',
  },
  postponeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  postponeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.backgroundAlt,
  },
  mainActions: {
    flexDirection: 'row',
    gap: 12,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.backgroundAlt,
  },
  dismissButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.border,
    paddingVertical: 14,
    borderRadius: 8,
  },
  dismissButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
