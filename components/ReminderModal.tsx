
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

  useEffect(() => {
    if (reminder) {
      setTitle(reminder.title);
      setDescription(reminder.description);
      setSelectedDate(reminder.dateTime);
    } else {
      setTitle('');
      setDescription('');
      setSelectedDate(new Date());
    }
  }, [reminder, visible]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите название напоминания');
      return;
    }

    if (selectedDate <= new Date()) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите время в будущем');
      return;
    }

    try {
      if (reminder) {
        const updatedReminder: Reminder = {
          ...reminder,
          title: title.trim(),
          description: description.trim(),
          dateTime: selectedDate,
        };
        await updateReminder(updatedReminder);
      } else {
        await addReminder(title.trim(), description.trim(), selectedDate);
      }
      onClose();
    } catch (error) {
      console.log('Error saving reminder:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить напоминание');
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
    const newDate = new Date(selectedDate);
    newDate.setFullYear(date.getFullYear());
    newDate.setMonth(date.getMonth());
    newDate.setDate(date.getDate());
    setSelectedDate(newDate);
    setShowDatePicker(false);
  };

  const handleTimeConfirm = (time: Date) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(time.getHours());
    newDate.setMinutes(time.getMinutes());
    setSelectedDate(newDate);
    setShowTimePicker(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Отмена</Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            {reminder ? 'Редактировать' : 'Новое напоминание'}
          </Text>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Сохранить</Text>
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
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Дата и время *</Text>
            
            <View style={styles.dateTimeContainer}>
              <Pressable
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <IconSymbol name="calendar" size={20} color={colors.primary} />
                <Text style={styles.dateTimeText}>{formatDate(selectedDate)}</Text>
              </Pressable>

              <Pressable
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <IconSymbol name="clock" size={20} color={colors.primary} />
                <Text style={styles.dateTimeText}>{formatTime(selectedDate)}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setShowDatePicker(false)}
          minimumDate={new Date()}
          locale="ru-RU"
        />

        <DateTimePickerModal
          isVisible={showTimePicker}
          mode="time"
          onConfirm={handleTimeConfirm}
          onCancel={() => setShowTimePicker(false)}
          locale="ru-RU"
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
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateTimeText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    fontWeight: '500',
  },
});
