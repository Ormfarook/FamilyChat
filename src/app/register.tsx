// src/app/register.tsx
// Route: "/register"
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import { useAuth } from '../state/AuthContext';
import { colors } from '../theme/colors';
import { fontSizes, spacing } from '../theme/theme';
import { messageForAuthError } from '../util/authErrors';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!inviteCode || !name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({
        inviteCode: inviteCode.trim(),
        name: name.trim(),
        email: email.trim(),
        password,
      });
      router.replace('/contacts');
    } catch (e) {
      setError(messageForAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join and start chatting in seconds</Text>

          <View style={styles.form}>
            <AppInput
              label="Invite code"
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="e.g. H2X4KQZP"
              icon="key-outline"
              autoCapitalize="characters"
            />
            <AppInput
              label="Full name"
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              icon="person-outline"
              autoCapitalize="words"
            />
            <AppInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              icon="mail-outline"
              keyboardType="email-address"
            />
            <AppInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              icon="lock-closed-outline"
              secureTextEntry
            />
            <AppInput
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              icon="lock-closed-outline"
              secureTextEntry
            />

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <AppButton title="Create Account" onPress={handleRegister} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.footerLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  backButton: {
    marginTop: spacing.sm,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  form: {
    marginTop: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.sm,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
  },
  footerLink: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
});
