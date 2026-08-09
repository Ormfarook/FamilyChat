// src/app/admin.tsx
// Admin panel: manage invites and users. Gated by currentUser.isAdmin.
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import Avatar from '../components/Avatar';
import { admin as adminApi } from '../api/endpoints';
import { useAuth } from '../state/AuthContext';
import { useChat } from '../state/ChatContext';
import { colors } from '../theme/colors';
import { fontSizes, radius, spacing } from '../theme/theme';
import type { AdminInviteRow, AdminUserRow } from '../types';
import { messageForAdminError } from '../util/adminErrors';
import { formatShortTime } from '../util/formatTime';

type Tab = 'invites' | 'users';

export default function AdminScreen() {
  const router = useRouter();
  const { currentUser, api } = useAuth();
  const { refreshContacts } = useChat();
  const [tab, setTab] = useState<Tab>('invites');

  // Non-admin fallback (route may be reachable via deep link).
  useEffect(() => {
    if (currentUser && !currentUser.isAdmin) router.replace('/contacts');
  }, [currentUser, router]);

  if (!api || !currentUser?.isAdmin) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Admin</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.tabBar}>
        <TabButton label="Invites" active={tab === 'invites'} onPress={() => setTab('invites')} />
        <TabButton label="Users" active={tab === 'users'} onPress={() => setTab('users')} />
      </View>

      {tab === 'invites' ? (
        <InvitesTab api={api} />
      ) : (
        <UsersTab api={api} currentUserId={currentUser.id} onChange={refreshContacts} />
      )}
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ---------- Invites ---------- */

