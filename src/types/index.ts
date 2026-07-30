// src/types/index.ts
// Shared data models. Replace / extend these once your backend API contracts
// are finalized (e.g. add fields returned by your auth or chat service).

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar?: string | null;
  online?: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  senderId: string; // 'me' for the current user, or the contact's id
  text: string;
  timestamp: string; // ISO string or preformatted display time
  status?: MessageStatus;
}
