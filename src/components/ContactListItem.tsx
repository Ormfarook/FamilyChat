// src/components/ContactListItem.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { fontSizes, radius, spacing } from '../theme/theme';
import type { Contact } from '../types';
import { formatShortTime } from '../util/formatTime';
import Avatar from './Avatar';

interface ContactListItemProps {
  contact: Contact;
  onPress: () => void;
}

export default function ContactListItem({ contact, onPress }: ContactListItemProps) {
  const hasUnread = contact.unreadCount > 0;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.container}>
      <Avatar uri={contact.avatarUrl} name={contact.name} size={54} online={contact.online} />

      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          {contact.name}
        </Text>
        <Text
          style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
          numberOfLines={1}
        >
          {contact.lastMessage ?? 'Say hello 👋'}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.time}>{formatShortTime(contact.lastMessageAt)}</Text>
        {hasUnread && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{contact.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  middle: { flex: 1, marginLeft: spacing.md },
  name: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  lastMessage: { fontSize: fontSizes.sm, color: colors.textSecondary },
  lastMessageUnread: { color: colors.textPrimary, fontWeight: '600' },
  right: { alignItems: 'flex-end', marginLeft: spacing.sm },
  time: { fontSize: fontSizes.xs, color: colors.textMuted, marginBottom: spacing.xs },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
});
