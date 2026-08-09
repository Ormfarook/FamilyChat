import type { ApiClient } from './client';
import type { AdminInviteRow, AdminUserRow, Contact, Message, User } from '../types';

export interface AuthResponse {
  token: string;
  user: User;
}

export function auth(api: ApiClient) {
  return {
    register: (input: { inviteCode: string; name: string; email: string; password: string }) =>
      api.post<AuthResponse>('/auth/register', input),
    login: (input: { email: string; password: string }) =>
      api.post<AuthResponse>('/auth/login', input),
    me: () => api.get<{ user: User }>('/me'),
    logout: () => api.post<{ ok: boolean }>('/auth/logout'),
  };
}

export function users(api: ApiClient) {
  return {
    list: () => api.get<{ users: Contact[] }>('/users'),
    get: (id: string) => api.get<{ user: User }>(`/users/${id}`),
  };
}

export function me(api: ApiClient) {
  return {
    patch: (input: { name?: string; bio?: string | null }) =>
      api.patch<{ user: User }>('/me', input),
    uploadAvatar: (form: FormData) => api.postForm<{ user: User }>('/me/avatar', form),
  };
}

export function admin(api: ApiClient) {
  return {
    listInvites: () => api.get<{ invites: AdminInviteRow[] }>('/admin/invites'),
    createInvite: () => api.post<{ code: string }>('/admin/invites'),
    revokeInvite: (code: string) =>
      api.request<{ ok: boolean }>('DELETE', `/admin/invites/${encodeURIComponent(code)}`),
    listUsers: () => api.get<{ users: AdminUserRow[] }>('/admin/users'),
    promote: (id: string) => api.post<{ ok: boolean }>(`/admin/users/${id}/promote`),
    demote: (id: string) => api.post<{ ok: boolean }>(`/admin/users/${id}/demote`),
    deleteUser: (id: string) =>
      api.request<{ ok: boolean }>('DELETE', `/admin/users/${id}`),
    resetPassword: (id: string, password: string) =>
      api.post<{ ok: boolean }>(`/admin/users/${id}/reset-password`, { password }),
  };
}

export function messages(api: ApiClient) {
  return {
    list: (userId: string, opts: { before?: string; limit?: number } = {}) => {
      const params = new URLSearchParams();
      if (opts.before) params.set('before', opts.before);
      if (opts.limit != null) params.set('limit', String(opts.limit));
      const qs = params.toString();
      return api.get<{ messages: Message[] }>(
        `/conversations/${userId}/messages${qs ? `?${qs}` : ''}`,
      );
    },
    send: (userId: string, text: string, clientTempId?: string) =>
      api.post<{ message: Message }>(`/conversations/${userId}/messages`, {
        text,
        ...(clientTempId ? { clientTempId } : {}),
      }),
    markConversationRead: (userId: string) =>
      api.post<{ readIds: string[] }>(`/conversations/${userId}/read`),
  };
}
