// Shared types mirror the backend's public shapes:
//   User    ← backend util/publicUser.ts (PublicUser)
//   Contact ← backend services/users.ts (ContactSummary)
//   Message ← backend services/messages.ts (PublicMessage)

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface User {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
}

export interface Contact {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  online?: boolean; // populated by realtime presence, not the REST payload
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  createdAt: string;
  deliveredAt: string | null;
  readAt: string | null;
  status: MessageStatus;
  clientTempId?: string;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

// Admin-only shapes — mirror backend/src/services/admin.ts.
export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  createdAt: string;
  messageCount: number;
}

export interface AdminInviteRow {
  code: string;
  createdBy: { id: string; name: string } | null;
  consumedBy: { id: string; name: string } | null;
  createdAt: string;
  consumedAt: string | null;
}
