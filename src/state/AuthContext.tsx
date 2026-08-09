import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { storage, StorageKeys } from '../config/storage';
import { createApiClient, ApiRequestError, type ApiClient } from '../api/client';
import { auth as authEndpoints } from '../api/endpoints';
import { useServer } from './ServerContext';
import type { User } from '../types';

type Status = 'booting' | 'anonymous' | 'authenticated';

interface AuthContextValue {
  status: Status;
  token: string | null;
  currentUser: User | null;
  api: ApiClient | null;
  serverUrl: string | null;
  login(input: { email: string; password: string }): Promise<void>;
  register(input: { inviteCode: string; name: string; email: string; password: string }): Promise<void>;
  logout(): Promise<void>;
  refreshMe(): Promise<void>;
  setCurrentUser(user: User): void;
}

const Ctx = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { serverUrl, hydrated: serverHydrated } = useServer();
  const [status, setStatus] = useState<Status>('booting');
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = token;

  const api = useMemo<ApiClient | null>(() => {
    if (!serverUrl) return null;
    return createApiClient({ baseUrl: serverUrl, getToken: () => tokenRef.current });
  }, [serverUrl]);

  // Boot: load persisted token + user, then verify with /me.
  useEffect(() => {
    if (!serverHydrated) return;

    if (!serverUrl) {
      setStatus('anonymous');
      return;
    }

    let cancelled = false;
    (async () => {
      setStatus('booting');
      const [storedToken, storedUserRaw] = await Promise.all([
        storage.get(StorageKeys.Token),
        storage.get(StorageKeys.CurrentUser),
      ]);
      if (cancelled) return;

      if (!storedToken) {
        setStatus('anonymous');
        return;
      }

      setToken(storedToken);
      if (storedUserRaw) {
        try {
          setCurrentUserState(JSON.parse(storedUserRaw) as User);
        } catch {
          // discard stale cache
        }
      }

      const client = createApiClient({
        baseUrl: serverUrl,
        getToken: () => storedToken,
      });
      try {
        const { user } = await authEndpoints(client).me();
        if (cancelled) return;
        setCurrentUserState(user);
        await storage.set(StorageKeys.CurrentUser, JSON.stringify(user));
        setStatus('authenticated');
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiRequestError && err.status === 401) {
          await storage.delete(StorageKeys.Token);
          await storage.delete(StorageKeys.CurrentUser);
          setToken(null);
          setCurrentUserState(null);
          setStatus('anonymous');
        } else {
          // Network error: keep cached credentials but treat as anonymous for now
          // so the user can retry (or re-enter server URL).
          setStatus('anonymous');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [serverHydrated, serverUrl]);

  const persistSession = useCallback(async (t: string, u: User) => {
    tokenRef.current = t;
    setToken(t);
    setCurrentUserState(u);
    await storage.set(StorageKeys.Token, t);
    await storage.set(StorageKeys.CurrentUser, JSON.stringify(u));
    setStatus('authenticated');
  }, []);

  const login = useCallback<AuthContextValue['login']>(
    async (input) => {
      if (!api) throw new Error('server_not_configured');
      const res = await authEndpoints(api).login(input);
      await persistSession(res.token, res.user);
    },
    [api, persistSession],
  );

  const register = useCallback<AuthContextValue['register']>(
    async (input) => {
      if (!api) throw new Error('server_not_configured');
      const res = await authEndpoints(api).register(input);
      await persistSession(res.token, res.user);
    },
    [api, persistSession],
  );

  const logout = useCallback(async () => {
    if (api && tokenRef.current) {
      try {
        await authEndpoints(api).logout();
      } catch {
        // logout is best-effort; even on failure we clear locally
      }
    }
    await storage.delete(StorageKeys.Token);
    await storage.delete(StorageKeys.CurrentUser);
    tokenRef.current = null;
    setToken(null);
    setCurrentUserState(null);
    setStatus('anonymous');
  }, [api]);

  const refreshMe = useCallback(async () => {
    if (!api) return;
    const { user } = await authEndpoints(api).me();
    setCurrentUserState(user);
    await storage.set(StorageKeys.CurrentUser, JSON.stringify(user));
  }, [api]);

  const setCurrentUser = useCallback((user: User) => {
    setCurrentUserState(user);
    void storage.set(StorageKeys.CurrentUser, JSON.stringify(user));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      token,
      currentUser,
      api,
      serverUrl,
      login,
      register,
      logout,
      refreshMe,
      setCurrentUser,
    }),
    [status, token, currentUser, api, serverUrl, login, register, logout, refreshMe, setCurrentUser],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
}
