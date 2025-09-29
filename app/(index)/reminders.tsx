
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, router } from 'expo-router';
import { colors, commonStyles } from '../../styles/commonStyles';
import { IconSymbol } from '../../components/IconSymbol';
import { ReminderCard } from '../../components/ReminderCard';
import { ReminderModal } from '../../components/ReminderModal';
import { PostponeModal } from '../../components/PostponeModal';
import { FullScreenReminderAlert } from '../../components/FullScreenReminderAlert';
import { WelcomeScreen } from '../../components/WelcomeScreen';
import { useReminders } from '../../contexts/ReminderContext';
import { Reminder } from '../../types/reminder';
import { NotificationService } from '../../services/notificationService';
import * as Notifications from 'expo-notifications';

type TabType = 'active' | 'completed';

export default function RemindersScreen() {
  const {
    activeReminders,
    completedReminders,
    loading,
    refreshReminders,
  } = useReminders();
  
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [showFullScreenAlert, setShowFullScreenAlert] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | undefined>();
  const [postponeReminder, setPostponeReminder] = useState<Reminder | undefined>();
  const [alertReminder, setAlertReminder] = useState<Reminder | undefined>();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if this is the first time opening the app
    const checkFirstTime = async () => {
      try {
        const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
          setShowWelcome(true);
        }
      } catch (error) {
        console.log('Error checking first time:', error);
      }
    };

    checkFirstTime();

    // Request notification permissions on mount
    NotificationService.requestPermissions();

    // Listen for notification responses
    const responseListener = NotificationService.addNotificationResponseListener((response) => {
      console.log('Notification response received:', response);
      const reminderId = response.notification.request.content.data?.reminderId;
      if (reminderId) {
        const reminder = activeReminders.find(r => r.id === reminderId);
        if (reminder) {
          setAlertReminder(reminder);
          setShowFullScreenAlert(true);
        }
      }
    });

    // Listen for notifications received while app is in foreground
    const notificationListener = NotificationService.addNotificationListener((notification) => {
      console.log('Notification received in foreground:', notification);
      const reminderId = notification.request.content.data?.reminderId;
      if (reminderId) {
        const reminder = activeReminders.find(r => r.id === reminderId);
        if (reminder) {
          setAlertReminder(reminder);
          setShowFullScreenAlert(true);
        }
      }
    });

    return () => {
      responseListener.remove();
      notificationListener.remove();
    };
  }, [activeReminders]);

  const handleAddReminder = () => {
    console.log('Add reminder button pressed');
    setEditingReminder(undefined);
    setShowReminderModal(true);
  };

  const handleEditReminder = (reminder: Reminder) => {
    console.log('Edit reminder:', reminder);
    setEditingReminder(reminder);
    setShowReminderModal(true);
  };

  const handleCloseReminderModal = () => {
    console.log('Closing reminder modal');
    setShowReminderModal(false);
    setEditingReminder(undefined);
  };

  const handleClosePostponeModal = () => {
    setShowPostponeModal(false);
    setPostponeReminder(undefined);
  };

  const handleCloseFullScreenAlert = () => {
    setShowFullScreenAlert(false);
    setAlertReminder(undefined);
  };

  const handleWelcomeComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenWelcome', 'true');
      setShowWelcome(false);
    } catch (error) {
      console.log('Error saving welcome state:', error);
      setShowWelcome(false);
    }
  };

  const renderEmptyState = (tab: TabType) => {
    const isActive = tab === 'active';
    return (
      <View style={styles.emptyState}>
        <IconSymbol 
          name={isActive ? "bell" : "checkmark-circle"} 
          size={64} 
          color={colors.grey} 
        />
        <Text style={styles.emptyTitle}>
          {isActive ? 'Нет активных напоминаний' : 'Нет выполненных напоминаний'}
        </Text>
        <Text style={styles.emptyDescription}>
          {isActive 
            ? 'Создайте новое напоминание, нажав кнопку "Добавить напоминание +" ниже'
            : 'Выполненные напоминания будут отображаться здесь'
          }
        </Text>
      </View>
    );
  };

  const currentReminders = activeTab === 'active' ? activeReminders : completedReminders;

  // Show welcome screen for first-time users
  if (showWelcome) {
    return <WelcomeScreen onGetStarted={handleWelcomeComplete} />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Напоминания',
          headerLeft: () => (
            <Pressable style={styles.settingsButton} onPress={() => router.push('/settings')}>
              <IconSymbol name="gear" size={24} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <View style={styles.container}>
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              Активные ({activeReminders.length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
              Выполненные ({completedReminders.length})
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshReminders}
              tintColor={colors.primary}
            />
          }
        >
          {currentReminders.length === 0 ? (
            renderEmptyState(activeTab)
          ) : (
            <View style={styles.remindersList}>
              {currentReminders.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onEdit={activeTab === 'active' ? handleEditReminder : undefined}
                />
              ))}
            </View>
          )}
        </ScrollView>

        {/* Enhanced Add Reminder Button */}
        <View style={styles.addButtonContainer}>
          <Pressable style={styles.addReminderButton} onPress={handleAddReminder}>
            <View style={styles.addButtonContent}>
              <View style={styles.plusIconContainer}>
                <IconSymbol name="plus" size={32} color={colors.white} />
              </View>
              <Text style={styles.addButtonText}>Добавить напоминание +</Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Modals */}
      <ReminderModal
        visible={showReminderModal}
        onClose={handleCloseReminderModal}
        reminder={editingReminder}
      />

      <PostponeModal
        visible={showPostponeModal}
        onClose={handleClosePostponeModal}
        reminder={postponeReminder}
      />

      <FullScreenReminderAlert
        visible={showFullScreenAlert}
        onClose={handleCloseFullScreenAlert}
        reminder={alertReminder}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    ...commonStyles.tabContainer,
    marginHorizontal: 16,
    marginTop: 16,
  },
  tab: {
    ...commonStyles.tab,
  },
  activeTab: {
    ...commonStyles.activeTab,
  },
  tabText: {
    ...commonStyles.tabText,
  },
  activeTabText: {
    ...commonStyles.activeTabText,
  },
  content: {
    flex: 1,
  },
  remindersList: {
    paddingVertical: 16,
    gap: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  settingsButton: {
    padding: 8,
  },
  addButtonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  addReminderButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
});
