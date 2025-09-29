
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { Reminder, POSTPONE_OPTIONS } from '../types/reminder';
import { colors } from '../styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { useReminders } from '../contexts/ReminderContext';
import { SoundService } from '../services/soundService';

interface FullScreenReminderAlertProps {
  visible: boolean;
  onClose: () => void;
  reminder?: Reminder;
}

const { width, height } = Dimensions.get('window');

export const FullScreenReminderAlert: React.FC<FullScreenReminderAlertProps> = ({
  visible,
  onClose,
  reminder,
}) => {
  const { postponeReminder, completeReminder } = useReminders();
  const [timeLeft, setTimeLeft] = useState(60);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [customHours, setCustomHours] = useState('');
  const [customDays, setCustomDays] = useState('');

  const handleAutoClose = useCallback(async () => {
    await SoundService.stopSound();
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (visible && reminder) {
      // Start playing sound
      SoundService.playReminderSound();
      
      // Reset custom input
      setShowCustomInput(false);
      setCustomMinutes('');
      setCustomHours('');
      setCustomDays('');
      
      // Start countdown
      setTimeLeft(60);
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
        SoundService.stopSound();
      };
    }
  }, [visible, reminder, handleAutoClose]);

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

  const handleDismiss = async () => {
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

  if (!visible || !reminder) return null;

  return (
    <View style={styles.overlay}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconSymbol name="bell-fill" size={48} color={colors.backgroundAlt} />
          </View>
          <Text style={styles.headerTitle}>Напоминание</Text>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{timeLeft}с</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.reminderTitle}>{reminder.title}</Text>
            {reminder.description ? (
              <Text style={styles.reminderDescription}>{reminder.description}</Text>
            ) : null}
            
            <View style={styles.timeInfo}>
              <IconSymbol name="clock" size={20} color={colors.backgroundAlt} />
              <Text style={styles.timeText}>
                {reminder.dateTime.toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Text style={styles.postponeLabel}>Отложить на:</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.postponeOptions}
              contentContainerStyle={styles.postponeOptionsContent}
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
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
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
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
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
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
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
                  <IconSymbol name="clock" size={20} color={colors.primary} />
                  <Text style={styles.customPostponeButtonText}>Отложить на указанное время</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.mainActions}>
              <Pressable style={styles.completeButton} onPress={handleComplete}>
                <IconSymbol name="checkmark" size={24} color={colors.backgroundAlt} />
                <Text style={styles.completeButtonText}>Выполнено</Text>
              </Pressable>

              <Pressable style={styles.dismissButton} onPress={handleDismiss}>
                <IconSymbol name="xmark" size={20} color={colors.primary} />
                <Text style={styles.dismissButtonText}>Закрыть</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width,
    height,
    backgroundColor: colors.primary,
    zIndex: 9999,
  },
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.backgroundAlt,
    marginBottom: 8,
  },
  timerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.backgroundAlt,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  reminderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.backgroundAlt,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  reminderDescription: {
    fontSize: 18,
    color: colors.backgroundAlt,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 26,
    opacity: 0.9,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.backgroundAlt,
    marginLeft: 8,
  },
  actions: {
    gap: 20,
    paddingBottom: 20,
  },
  postponeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.backgroundAlt,
    textAlign: 'center',
  },
  postponeOptions: {
    maxHeight: 60,
  },
  postponeOptionsContent: {
    paddingHorizontal: 12,
    gap: 12,
  },
  postponeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  customButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  postponeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.backgroundAlt,
  },
  customInputSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  customInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.backgroundAlt,
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
    color: colors.backgroundAlt,
    marginBottom: 4,
    fontWeight: '500',
    opacity: 0.8,
  },
  customInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: colors.backgroundAlt,
    textAlign: 'center',
    minWidth: 60,
  },
  customTimePreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  customTimePreviewLabel: {
    fontSize: 14,
    color: colors.backgroundAlt,
    marginBottom: 4,
    opacity: 0.8,
  },
  customTimePreviewText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.backgroundAlt,
  },
  customPostponeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  customPostponeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  mainActions: {
    flexDirection: 'row',
    gap: 16,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.backgroundAlt,
  },
  dismissButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  dismissButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
});
