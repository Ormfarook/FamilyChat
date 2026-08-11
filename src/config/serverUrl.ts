// Compile-time server URL, sourced from EXPO_PUBLIC_SERVER_URL.
// Metro inlines any EXPO_PUBLIC_* env var into the bundle at build time.
// Defaults come from frontend/.env (checked into the repo as a dev convenience).
//
// If this ends up empty at runtime, the app renders MissingServerUrlScreen —
// that's a build/config bug, not something the user should fix.

const raw = process.env.EXPO_PUBLIC_SERVER_URL ?? '';

export const SERVER_URL: string = raw.trim().replace(/\/$/, '');
export const IS_SERVER_URL_CONFIGURED = SERVER_URL.length > 0;
