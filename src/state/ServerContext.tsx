import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { storage, StorageKeys } from '../config/storage';

interface ServerContextValue {
  serverUrl: string | null;
  hydrated: boolean;
  /** True when the URL came from EXPO_PUBLIC_SERVER_URL and cannot be changed at runtime. */
  isBaked: boolean;
  setServerUrl(url: string | null): Promise<void>;
}

const Ctx = createContext<ServerContextValue | null>(null);

// URL baked in at bundle time via EXPO_PUBLIC_SERVER_URL. Metro inlines any
// env var prefixed with EXPO_PUBLIC_ into the client bundle. When set, it wins
// over anything the user typed on server-setup.
const BAKED_SERVER_URL: string | null =
  process.env.EXPO_PUBLIC_SERVER_URL && process.env.EXPO_PUBLIC_SERVER_URL.length > 0
    ? process.env.EXPO_PUBLIC_SERVER_URL
    : null;

function normalizeUrl(raw: string): string {
  let s = raw.trim();
  if (!/^https?:\/\//i.test(s)) s = `http://${s}`;
  return s.replace(/\/$/, '');
}

export function ServerProvider({ children }: { children: React.ReactNode }) {
  const [serverUrl, setServerUrlState] = useState<string | null>(BAKED_SERVER_URL);
  const [hydrated, setHydrated] = useState(BAKED_SERVER_URL !== null);

  useEffect(() => {
    if (BAKED_SERVER_URL !== null) return; // env-baked → skip storage
    let cancelled = false;
    storage.get(StorageKeys.ServerUrl).then((v) => {
      if (cancelled) return;
      setServerUrlState(v);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setServerUrl = useCallback(async (url: string | null) => {
    if (BAKED_SERVER_URL !== null) return; // ignore attempts to change baked URL
    if (url === null) {
      await storage.delete(StorageKeys.ServerUrl);
      setServerUrlState(null);
    } else {
      const normalized = normalizeUrl(url);
      await storage.set(StorageKeys.ServerUrl, normalized);
      setServerUrlState(normalized);
    }
  }, []);

  const value = useMemo(
    () => ({ serverUrl, hydrated, isBaked: BAKED_SERVER_URL !== null, setServerUrl }),
    [serverUrl, hydrated, setServerUrl],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useServer(): ServerContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useServer must be used inside ServerProvider');
  return v;
}
