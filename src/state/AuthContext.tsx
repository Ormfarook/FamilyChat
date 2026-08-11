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
import { SERVER_URL } from '../config/serverUrl';
import type { User } from '../types';

type Status = 'booting' | 'anonymous' | 'authenticated';

interface AuthContextValue {
  status: Status;
  token: string | null;
  currentUser: User | null;
  api: ApiClient;
  serverUrl: string;
  login(input: { email: string; password: string }): Promise<void>;
  register(input: { inviteCode: string; name: string; email: string; password: string }): Promise<void>;
  logout(): Promise<void>;
  refreshMe(): Promise<void>;
  setCurrentUser(user: User): void;
}

const Ctx = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('booting');
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = token;

  const api = useMemo<ApiClient>(
    () => createApiClient({ baseUrl: SERVER_URL, getToken: () => tokenRef.current }),
    [],
  );

  // Boot: load persisted token + user, then verify with /me.
  useEffect(() => {
    let cancelled = false;
    (async () => {
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

      const bootClient = createApiClient({ baseUrl: SERVER_URL, getToken: () => storedToken });
      try {
        const { user } = await authEndpoints(bootClient).me();
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
          // Network error: keep cached credentials but treat as anonymous so
          // the user can retry via a fresh login.
          setStatus('anonymous');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
      const res = await authEndpoints(api).login(input);
      await persistSession(res.token, res.user);
    },
    [api, persistSession],
  );

  const register = useCallback<AuthContextValue['register']>(
    async (input) => {
      const res = await authEndpoints(api).register(input);
      await persistSession(res.token, res.user);
    },
    [api, persistSession],
  );

  const logout = useCallback(async () => {
    if (tokenRef.current) {
      try {
        await authEndpoints(api).logout();
      } catch {
        // best-effort; even on failure we clear locally
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
      serverUrl: SERVER_URL,
      login,
      register,
      logout,
      refreshMe,
      setCurrentUser,
    }),
    [status, token, currentUser, api, login, register, logout, refreshMe, setCurrentUser],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
}
