// src/components/MessageBubble.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fontSizes, radius, spacing } from '../theme/theme';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

function formatBubbleTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, isMine }: MessageBubbleProps) {
  const showDoubleTick = message.status === 'read' || message.status === 'delivered';
  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
      <View
        style={[
          styles.bubble,
          isMine ? styles.bubbleMine : styles.bubbleTheirs,
          isMine ? styles.tailMine : styles.tailTheirs,
        ]}
      >
        <Text style={isMine ? styles.textMine : styles.textTheirs}>{message.text}</Text>
        <View style={styles.metaRow}>
          <Text style={isMine ? styles.timeMine : styles.timeTheirs}>
            {formatBubbleTime(message.createdAt)}
          </Text>
          {isMine && message.status && (
            <Ionicons
              name={showDoubleTick ? 'checkmark-done' : 'checkmark'}
              size={14}
              color={message.status === 'read' ? colors.accent : 'rgba(255,255,255,0.8)'}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: spacing.xs / 2,
    paddingHorizontal: spacing.md,
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowTheirs: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  bubbleMine: {
    backgroundColor: colors.bubbleMine,
  },
  bubbleTheirs: {
    backgroundColor: colors.bubbleTheirs,
  },
  tailMine: {
    borderBottomRightRadius: 4,
  },
  tailTheirs: {
    borderBottomLeftRadius: 4,
  },
  textMine: {
    color: colors.bubbleMineText,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  textTheirs: {
    color: colors.bubbleTheirsText,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeMine: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  timeTheirs: {
    fontSize: 10,
    color: colors.textMuted,
  },
});
