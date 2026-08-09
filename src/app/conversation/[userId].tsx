// src/app/conversation/[userId].tsx
// Route: "/conversation/:userId" — dynamic route for a single 1:1 chat.
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../../components/Avatar';
import MessageBubble from '../../components/MessageBubble';
import { useAuth } from '../../state/AuthContext';
import { useChat } from '../../state/ChatContext';
import { colors } from '../../theme/colors';
import { fontSizes, radius, spacing } from '../../theme/theme';

export default function ConversationScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { userId, userName, userAvatar } = useLocalSearchParams<{
    userId: string;
    userName: string;
    userAvatar?: string;
  }>();

  const { contacts, messagesByUser, loadConversation, sendMessage, markConversationRead, online } =
    useChat();
  const contact = contacts.find((c) => c.id === userId);
  const isOnline = online[userId] ?? contact?.online ?? false;
  const messages = messagesByUser[userId] ?? [];

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  // Load conversation history + mark read on mount, and again if userId changes.
  useEffect(() => {
    if (!userId) return;
    void (async () => {
      try {
        await loadConversation(userId);
        await markConversationRead(userId);
      } catch {
        // swallow — the user can retry by sending or navigating back
      }
    })();
  }, [userId, loadConversation, markConversationRead]);

  // Whenever a new inbound message from THIS contact arrives, mark it read.
  const latestFromOtherId = messages.length > 0 ? messages[messages.length - 1]?.id : undefined;
  const latestIsFromOther =
    messages.length > 0 && messages[messages.length - 1]?.senderId === userId;
  useEffect(() => {
    if (!userId || !latestIsFromOther) return;
    void markConversationRead(userId);
  }, [latestFromOtherId, latestIsFromOther, userId, markConversationRead]);

  const handleSend = useCallback(async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setDraft('');
    setSending(true);
    try {
      await sendMessage(userId, text);
    } catch {
      setDraft(text); // restore on failure
    } finally {
      setSending(false);
    }
  }, [draft, sending, sendMessage, userId]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Avatar uri={userAvatar || undefined} name={userName} size={38} online={isOnline} />

        <View style={styles.headerTextWrap}>
          <Text style={styles.headerName} numberOfLines={1}>
            {userName}
          </Text>
          <Text style={styles.headerStatus}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <MessageBubble message={item} isMine={item.senderId === currentUser?.id} />
          )}
        />

        <View style={styles.inputBar}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message"
            placeholderTextColor={colors.textMuted}
            style={styles.textInput}
            multiline
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!draft.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!draft.trim() || sending}
          >
            <Ionicons name="send" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.surface,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: { flex: 1, marginLeft: spacing.sm },
  headerName: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary },
  headerStatus: { fontSize: fontSizes.xs, color: colors.textSecondary },
  listContent: { paddingVertical: spacing.md, flexGrow: 1 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  sendButtonDisabled: { opacity: 0.5 },
});