function InvitesTab({ api }: { api: NonNullable<ReturnType<typeof useAuth>['api']> }) {
  const [invites, setInvites] = useState<AdminInviteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newlyCreated, setNewlyCreated] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { invites } = await adminApi(api).listInvites();
      setInvites(invites);
    } catch (err) {
      Alert.alert('Could not load invites', messageForAdminError(err));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const { code } = await adminApi(api).createInvite();
      setNewlyCreated(code);
      await load();
    } catch (err) {
      Alert.alert('Could not create invite', messageForAdminError(err));
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = (code: string) => {
    Alert.alert('Revoke invite', `Revoke code ${code}? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Revoke',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminApi(api).revokeInvite(code);
            await load();
          } catch (err) {
            Alert.alert('Could not revoke', messageForAdminError(err));
          }
        },
      },
    ]);
  };

  return (
    <>
      <View style={styles.actionBar}>
        <AppButton title={creating ? 'Creating…' : 'New invite'} onPress={handleCreate} loading={creating} />
      </View>

      <FlatList
        data={invites}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.codeText}>{item.code}</Text>
              <Text style={styles.metaText}>
                Created {formatShortTime(item.createdAt)} by {item.createdBy?.name ?? '—'}
              </Text>
              {item.consumedBy ? (
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  Used by {item.consumedBy.name} · {formatShortTime(item.consumedAt)}
                </Text>
              ) : (
                <Text style={[styles.metaText, { color: colors.online, fontWeight: '600' }]}>
                  Unused
                </Text>
              )}
            </View>
            {!item.consumedBy && (
              <>
                <TouchableOpacity
                  onPress={() => void Clipboard.setStringAsync(item.code)}
                  style={styles.rowBtn}
                >
                  <Ionicons name="copy-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRevoke(item.code)} style={styles.rowBtn}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No invites yet.</Text>
            </View>
          ) : null
        }
      />

      <Modal visible={!!newlyCreated} transparent animationType="fade" onRequestClose={() => setNewlyCreated(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New invite created</Text>
            <Text style={styles.modalSubtitle}>Share this code with the family member you're inviting:</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeBoxText}>{newlyCreated}</Text>
            </View>
            <AppButton
              title="Copy to clipboard"
              onPress={async () => {
                if (newlyCreated) await Clipboard.setStringAsync(newlyCreated);
              }}
              variant="outline"
            />
            <AppButton
              title="Done"
              onPress={() => setNewlyCreated(null)}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ---------- Users ---------- */

function UsersTab({
  api,
  currentUserId,
  onChange,
}: {
  api: NonNullable<ReturnType<typeof useAuth>['api']>;
  currentUserId: string;
  onChange: () => void | Promise<void>;
}) {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pwTarget, setPwTarget] = useState<AdminUserRow | null>(null);
  const [pwValue, setPwValue] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { users } = await adminApi(api).listUsers();
      setUsers(users);
    } catch (err) {
      Alert.alert('Could not load users', messageForAdminError(err));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (action: () => Promise<unknown>, refresh = true) => {
    try {
      await action();
      if (refresh) {
        await load();
        await onChange();
      }
    } catch (err) {
      Alert.alert('Action failed', messageForAdminError(err));
    }
  };

  const promptDelete = (user: AdminUserRow) => {
    Alert.alert(
      `Delete ${user.name}?`,
      'This removes the user and all of their messages. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => runAction(() => adminApi(api).deleteUser(user.id)),
        },
      ],
    );
  };

  const promptPromote = (user: AdminUserRow) => {
    Alert.alert('Promote to admin', `Give ${user.name} admin rights?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Promote', onPress: () => runAction(() => adminApi(api).promote(user.id)) },
    ]);
  };

  const promptDemote = (user: AdminUserRow) => {
    Alert.alert('Remove admin', `Remove admin rights from ${user.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => runAction(() => adminApi(api).demote(user.id)),
      },
    ]);
  };

  const submitPasswordReset = async () => {
    if (!pwTarget) return;
    if (pwValue.length < 8) {
      Alert.alert('Password too short', 'Must be at least 8 characters.');
      return;
    }
    setPwSaving(true);
    try {
      await adminApi(api).resetPassword(pwTarget.id, pwValue);
      Alert.alert('Password reset', `Tell ${pwTarget.name} their new password: ${pwValue}`);
      setPwTarget(null);
      setPwValue('');
    } catch (err) {
      Alert.alert('Reset failed', messageForAdminError(err));
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        renderItem={({ item }) => {
          const isSelf = item.id === currentUserId;
          return (
            <View style={styles.userRow}>
              <Avatar uri={item.avatarUrl} name={item.name} size={44} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.userName}>{item.name}</Text>
                  {item.isAdmin && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminBadgeText}>ADMIN</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.metaText}>{item.email}</Text>
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  {item.messageCount} messages · joined {formatShortTime(item.createdAt)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                {item.isAdmin ? (
                  <TouchableOpacity onPress={() => promptDemote(item)} style={styles.rowBtn}>
                    <Ionicons name="remove-circle-outline" size={22} color={colors.warning} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => promptPromote(item)} style={styles.rowBtn}>
                    <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setPwTarget(item)} style={styles.rowBtn}>
                  <Ionicons name="key-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {!isSelf && (
                  <TouchableOpacity onPress={() => promptDelete(item)} style={styles.rowBtn}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />

      <Modal
        visible={!!pwTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setPwTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reset password</Text>
            <Text style={styles.modalSubtitle}>
              Set a new password for {pwTarget?.name}. You will need to tell them.
            </Text>
            <AppInput
              label="New password"
              value={pwValue}
              onChangeText={setPwValue}
              placeholder="At least 8 characters"
              icon="lock-closed-outline"
            />
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <AppButton
                  title="Cancel"
                  variant="outline"
                  onPress={() => {
                    setPwTarget(null);
                    setPwValue('');
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppButton title="Reset" onPress={submitPasswordReset} loading={pwSaving} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ---------- styles ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.textPrimary },

  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabBtnActive: { backgroundColor: colors.primary },
  tabLabel: { color: colors.textSecondary, fontWeight: '600' },
  tabLabelActive: { color: colors.white },

  actionBar: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    letterSpacing: 1,
  },
  metaText: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  rowBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userName: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary },
  adminBadge: {
    marginLeft: spacing.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },

  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyText: { color: colors.textSecondary, fontSize: fontSizes.md },

  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  codeBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  codeBoxText: {
    fontSize: fontSizes.xl,
    fontWeight: '800',
    letterSpacing: 3,
    color: colors.primary,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
});
