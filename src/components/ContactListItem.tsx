// src/components/ContactListItem.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { fontSizes, radius, spacing } from '../theme/theme';
import { User } from '../types';
import Avatar from './Avatar';

interface ContactListItemProps {
  user: User;
  onPress: () => void;
}

export default function ContactListItem({ user, onPress }: ContactListItemProps) {
  const hasUnread = !!user.unreadCount && user.unreadCount > 0;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.container}>
      <Avatar uri={user.avatar} name={user.name} size={54} online={user.online} />

      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          {user.name}
        </Text>
        <Text
          style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
          numberOfLines={1}
        >
          {user.lastMessage ?? 'Say hello 👋'}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.time}>{user.lastMessageTime ?? ''}</Text>
        {hasUnread && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{user.unreadCount}</Text>
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
  middle: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  lastMessageUnread: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  right: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
  time: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
