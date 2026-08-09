import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { messages as messagesApi, users as usersApi } from '../api/endpoints';
import type { Contact, Message } from '../types';

interface ChatContextValue {
  contacts: Contact[];
  contactsLoading: boolean;
  refreshContacts(): Promise<void>;
  messagesByUser: Record<string, Message[]>;
  loadConversation(userId: string): Promise<void>;
  sendMessage(userId: string, text: string): Promise<void>;
  markConversationRead(userId: string): Promise<void>;
  online: Record<string, boolean>;
  connected: boolean;
}

const Ctx = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { status, token, api, serverUrl, currentUser } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [messagesByUser, setMessagesByUser] = useState<Record<string, Message[]>>({});
  const [online, setOnline] = useState<Record<string, boolean>>({});
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Refresh contacts list.
  const refreshContacts = useCallback(async () => {
    if (!api) return;
    setContactsLoading(true);
    try {
      const { users } = await usersApi(api).list();
      setContacts((prev) => {
        // preserve online state we've observed via realtime
        const onlineMap = prev.reduce<Record<string, boolean>>((acc, c) => {
          if (c.online != null) acc[c.id] = c.online;
          return acc;
        }, {});
        return users.map((u) => ({ ...u, online: online[u.id] ?? onlineMap[u.id] }));
      });
    } finally {
      setContactsLoading(false);
    }
  }, [api, online]);

  const loadConversation = useCallback(
    async (userId: string) => {
      if (!api) return;
      const { messages: msgs } = await messagesApi(api).list(userId);
      setMessagesByUser((prev) => ({ ...prev, [userId]: msgs }));
    },
    [api],
  );

  const sendMessage = useCallback(
    async (userId: string, text: string) => {
      if (!api || !currentUser) return;
      const tempId = `local-${Date.now()}`;
      const optimistic: Message = {
        id: tempId,
        senderId: currentUser.id,
        recipientId: userId,
        text,
        createdAt: new Date().toISOString(),
        deliveredAt: null,
        readAt: null,
        status: 'sent',
        clientTempId: tempId,
      };
      setMessagesByUser((prev) => ({
        ...prev,
        [userId]: [...(prev[userId] ?? []), optimistic],
      }));

      try {
        const { message } = await messagesApi(api).send(userId, text, tempId);
        setMessagesByUser((prev) => ({
          ...prev,
          [userId]: (prev[userId] ?? []).map((m) => (m.id === tempId || m.clientTempId === tempId ? message : m)),
        }));
      } catch (err) {
        // rollback on error
        setMessagesByUser((prev) => ({
          ...prev,
          [userId]: (prev[userId] ?? []).filter((m) => m.id !== tempId),
        }));
        throw err;
      }
    },
    [api, currentUser],
  );

  const markConversationRead = useCallback(
    async (userId: string) => {
      if (!api) return;
      const { readIds } = await messagesApi(api).markConversationRead(userId);
      if (readIds.length > 0) {
        const readAt = new Date().toISOString();
        setMessagesByUser((prev) => ({
          ...prev,
          [userId]: (prev[userId] ?? []).map((m) =>
            readIds.includes(m.id) ? { ...m, readAt, status: 'read' } : m,
          ),
        }));
        setContacts((prev) => prev.map((c) => (c.id === userId ? { ...c, unreadCount: 0 } : c)));
      }
    },
    [api],
  );

  // Socket lifecycle.
  useEffect(() => {
    if (status !== 'authenticated' || !serverUrl || !token || !currentUser) return;

    const sock = io(serverUrl, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = sock;

    sock.on('connect', () => setConnected(true));
    sock.on('disconnect', () => setConnected(false));
    sock.on('connect_error', () => setConnected(false));

    sock.on('presence:snapshot', (data: { onlineUserIds: string[] }) => {
      const map: Record<string, boolean> = {};
      for (const id of data.onlineUserIds) map[id] = true;
      setOnline(map);
      setContacts((prev) => prev.map((c) => ({ ...c, online: map[c.id] ?? false })));
    });

    sock.on('presence:update', (data: { userId: string; online: boolean }) => {
      setOnline((prev) => ({ ...prev, [data.userId]: data.online }));
      setContacts((prev) => prev.map((c) => (c.id === data.userId ? { ...c, online: data.online } : c)));
    });

    sock.on('message:new', (msg: Message) => {
      const otherId = msg.senderId === currentUser.id ? msg.recipientId : msg.senderId;
      setMessagesByUser((prev) => {
        const existing = prev[otherId] ?? [];
        // reconcile any optimistic message with the same clientTempId
        const idx = msg.clientTempId
          ? existing.findIndex((m) => m.clientTempId === msg.clientTempId)
          : -1;
        if (idx >= 0) {
          const next = existing.slice();
          next[idx] = msg;
          return { ...prev, [otherId]: next };
        }
        if (existing.some((m) => m.id === msg.id)) return prev;
        return { ...prev, [otherId]: [...existing, msg] };
      });
      setContacts((prev) =>
        prev.map((c) =>
          c.id === otherId
            ? {
                ...c,
                lastMessage: msg.text,
                lastMessageAt: msg.createdAt,
                unreadCount:
                  msg.senderId === currentUser.id ? c.unreadCount : (c.unreadCount ?? 0) + 1,
              }
            : c,
        ),
      );
    });

    sock.on('message:delivered', (data: { messageIds: string[]; deliveredAt: string }) => {
      setMessagesByUser((prev) => {
        const next: Record<string, Message[]> = {};
        for (const [uid, list] of Object.entries(prev)) {
          next[uid] = list.map((m) =>
            data.messageIds.includes(m.id) && !m.deliveredAt
              ? { ...m, deliveredAt: data.deliveredAt, status: m.readAt ? 'read' : 'delivered' }
              : m,
          );
        }
        return next;
      });
    });

    sock.on('message:read', (data: { messageIds: string[]; readAt: string }) => {
      setMessagesByUser((prev) => {
        const next: Record<string, Message[]> = {};
        for (const [uid, list] of Object.entries(prev)) {
          next[uid] = list.map((m) =>
            data.messageIds.includes(m.id) ? { ...m, readAt: data.readAt, status: 'read' } : m,
          );
        }
        return next;
      });
    });

    return () => {
      sock.close();
      socketRef.current = null;
      setConnected(false);
    };
  }, [status, serverUrl, token, currentUser]);

  // Initial contact load after auth is established.
  useEffect(() => {
    if (status === 'authenticated') void refreshContacts();
    if (status === 'anonymous') {
      setContacts([]);
      setMessagesByUser({});
      setOnline({});
    }
    // We intentionally do NOT depend on refreshContacts to avoid loops when
    // its identity changes with `online`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const value = useMemo<ChatContextValue>(
    () => ({
      contacts,
      contactsLoading,
      refreshContacts,
      messagesByUser,
      loadConversation,
      sendMessage,
      markConversationRead,
      online,
      connected,
    }),
    [
      contacts,
      contactsLoading,
      refreshContacts,
      messagesByUser,
      loadConversation,
      sendMessage,
      markConversationRead,
      online,
      connected,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useChat(): ChatContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useChat must be used inside ChatProvider');
  return v;
}
