
import { useNetworkState } from "expo-network";
import { Redirect, router, Stack } from "expo-router";
import { Button } from "@/components/button";
import React from "react";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { ReminderProvider } from "../../contexts/ReminderContext";
import { Alert } from "react-native";

export default function AppIndexLayout() {
  const { isConnected } = useNetworkState();

  return (
    <WidgetProvider>
      <ReminderProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#F8F9FA',
            },
            headerTintColor: '#2C3E50',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="reminders" />
          <Stack.Screen name="settings" />
        </Stack>
      </ReminderProvider>
    </WidgetProvider>
  );
}
