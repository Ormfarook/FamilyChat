import { ApiRequestError } from '../api/client';

const AUTH_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Wrong email or password.',
  email_taken: 'That email is already in use.',
  invalid_invite: 'Invite code not recognised.',
  invite_already_used: 'That invite code has already been used.',
  invalid_body: 'Please check your details and try again.',
  server_not_configured: 'Server address not set — go back to setup.',
};

export function messageForAuthError(err: unknown): string {
  if (err instanceof ApiRequestError) {
    return AUTH_MESSAGES[err.code] ?? 'Something went wrong, please try again.';
  }
  if (err instanceof Error && AUTH_MESSAGES[err.message]) {
    return AUTH_MESSAGES[err.message]!;
  }
  return 'Could not reach the server. Check your connection.';
}
