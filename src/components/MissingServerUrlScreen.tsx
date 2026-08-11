import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fontSizes, radius, spacing } from '../theme/theme';

// Rendered when the app was built without EXPO_PUBLIC_SERVER_URL. This is a
// build-time configuration bug — someone shipped a bundle with an empty env
// var. There's nothing an end user can do; it needs a rebuild.

export default function MissingServerUrlScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>CONFIG ERROR</Text>
        </View>
        <Text style={styles.title}>Server URL not configured</Text>
        <Text style={styles.body}>
          This build of the app has no server URL baked in.{'\n'}
          The <Text style={styles.mono}>EXPO_PUBLIC_SERVER_URL</Text> environment variable was
          empty when the bundle was built.
        </Text>

        <Text style={styles.sectionTitle}>Fix</Text>
        <Text style={styles.body}>
          Rebuild with the variable set. During dev, either:
        </Text>
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>
            {`# 1. Put it in frontend/.env (auto-loaded by Metro):
EXPO_PUBLIC_SERVER_URL=http://localhost:4000

# 2. Or set it inline when starting Expo:
EXPO_PUBLIC_SERVER_URL=<url> npx expo start`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  badgeText: { color: colors.white, fontSize: fontSizes.xs, fontWeight: '800', letterSpacing: 1 },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginTop: spacing.lg,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  body: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  mono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    color: colors.textPrimary,
    fontWeight: '600',
  },
  codeBlock: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  codeText: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
});
