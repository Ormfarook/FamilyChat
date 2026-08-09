import { ApiRequestError } from '../api/client';

const ADMIN_MESSAGES: Record<string, string> = {
  last_admin: 'Cannot remove the last admin — promote someone else first.',
  cannot_delete_self: 'You cannot delete your own account.',
  invite_already_used: 'That invite has already been used — it can\'t be revoked.',
  invite_not_found: 'That invite no longer exists.',
  user_not_found: 'That user no longer exists.',
  password_too_short: 'Password must be at least 8 characters.',
  invalid_body: 'Please check the details and try again.',
};

export function messageForAdminError(err: unknown): string {
  if (err instanceof ApiRequestError) {
    return ADMIN_MESSAGES[err.code] ?? 'That action failed. Please try again.';
  }
  return 'Could not reach the server.';
}
