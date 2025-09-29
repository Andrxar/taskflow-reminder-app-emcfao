
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: 'bell',
      title: 'Умные напоминания',
      description: 'Создавайте напоминания с точным временем и датой',
    },
    {
      icon: 'clock',
      title: 'Отложить напоминание',
      description: 'Быстро отложите напоминание на 5 мин, 10 мин, час или день',
    },
    {
      icon: 'speaker-wave-2',
      title: 'Звуковые уведомления',
      description: 'Звуковой сигнал будет играть в течение минуты',
    },
    {
      icon: 'list-bullet',
      title: 'Организация задач',
      description: 'Активные и выполненные напоминания в отдельных вкладках',
    },
    {
      icon: 'app-badge',
      title: 'Поверх всех окон',
      description: 'Напоминания отображаются поверх других приложений',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconSymbol name="bell-fill" size={64} color={colors.primary} />
          </View>
          <Text style={styles.title}>Добро пожаловать в</Text>
          <Text style={styles.appName}>Напоминания</Text>
          <Text style={styles.subtitle}>
            Ваш персональный помощник для управления задачами и событиями
          </Text>
        </View>

        <View style={styles.features}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <IconSymbol name={feature.icon as any} size={24} color={colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.getStartedButton} onPress={onGetStarted}>
          <Text style={styles.getStartedText}>Начать использование</Text>
          <IconSymbol name="arrow-right" size={20} color={colors.backgroundAlt} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...commonStyles.card,
  },
  title: {
    fontSize: 20,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundAlt,
    padding: 20,
    borderRadius: 12,
    ...commonStyles.card,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.backgroundAlt,
  },
});
