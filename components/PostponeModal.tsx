
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
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
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [customHours, setCustomHours] = useState('');
  const [customDays, setCustomDays] = useState('');

  useEffect(() => {
    if (visible && reminder) {
      // Start playing sound when modal opens
      SoundService.playReminderSound();
      // Reset custom input
      setShowCustomInput(false);
      setCustomMinutes('');
      setCustomHours('');
      setCustomDays('');
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

  const handleCustomPostpone = async () => {
    const minutes = parseInt(customMinutes) || 0;
    const hours = parseInt(customHours) || 0;
    const days = parseInt(customDays) || 0;

    const totalMinutes = minutes + (hours * 60) + (days * 24 * 60);

    if (totalMinutes <= 0) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректное время отсрочки');
      return;
    }

    if (totalMinutes > 365 * 24 * 60) { // Max 1 year
      Alert.alert('Ошибка', 'Максимальная отсрочка - 1 год');
      return;
    }

    console.log('Custom postpone:', { minutes, hours, days, totalMinutes });
    await handlePostpone(totalMinutes);
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

  const formatCustomTime = () => {
    const minutes = parseInt(customMinutes) || 0;
    const hours = parseInt(customHours) || 0;
    const days = parseInt(customDays) || 0;

    const parts = [];
    if (days > 0) parts.push(`${days} дн.`);
    if (hours > 0) parts.push(`${hours} ч.`);
    if (minutes > 0) parts.push(`${minutes} мин.`);

    return parts.length > 0 ? parts.join(' ') : 'Не указано';
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
              
              {/* Custom time button */}
              <Pressable
                style={[styles.postponeButton, styles.customButton]}
                onPress={() => setShowCustomInput(!showCustomInput)}
              >
                <Text style={styles.postponeButtonText}>Другое время</Text>
              </Pressable>
            </ScrollView>

            {/* Custom Input Section */}
            {showCustomInput && (
              <View style={styles.customInputSection}>
                <Text style={styles.customInputLabel}>Введите время отсрочки:</Text>
                
                <View style={styles.customInputContainer}>
                  <View style={styles.customInputField}>
                    <Text style={styles.customInputFieldLabel}>Дни</Text>
                    <TextInput
                      style={styles.customInput}
                      value={customDays}
                      onChangeText={setCustomDays}
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                  </View>

                  <View style={styles.customInputField}>
                    <Text style={styles.customInputFieldLabel}>Часы</Text>
                    <TextInput
                      style={styles.customInput}
                      value={customHours}
                      onChangeText={setCustomHours}
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>

                  <View style={styles.customInputField}>
                    <Text style={styles.customInputFieldLabel}>Минуты</Text>
                    <TextInput
                      style={styles.customInput}
                      value={customMinutes}
                      onChangeText={setCustomMinutes}
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                </View>

                <View style={styles.customTimePreview}>
                  <Text style={styles.customTimePreviewLabel}>Отложить на:</Text>
                  <Text style={styles.customTimePreviewText}>{formatCustomTime()}</Text>
                </View>

                <Pressable
                  style={styles.customPostponeButton}
                  onPress={handleCustomPostpone}
                >
                  <IconSymbol name="clock" size={20} color={colors.backgroundAlt} />
                  <Text style={styles.customPostponeButtonText}>Отложить на указанное время</Text>
                </Pressable>
              </View>
            )}

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
  customButton: {
    backgroundColor: colors.textSecondary,
  },
  postponeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.backgroundAlt,
  },
  customInputSection: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  customInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  customInputField: {
    flex: 1,
    alignItems: 'center',
  },
  customInputFieldLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  customInput: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    minWidth: 60,
  },
  customTimePreview: {
    backgroundColor: colors.backgroundAlt,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  customTimePreviewLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  customTimePreviewText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  customPostponeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  customPostponeButtonText: {
    fontSize: 16,
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
