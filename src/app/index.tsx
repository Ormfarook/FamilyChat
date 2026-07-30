// src/app/index.tsx
// Route: "/" — this is the Welcome/Home screen, the app's default entry route.
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import { colors } from '../theme/colors';
import { fontSizes, radius, spacing } from '../theme/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.topSection}>
        <View style={styles.logoCircle}>
          <Ionicons name="chatbubble-ellipses" size={44} color={colors.white} />
        </View>
        <Text style={styles.appName}>ChatWave</Text>
        <Text style={styles.tagline}>Fast, simple and secure messaging</Text>
      </View>

      <View style={styles.illustrationRow}>
        <View style={[styles.floatBubble, styles.floatBubbleLeft]} />
        <View style={[styles.floatBubble, styles.floatBubbleRight]} />
      </View>

      <View style={styles.bottomSection}>
        <AppButton title="Log In" onPress={() => router.push('/login')} />
        <AppButton
          title="Create Account"
          variant="outline"
          onPress={() => router.push('/register')}
          style={{ marginTop: spacing.md }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: fontSizes.xxxl,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: fontSizes.md,
    color: colors.primaryLight,
    marginTop: spacing.xs,
  },
  illustrationRow: {
    flex: 1,
    justifyContent: 'center',
  },
  floatBubble: {
    position: 'absolute',
    borderRadius: radius.xl,
    backgroundColor: 'rgba(92,157,255,0.15)',
  },
  floatBubbleLeft: {
    width: 180,
    height: 90,
    left: -40,
    top: '20%',
    transform: [{ rotate: '-8deg' }],
  },
  floatBubbleRight: {
    width: 220,
    height: 100,
    right: -60,
    top: '55%',
    transform: [{ rotate: '10deg' }],
  },
  bottomSection: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
});