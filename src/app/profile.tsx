// src/app/profile.tsx
// Route: "/profile"
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import Avatar from '../components/Avatar';
import { mockCurrentUser } from '../data/mockData';
import { colors } from '../theme/colors';
import { fontSizes, radius, spacing } from '../theme/theme';

// NOTE: requires `npx expo install expo-image-picker` and, on iOS/Android,
// the relevant photo-library permission entries in app.json if not already present.

export default function ProfileScreen() {
  const router = useRouter();
  const [avatar, setAvatar] = useState<string | null>(mockCurrentUser.avatar ?? null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(mockCurrentUser.name);
  const [bio, setBio] = useState(mockCurrentUser.bio ?? '');

  const handleChangePicture = async () => {
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
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
      // TODO: upload the new image to your backend / storage here
    }
  };

  const handleSave = () => {
    // TODO: persist { name, bio, avatar } via your API
    setEditing(false);
  };

  const handleLogout = () => {
    router.replace('/');
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
            <Avatar uri={avatar} name={name} size={110} />
            <TouchableOpacity style={styles.cameraButton} onPress={handleChangePicture}>
              <Ionicons name="camera" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
          {!editing && <Text style={styles.name}>{name}</Text>}
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
            <AppButton title="Save changes" onPress={handleSave} />
          </View>
        ) : (
          <View style={styles.detailsCard}>
            <DetailRow icon="mail-outline" label="Email" value={mockCurrentUser.email ?? '-'} />
            <DetailRow icon="call-outline" label="Phone" value={mockCurrentUser.phone ?? '-'} />
            <DetailRow icon="chatbox-ellipses-outline" label="Bio" value={bio || '-'} />
          </View>
        )}

        <AppButton
          title="Log Out"
          variant="outline"
          onPress={handleLogout}
          style={{ marginTop: spacing.lg }}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
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
  form: {
    marginTop: spacing.sm,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.round,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  detailLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
});
