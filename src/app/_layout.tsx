// src/app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="contacts" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="conversation/[userId]" />
      </Stack>
    </SafeAreaProvider>
  );
}