// src/app/_layout.tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MissingServerUrlScreen from '../components/MissingServerUrlScreen';
import { IS_SERVER_URL_CONFIGURED } from '../config/serverUrl';
import { AuthProvider, useAuth } from '../state/AuthContext';
import { ChatProvider } from '../state/ChatContext';
import { colors } from '../theme/colors';

function BootGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'booting') return;
    const top = segments[0] ?? '';
    const authGated = ['contacts', 'conversation', 'profile', 'admin'];
    if (status === 'anonymous') {
      if (authGated.includes(top)) router.replace('/');
    } else if (status === 'authenticated') {
      if (['', 'login', 'register'].includes(top)) router.replace('/contacts');
    }
  }, [status, segments, router]);

  if (status === 'booting') {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }
  return <>{children}</>;
}

export default function RootLayout() {
  if (!IS_SERVER_URL_CONFIGURED) {
    return (
      <SafeAreaProvider>
        <MissingServerUrlScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ChatProvider>
          <BootGate>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="contacts" />
              <Stack.Screen name="profile" />
              <Stack.Screen name="admin" />
              <Stack.Screen name="conversation/[userId]" />
            </Stack>
          </BootGate>
        </ChatProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
