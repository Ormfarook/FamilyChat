// src/app/server-setup.tsx
// First-run screen: user enters the URL of the family server (e.g. http://192.168.0.105:4000).
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import { useServer } from '../state/ServerContext';
import { colors } from '../theme/colors';
import { fontSizes, radius, spacing } from '../theme/theme';

export default function ServerSetupScreen() {
  const router = useRouter();
  const { serverUrl, setServerUrl } = useServer();
  const [url, setUrl] = useState(serverUrl ?? '');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!url.trim()) {
      setError('Enter your family server address.');
      return;
    }
    setError('');
    setChecking(true);
    try {
      // Normalize + probe /health so we fail fast on typos before persisting.
      const normalized = url.trim().replace(/\/$/, '');
      const withScheme = /^https?:\/\//i.test(normalized) ? normalized : `http://${normalized}`;
      const res = await fetch(`${withScheme}/health`);
      if (!res.ok) throw new Error(`http_${res.status}`);
      await setServerUrl(withScheme);
      router.replace('/');
    } catch {
      setError('Could not reach that server. Check the address and try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoCircle}>
            <Ionicons name="server-outline" size={36} color={colors.white} />
          </View>
          <Text style={styles.title}>Connect to your family server</Text>
          <Text style={styles.subtitle}>
            Enter the address the person running the server gave you. Something like{'\n'}
            <Text style={styles.mono}>http://192.168.1.20:4000</Text>
          </Text>

          <View style={styles.form}>
            <AppInput
              label="Server address"
              value={url}
              onChangeText={setUrl}
              placeholder="http://192.168.1.20:4000"
              icon="link-outline"
              autoCapitalize="none"
            />
            {!!error && <Text style={styles.errorText}>{error}</Text>}
            <AppButton title="Connect" onPress={handleSave} loading={checking} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  logoCircle: {
    alignSelf: 'center',
    width: 76,
    height: 76,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  mono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    color: colors.textPrimary,
  },
  form: { marginTop: spacing.xl },
  errorText: { color: colors.error, marginBottom: spacing.sm, fontSize: fontSizes.sm },
});
