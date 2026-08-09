// src/app/profile.tsx
// Route: "/profile"
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
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
import Avatar from '../components/Avatar';
import { me as meApi } from '../api/endpoints';
import { useAuth } from '../state/AuthContext';
import { useServer } from '../state/ServerContext';
import { colors } from '../theme/colors';
import { fontSizes, radius, spacing } from '../theme/theme';

// requires `expo-image-picker` and, on iOS/Android, photo-library permission
// entries in app.json (not needed for the web build).

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, api, logout, setCurrentUser } = useAuth();
  const { setServerUrl, isBaked } = useServer();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name ?? '');
  const [bio, setBio] = useState(currentUser?.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChangePicture = async () => {
    if (!api) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to change your picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      const form = new FormData();
      if (Platform.OS === 'web') {
        const blobRes = await fetch(asset.uri);
        const blob = await blobRes.blob();
        form.append('file', blob, asset.fileName ?? 'avatar.jpg');
      } else {
        const filename = asset.fileName ?? asset.uri.split('/').pop() ?? 'avatar.jpg';
        const type = asset.mimeType ?? guessMime(filename);
        // React Native FormData accepts { uri, name, type }
        form.append('file', { uri: asset.uri, name: filename, type } as unknown as Blob);
      }
      const { user } = await meApi(api).uploadAvatar(form);
      setCurrentUser(user);
    } catch {
      Alert.alert('Upload failed', 'Could not upload that image. Try a different one.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!api) return;
    setSaving(true);
    try {
      const trimmedName = name.trim();
      const nextBio = bio.trim().length > 0 ? bio.trim() : null;
      const { user } = await meApi(api).patch({
        ...(trimmedName ? { name: trimmedName } : {}),
        bio: nextBio,
      });
      setCurrentUser(user);
      setEditing(false);
    } catch {
      Alert.alert('Could not save', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const handleChangeServer = () => {
    Alert.alert(
      'Change server',
      'This will log you out and take you back to the server-setup screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: async () => {
            await logout();
            await setServerUrl(null);
            router.replace('/server-setup');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)} style={styles.headerButton}>
          <Ionicons
            name={editing ? 'close-outline' : 'create-outline'}
            size={22}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <View>
            <Avatar uri={currentUser?.avatarUrl} name={currentUser?.name} size={110} />
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleChangePicture}
              disabled={uploading}
            >
              <Ionicons name={uploading ? 'hourglass-outline' : 'camera'} size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
          {!editing && <Text style={styles.name}>{currentUser?.name}</Text>}
        </View>

        {editing ? (
          <View style={styles.form}>
            <AppInput label="Full name" value={name} onChangeText={setName} icon="person-outline" />
            <AppInput
              label="Bio"
              value={bio}
              onChangeText={setBio}
              icon="chatbox-ellipses-outline"
              multiline
            />
            <AppButton title="Save changes" onPress={handleSave} loading={saving} />
          </View>
        ) : (
          <View style={styles.detailsCard}>
            <DetailRow icon="mail-outline" label="Email" value={currentUser?.email ?? '-'} />
            <DetailRow
              icon="chatbox-ellipses-outline"
              label="Bio"
              value={currentUser?.bio ?? '-'}
            />
          </View>
        )}

        {currentUser?.isAdmin && (
          <AppButton
            title="Admin panel"
            variant="outline"
            onPress={() => router.push('/admin')}
            style={{ marginTop: spacing.lg }}
          />
        )}
        {!isBaked && (
          <AppButton
            title="Change server"
            variant="text"
            onPress={handleChangeServer}
            style={{ marginTop: currentUser?.isAdmin ? spacing.sm : spacing.lg }}
          />
        )}
        <AppButton
          title="Log Out"
          variant="outline"
          onPress={handleLogout}
          style={{ marginTop: spacing.sm }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function guessMime(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.textPrimary },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  avatarSection: { alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.lg },
  cameraButton: {
    position: 'absolute',
    right: -2,
    bottom: 2,
    width: 34,
    height: 34,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  name: {
    marginTop: spacing.sm,
    fontSize: fontSizes.xl,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  form: { marginTop: spacing.sm },
  detailsCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.round,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  detailLabel: { fontSize: fontSizes.xs, color: colors.textMuted },
  detailValue: {
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
});
