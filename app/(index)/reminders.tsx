
import React, { useState, useEffect, useMemo } from 'react';
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
type SortType = 'date-asc' | 'date-desc' | 'title-asc' | 'title-desc';

export default function RemindersScreen() {
  const {
    activeReminders,
    completedReminders,
    loading,
    refreshReminders,
  } = useReminders();
  
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [sortType, setSortType] = useState<SortType>('date-asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
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

  // Sort reminders based on selected sort type
  const sortedReminders = useMemo(() => {
    const reminders = activeTab === 'active' ? activeReminders : completedReminders;
    
    return [...reminders].sort((a, b) => {
      switch (sortType) {
        case 'date-asc':
          return a.dateTime.getTime() - b.dateTime.getTime();
        case 'date-desc':
          return b.dateTime.getTime() - a.dateTime.getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title, 'ru');
        case 'title-desc':
          return b.title.localeCompare(a.title, 'ru');
        default:
          return a.dateTime.getTime() - b.dateTime.getTime();
      }
    });
  }, [activeReminders, completedReminders, activeTab, sortType]);

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

  const getSortLabel = (sort: SortType) => {
    switch (sort) {
      case 'date-asc':
        return 'По дате (сначала ближайшие)';
      case 'date-desc':
        return 'По дате (сначала дальние)';
      case 'title-asc':
        return 'По названию (А-Я)';
      case 'title-desc':
        return 'По названию (Я-А)';
      default:
        return 'По дате (сначала ближайшие)';
    }
  };

  const renderSortMenu = () => {
    if (!showSortMenu) return null;

    const sortOptions: SortType[] = ['date-asc', 'date-desc', 'title-asc', 'title-desc'];

    return (
      <View style={styles.sortMenuOverlay}>
        <Pressable 
          style={styles.sortMenuBackdrop} 
          onPress={() => setShowSortMenu(false)} 
        />
        <View style={styles.sortMenu}>
          <Text style={styles.sortMenuTitle}>Сортировка</Text>
          {sortOptions.map((option) => (
            <Pressable
              key={option}
              style={[
                styles.sortOption,
                sortType === option && styles.activeSortOption
              ]}
              onPress={() => {
                setSortType(option);
                setShowSortMenu(false);
              }}
            >
              <Text style={[
                styles.sortOptionText,
                sortType === option && styles.activeSortOptionText
              ]}>
                {getSortLabel(option)}
              </Text>
              {sortType === option && (
                <IconSymbol name="checkmark" size={16} color={colors.primary} />
              )}
            </Pressable>
          ))}
        </View>
      </View>
    );
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

        {/* Sort Controls */}
        {sortedReminders.length > 0 && (
          <View style={styles.sortContainer}>
            <Pressable
              style={styles.sortButton}
              onPress={() => setShowSortMenu(true)}
            >
              <IconSymbol name="arrow-up-arrow-down" size={16} color={colors.primary} />
              <Text style={styles.sortButtonText}>{getSortLabel(sortType)}</Text>
              <IconSymbol name="chevron-down" size={14} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}

        {/* Content with Enhanced Scrollbar */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
          indicatorStyle="default"
          scrollIndicatorInsets={{ right: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshReminders}
              tintColor={colors.primary}
            />
          }
        >
          {sortedReminders.length === 0 ? (
            renderEmptyState(activeTab)
          ) : (
            <View style={styles.remindersList}>
              {sortedReminders.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onEdit={handleEditReminder}
                />
              ))}
              {/* Add some bottom padding to ensure scrollbar is visible */}
              <View style={styles.bottomPadding} />
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

        {/* Sort Menu */}
        {renderSortMenu()}
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
  sortContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortButtonText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    marginRight: 4,
    flex: 1,
  },
  sortMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  sortMenuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  sortMenu: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  sortMenuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activeSortOption: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  sortOptionText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  activeSortOptionText: {
    color: colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  remindersList: {
    paddingVertical: 16,
    gap: 12,
  },
  bottomPadding: {
    height: 20,
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
