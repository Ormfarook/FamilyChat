// src/app/_layout.tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../state/AuthContext';
import { ChatProvider } from '../state/ChatContext';
import { ServerProvider, useServer } from '../state/ServerContext';
import { colors } from '../theme/colors';

function BootGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { hydrated: serverHydrated, serverUrl } = useServer();
  const { status } = useAuth();

  useEffect(() => {
    if (!serverHydrated) return;
    const top = segments[0] ?? '';
    if (!serverUrl) {
      if (top !== 'server-setup') router.replace('/server-setup');
      return;
    }
    if (status === 'booting') return;

    const authGated = ['contacts', 'conversation', 'profile', 'admin'];
    if (status === 'anonymous') {
      if (authGated.includes(top)) router.replace('/');
    } else if (status === 'authenticated') {
      if (['', 'login', 'register', 'server-setup'].includes(top)) {
        router.replace('/contacts');
      }
    }
  }, [serverHydrated, serverUrl, status, segments, router]);

  if (!serverHydrated || status === 'booting') {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ServerProvider>
        <AuthProvider>
          <ChatProvider>
            <BootGate>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="server-setup" />
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
      </ServerProvider>
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
