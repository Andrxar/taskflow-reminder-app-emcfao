
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { IconSymbol } from './IconSymbol';

export const AppInfo: React.FC = () => {
  const features = [
    {
      title: 'Создание напоминаний',
      description: 'Добавляйте напоминания с названием, описанием и точным временем',
    },
    {
      title: 'Управление задачами',
      description: 'Просматривайте активные и выполненные напоминания в отдельных вкладках',
    },
    {
      title: 'Звуковые уведомления',
      description: 'Звуковой сигнал воспроизводится в течение одной минуты',
    },
    {
      title: 'Отложить напоминание',
      description: 'Быстро отложите напоминание на 5 мин, 10 мин, 15 мин, 30 мин, 1 час или 1 день',
    },
    {
      title: 'Отображение поверх окон',
      description: 'Напоминания отображаются поверх других приложений (Android)',
    },
    {
      title: 'Локальное хранение',
      description: 'Все данные хранятся локально на вашем устройстве',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <IconSymbol name="bell-fill" size={48} color={colors.primary} />
        </View>
        <Text style={styles.title}>Напоминания</Text>
        <Text style={styles.version}>Версия 1.0.0</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Возможности приложения</Text>
        
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Как использовать</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionStep}>1.</Text>
            <Text style={styles.instructionText}>
              Нажмите кнопку "+" для создания нового напоминания
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionStep}>2.</Text>
            <Text style={styles.instructionText}>
              Заполните название, описание (необязательно) и выберите дату и время
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionStep}>3.</Text>
            <Text style={styles.instructionText}>
              Когда придет время, появится уведомление с возможностью отложить или завершить задачу
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionStep}>4.</Text>
            <Text style={styles.instructionText}>
              Управляйте напоминаниями через вкладки "Активные" и "Выполненные"
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Разрешения</Text>
          <Text style={styles.permissionText}>
            • <Text style={styles.bold}>Уведомления:</Text> Для отправки напоминаний в нужное время
          </Text>
          <Text style={styles.permissionText}>
            • <Text style={styles.bold}>Отображение поверх окон:</Text> Для показа напоминаний поверх других приложений (Android)
          </Text>
          <Text style={styles.permissionText}>
            • <Text style={styles.bold}>Вибрация:</Text> Для вибрационных уведомлений
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.backgroundAlt,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  version: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    padding: 20,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  featureItem: {
    backgroundColor: colors.backgroundAlt,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    ...commonStyles.card,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionStep: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 12,
    minWidth: 20,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  permissionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '600',
    color: colors.text,
  },
});
