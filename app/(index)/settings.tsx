
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { colors, commonStyles } from '../../styles/commonStyles';
import { IconSymbol } from '../../components/IconSymbol';
import { NotificationService } from '../../services/notificationService';
import { ReminderStorage } from '../../services/reminderStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      const hasPermission = await NotificationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Разрешения не предоставлены',
          'Пожалуйста, разрешите уведомления в настройках устройства'
        );
        setNotificationsEnabled(false);
      }
    }
  };

  const handleResetWelcome = async () => {
    Alert.alert(
      'Сбросить приветствие',
      'Показать экран приветствия при следующем запуске?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('hasSeenWelcome');
              Alert.alert('Готово', 'Экран приветствия будет показан при следующем запуске');
            } catch (error) {
              console.log('Error resetting welcome:', error);
            }
          },
        },
      ]
    );
  };

  const handleDebugStorage = async () => {
    try {
      const rawData = await ReminderStorage.getRawStorageData();
      const reminders = await ReminderStorage.getReminders();
      const activeReminders = await ReminderStorage.getActiveReminders();
      const completedReminders = await ReminderStorage.getCompletedReminders();
      
      const debugInfo = `
Отладочная информация хранилища:

Всего напоминаний: ${reminders.length}
Активных: ${activeReminders.length}
Выполненных: ${completedReminders.length}

Сырые данные: ${rawData ? 'Есть' : 'Нет'}

Детали напоминаний:
${reminders.map(r => `- ${r.title} (ID: ${r.id}, Активно: ${r.isActive}, Выполнено: ${r.isCompleted})`).join('\n')}
      `;
      
      Alert.alert('Отладка хранилища', debugInfo);
    } catch (error) {
      console.log('Error debugging storage:', error);
      Alert.alert('Ошибка', 'Не удалось получить информацию о хранилище');
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Очистить все данные',
      'Это действие удалит все ваши напоминания. Продолжить?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['reminders', 'hasSeenWelcome']);
              await NotificationService.cancelAllNotifications();
              Alert.alert('Готово', 'Все данные удалены');
              router.back();
            } catch (error) {
              console.log('Error clearing data:', error);
              Alert.alert('Ошибка', 'Не удалось очистить данные');
            }
          },
        },
      ]
    );
  };

  const settingsItems = [
    {
      icon: 'bell',
      title: 'Уведомления',
      description: 'Разрешить push-уведомления',
      type: 'switch' as const,
      value: notificationsEnabled,
      onToggle: handleNotificationToggle,
    },
    {
      icon: 'speaker-wave-2',
      title: 'Звук',
      description: 'Воспроизводить звук при напоминаниях',
      type: 'switch' as const,
      value: soundEnabled,
      onToggle: setSoundEnabled,
    },
    {
      icon: 'info-circle',
      title: 'Показать приветствие',
      description: 'Сбросить экран приветствия',
      type: 'button' as const,
      onPress: handleResetWelcome,
    },
    {
      icon: 'wrench-adjustable',
      title: 'Отладка хранилища',
      description: 'Показать информацию о сохраненных данных',
      type: 'button' as const,
      onPress: handleDebugStorage,
    },
    {
      icon: 'trash',
      title: 'Очистить все данные',
      description: 'Удалить все напоминания и настройки',
      type: 'button' as const,
      onPress: handleClearAllData,
      danger: true,
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Настройки',
          headerLeft: () => (
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <IconSymbol name="chevron-left" size={24} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {settingsItems.map((item, index) => (
            <View key={index} style={styles.settingItem}>
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <IconSymbol 
                    name={item.icon as any} 
                    size={24} 
                    color={item.danger ? colors.danger : colors.primary} 
                  />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, item.danger && styles.dangerText]}>
                    {item.title}
                  </Text>
                  <Text style={styles.settingDescription}>{item.description}</Text>
                </View>
              </View>
              
              {item.type === 'switch' ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: colors.grey, true: colors.primary }}
                  thumbColor={colors.backgroundAlt}
                />
              ) : (
                <Pressable style={styles.settingButton} onPress={item.onPress}>
                  <IconSymbol name="chevron-right" size={20} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Напоминания v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Создано для управления задачами и событиями
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundAlt,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...commonStyles.card,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dangerText: {
    color: colors.danger,
  },
  settingButton: {
    padding: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
});
