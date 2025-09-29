
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
  
  // Manual input states
  const [manualDateInput, setManualDateInput] = useState('');
  const [manualTimeInput, setManualTimeInput] = useState('');
  const [useManualInput, setUseManualInput] = useState(false);

  useEffect(() => {
    if (visible) {
      if (reminder) {
        console.log('Editing reminder:', reminder);
        setTitle(reminder.title);
        setDescription(reminder.description || '');
        setSelectedDate(new Date(reminder.dateTime));
        
        // Initialize manual input fields with current values
        const date = new Date(reminder.dateTime);
        setManualDateInput(formatDateForInput(date));
        setManualTimeInput(formatTimeForInput(date));
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
        
        // Initialize manual input fields with default values
        setManualDateInput(formatDateForInput(defaultDate));
        setManualTimeInput(formatTimeForInput(defaultDate));
      }
      setUseManualInput(false);
    }
  }, [reminder, visible]);

  const formatDateForInput = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}.${month}.${year}`;
  };

  const formatTimeForInput = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const parseManualInput = () => {
    try {
      // Parse date (DD.MM.YYYY format)
      const dateParts = manualDateInput.split('.');
      if (dateParts.length !== 3) {
        throw new Error('Неверный формат даты');
      }
      
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(dateParts[2], 10);
      
      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        throw new Error('Неверный формат даты');
      }
      
      if (day < 1 || day > 31 || month < 0 || month > 11 || year < 2024) {
        throw new Error('Неверная дата');
      }

      // Parse time (HH:MM format)
      const timeParts = manualTimeInput.split(':');
      if (timeParts.length !== 2) {
        throw new Error('Неверный формат времени');
      }
      
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      
      if (isNaN(hours) || isNaN(minutes)) {
        throw new Error('Неверный формат времени');
      }
      
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error('Неверное время');
      }

      // Create new date
      const newDate = new Date(year, month, day, hours, minutes, 0, 0);
      
      // Check if the date is valid (handles cases like 31st of February)
      if (newDate.getDate() !== day || newDate.getMonth() !== month || newDate.getFullYear() !== year) {
        throw new Error('Неверная дата');
      }
      
      return newDate;
    } catch (error) {
      console.log('Error parsing manual input:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    console.log('Save button pressed');
    console.log('Title:', title);
    console.log('Description:', description);
    console.log('Use manual input:', useManualInput);

    if (!title.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите название напоминания');
      return;
    }

    let finalDate = selectedDate;

    // If using manual input, parse and validate it
    if (useManualInput) {
      try {
        finalDate = parseManualInput();
        console.log('Parsed manual date:', finalDate);
      } catch (error) {
        Alert.alert('Ошибка', `Неверный формат даты или времени: ${error.message}`);
        return;
      }
    }

    const now = new Date();
    if (finalDate <= now) {
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
          dateTime: finalDate,
          updatedAt: new Date(),
        };
        await updateReminder(updatedReminder);
        console.log('Reminder updated successfully');
      } else {
        console.log('Adding new reminder');
        await addReminder(title.trim(), description.trim(), finalDate);
        console.log('Reminder added successfully');
      }
      
      // Reset form
      setTitle('');
      setDescription('');
      const defaultDate = new Date();
      defaultDate.setHours(defaultDate.getHours() + 1);
      setSelectedDate(defaultDate);
      setManualDateInput(formatDateForInput(defaultDate));
      setManualTimeInput(formatTimeForInput(defaultDate));
      setUseManualInput(false);
      
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
    
    // Update manual input fields to match picker selection
    setManualDateInput(formatDateForInput(newDate));
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
    
    // Update manual input fields to match picker selection
    setManualTimeInput(formatTimeForInput(newDate));
    console.log('Updated selectedDate after time selection:', newDate);
  };

  const handleManualDateChange = (text: string) => {
    setManualDateInput(text);
    setUseManualInput(true);
  };

  const handleManualTimeChange = (text: string) => {
    setManualTimeInput(text);
    setUseManualInput(true);
  };

  const handleClose = () => {
    if (!isSaving) {
      console.log('Closing modal');
      onClose();
    }
  };

  const openDatePicker = () => {
    console.log('Opening date picker with current date:', selectedDate);
    setUseManualInput(false);
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    console.log('Opening time picker with current time:', selectedDate);
    setUseManualInput(false);
    setShowTimePicker(true);
  };

  const getDisplayDate = () => {
    if (useManualInput) {
      try {
        const parsedDate = parseManualInput();
        return parsedDate;
      } catch {
        return selectedDate;
      }
    }
    return selectedDate;
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

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={true}
          indicatorStyle="default"
        >
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
            
            {/* Picker Buttons */}
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

            {/* Manual Input Fields */}
            <View style={styles.manualInputSection}>
              <Text style={styles.manualInputLabel}>Или введите вручную:</Text>
              
              <View style={styles.manualInputContainer}>
                <View style={styles.manualInputField}>
                  <Text style={styles.manualInputFieldLabel}>Дата (ДД.ММ.ГГГГ)</Text>
                  <TextInput
                    style={[styles.manualInput, useManualInput && styles.manualInputActive]}
                    value={manualDateInput}
                    onChangeText={handleManualDateChange}
                    placeholder="01.01.2024"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    maxLength={10}
                    editable={!isSaving}
                  />
                </View>

                <View style={styles.manualInputField}>
                  <Text style={styles.manualInputFieldLabel}>Время (ЧЧ:ММ)</Text>
                  <TextInput
                    style={[styles.manualInput, useManualInput && styles.manualInputActive]}
                    value={manualTimeInput}
                    onChangeText={handleManualTimeChange}
                    placeholder="12:00"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    maxLength={5}
                    editable={!isSaving}
                  />
                </View>
              </View>

              <Text style={styles.inputHint}>
                Формат даты: ДД.ММ.ГГГГ (например, 25.12.2024)
                {'\n'}Формат времени: ЧЧ:ММ (например, 14:30)
              </Text>
            </View>

            <View style={styles.selectedDateTimeContainer}>
              <Text style={styles.selectedDateTimeLabel}>
                {useManualInput ? 'Введенное время:' : 'Выбранное время:'}
              </Text>
              <Text style={styles.selectedDateTime}>
                {getDisplayDate().toLocaleString('ru-RU', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              {useManualInput && (
                <Text style={styles.manualInputIndicator}>
                  ✏️ Используется ручной ввод
                </Text>
              )}
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
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          is24Hour={true}
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
    marginBottom: 20,
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
  manualInputSection: {
    marginBottom: 20,
  },
  manualInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  manualInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  manualInputField: {
    flex: 1,
  },
  manualInputFieldLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  manualInput: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  manualInputActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputHint: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
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
  manualInputIndicator: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
});
