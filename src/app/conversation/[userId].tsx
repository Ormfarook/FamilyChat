// src/app/conversation/[userId].tsx
// Route: "/conversation/:userId" — dynamic route for a single 1:1 chat.
// Navigate to it with:
//   router.push({ pathname: '/conversation/[userId]', params: { userId, userName, userAvatar } })
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import { mockConversations, mockUsers } from '../../data/mockData';
import { colors } from '../../theme/colors';
import { fontSizes, radius, spacing } from '../../theme/theme';
import { Message } from '../../types';

export default function ConversationScreen() {
  const router = useRouter();
  const { userId, userName, userAvatar } = useLocalSearchParams<{
    userId: string;
    userName: string;
    userAvatar?: string;
  }>();

  const contact = mockUsers.find((u) => u.id === userId);
  const [messages, setMessages] = useState<Message[]>(mockConversations[userId] ?? []);
  const [draft, setDraft] = useState('');

  const handleSend = () => {
    if (!draft.trim()) return;
    const newMessage: Message = {
      id: `local-${Date.now()}`,
      senderId: 'me',
      text: draft.trim(),
      timestamp: 'Now',
      status: 'sent',
    };
    // TODO: send `newMessage.text` to your backend / socket, then reconcile
    // the optimistic message above with the server response.
    setMessages((prev) => [...prev, newMessage]);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Avatar uri={userAvatar || undefined} name={userName} size={38} online={contact?.online} />

        <View style={styles.headerTextWrap}>
          <Text style={styles.headerName} numberOfLines={1}>
            {userName}
          </Text>
          <Text style={styles.headerStatus}>{contact?.online ? 'Online' : 'Offline'}</Text>
        </View>

        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="call-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <MessageBubble message={item} isMine={item.senderId === 'me'} />}
        />

        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message"
            placeholderTextColor={colors.textMuted}
            style={styles.textInput}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  headerTextWrap: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerName: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerStatus: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  listContent: {
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  attachButton: {
    width: 38,
    height: 38,
    borderRadius: radius.round,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
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
});
