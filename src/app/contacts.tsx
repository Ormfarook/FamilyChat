// src/app/contacts.tsx
// Route: "/contacts" — list of family members with unread + last message.
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import ContactListItem from '../components/ContactListItem';
import { useAuth } from '../state/AuthContext';
import { useChat } from '../state/ChatContext';
import { colors } from '../theme/colors';
import { fontSizes, radius, spacing } from '../theme/theme';

export default function ContactsScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { contacts, contactsLoading, refreshContacts, connected } = useChat();
  const [query, setQuery] = useState('');

  const filteredContacts = useMemo(() => {
    if (!query.trim()) return contacts;
    const q = query.toLowerCase();
    return contacts.filter((c) => c.name.toLowerCase().includes(q));
  }, [query, contacts]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Chats</Text>
          <View
            style={[styles.connDot, { backgroundColor: connected ? colors.online : colors.offline }]}
          />
        </View>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Avatar uri={currentUser?.avatarUrl} name={currentUser?.name} size={38} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search contacts"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={contactsLoading}
            onRefresh={refreshContacts}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <ContactListItem
            contact={item}
            onPress={() =>
              router.push({
                pathname: '/conversation/[userId]',
                params: {
                  userId: item.id,
                  userName: item.name,
                  userAvatar: item.avatarUrl ?? '',
                },
              })
            }
          />
        )}
        ListEmptyComponent={
          contactsLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No one else here yet.</Text>
              <Text style={styles.emptyHint}>
                Ask the admin to generate an invite code for another family member.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerTitle: { fontSize: fontSizes.xxl, fontWeight: '800', color: colors.textPrimary },
  connDot: {
    width: 10,
    height: 10,
    borderRadius: radius.round,
    marginLeft: spacing.sm,
    marginTop: 6,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: fontSizes.sm, color: colors.textPrimary },
  listContent: { paddingBottom: spacing.xl, flexGrow: 1 },
  separator: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: spacing.md + 54 + spacing.md,
  },
  emptyState: { alignItems: 'center', marginTop: spacing.xxl, paddingHorizontal: spacing.lg },
  emptyText: { color: colors.textPrimary, fontSize: fontSizes.md, fontWeight: '600' },
  emptyHint: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
