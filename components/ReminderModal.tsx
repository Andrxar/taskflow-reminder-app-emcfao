
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Reminder } from '../types/reminder';
import { colors, commonStyles } from '../styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { useReminders } from '../contexts/ReminderContext';

interface ReminderModalProps {
  visible: boolean;
  onClose: () => void;
  reminder?: Reminder;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  visible,
  onClose,
  reminder,
}) => {
  const { addReminder, updateReminder } = useReminders();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      if (reminder) {
        console.log('Editing reminder:', reminder);
        setTitle(reminder.title);
        setDescription(reminder.description);
        setSelectedDate(new Date(reminder.dateTime));
      } else {
        console.log('Creating new reminder');
        setTitle('');
        setDescription('');
        // Set default time to 1 hour from now
        const defaultDate = new Date();
        defaultDate.setHours(defaultDate.getHours() + 1);
        defaultDate.setMinutes(0);
        defaultDate.setSeconds(0);
        defaultDate.setMilliseconds(0);
        setSelectedDate(defaultDate);
      }
    }
  }, [reminder, visible]);

  const handleSave = async () => {
    console.log('Save button pressed');
    console.log('Title:', title);
    console.log('Description:', description);
    console.log('Selected date:', selectedDate);

    if (!title.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите название напоминания');
      return;
    }

    const now = new Date();
    if (selectedDate <= now) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите время в будущем');
      return;
    }

    setIsSaving(true);
    
    try {
      if (reminder) {
        console.log('Updating existing reminder');
        const updatedReminder: Reminder = {
          ...reminder,
          title: title.trim(),
          description: description.trim(),
          dateTime: selectedDate,
          updatedAt: new Date(),
        };
        await updateReminder(updatedReminder);
        console.log('Reminder updated successfully');
      } else {
        console.log('Adding new reminder');
        await addReminder(title.trim(), description.trim(), selectedDate);
        console.log('Reminder added successfully');
      }
      
      // Reset form
      setTitle('');
      setDescription('');
      const defaultDate = new Date();
      defaultDate.setHours(defaultDate.getHours() + 1);
      setSelectedDate(defaultDate);
      
      onClose();
    } catch (error) {
      console.log('Error saving reminder:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить напоминание');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDateConfirm = (date: Date) => {
    console.log('Date selected:', date);
    const newDate = new Date(selectedDate);
    newDate.setFullYear(date.getFullYear());
    newDate.setMonth(date.getMonth());
    newDate.setDate(date.getDate());
    setSelectedDate(newDate);
    setShowDatePicker(false);
    console.log('Updated selectedDate after date selection:', newDate);
  };

  const handleTimeConfirm = (time: Date) => {
    console.log('Time selected:', time);
    const newDate = new Date(selectedDate);
    newDate.setHours(time.getHours());
    newDate.setMinutes(time.getMinutes());
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    setSelectedDate(newDate);
    setShowTimePicker(false);
    console.log('Updated selectedDate after time selection:', newDate);
  };

  const handleClose = () => {
    if (!isSaving) {
      console.log('Closing modal');
      onClose();
    }
  };

  const openDatePicker = () => {
    console.log('Opening date picker');
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    console.log('Opening time picker');
    setShowTimePicker(true);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Pressable 
            style={styles.cancelButton} 
            onPress={handleClose}
            disabled={isSaving}
          >
            <Text style={[styles.cancelText, isSaving && styles.disabledText]}>
              Отмена
            </Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            {reminder ? 'Редактировать' : 'Новое напоминание'}
          </Text>
          <Pressable 
            style={[styles.saveButton, isSaving && styles.disabledButton]} 
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={[styles.saveText, isSaving && styles.disabledText]}>
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Название *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Введите название напоминания"
              placeholderTextColor={colors.textSecondary}
              multiline
              editable={!isSaving}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Описание</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Добавьте описание (необязательно)"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              editable={!isSaving}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Дата и время *</Text>
            
            <View style={styles.dateTimeContainer}>
              <Pressable
                style={[styles.dateTimeButton, isSaving && styles.disabledButton]}
                onPress={openDatePicker}
                disabled={isSaving}
              >
                <IconSymbol name="calendar" size={20} color={colors.primary} />
                <Text style={styles.dateTimeText}>{formatDate(selectedDate)}</Text>
                <IconSymbol name="chevron-down" size={16} color={colors.textSecondary} />
              </Pressable>

              <Pressable
                style={[styles.dateTimeButton, isSaving && styles.disabledButton]}
                onPress={openTimePicker}
                disabled={isSaving}
              >
                <IconSymbol name="clock" size={20} color={colors.primary} />
                <Text style={styles.dateTimeText}>{formatTime(selectedDate)}</Text>
                <IconSymbol name="chevron-down" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.selectedDateTimeContainer}>
              <Text style={styles.selectedDateTimeLabel}>Выбранное время:</Text>
              <Text style={styles.selectedDateTime}>
                {selectedDate.toLocaleString('ru-RU', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        </ScrollView>

        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => {
            console.log('Date picker cancelled');
            setShowDatePicker(false);
          }}
          minimumDate={new Date()}
          locale="ru-RU"
          date={selectedDate}
          confirmTextIOS="Выбрать"
          cancelTextIOS="Отмена"
        />

        <DateTimePickerModal
          isVisible={showTimePicker}
          mode="time"
          onConfirm={handleTimeConfirm}
          onCancel={() => {
            console.log('Time picker cancelled');
            setShowTimePicker(false);
          }}
          locale="ru-RU"
          date={selectedDate}
          confirmTextIOS="Выбрать"
          cancelTextIOS="Отмена"
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundAlt,
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    ...commonStyles.input,
    minHeight: 48,
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 56,
  },
  dateTimeText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
  },
  selectedDateTimeContainer: {
    backgroundColor: colors.backgroundAlt,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedDateTimeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  selectedDateTime: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});
