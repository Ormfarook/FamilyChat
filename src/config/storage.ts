// Platform-agnostic key/value storage. Uses SecureStore on native, localStorage on web.
// The values we store (auth token, server URL, cached current user) are small strings.

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const memoryStore = new Map<string, string>();

async function getWeb(key: string): Promise<string | null> {
  if (typeof window === 'undefined' || !window.localStorage) return memoryStore.get(key) ?? null;
  return window.localStorage.getItem(key);
}
async function setWeb(key: string, value: string): Promise<void> {
  if (typeof window === 'undefined' || !window.localStorage) {
    memoryStore.set(key, value);
    return;
  }
  window.localStorage.setItem(key, value);
}
async function deleteWeb(key: string): Promise<void> {
  if (typeof window === 'undefined' || !window.localStorage) {
    memoryStore.delete(key);
    return;
  }
  window.localStorage.removeItem(key);
}

export const storage = {
  get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return getWeb(key);
    return SecureStore.getItemAsync(key);
  },
  set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') return setWeb(key, value);
    return SecureStore.setItemAsync(key, value);
  },
  delete(key: string): Promise<void> {
    if (Platform.OS === 'web') return deleteWeb(key);
    return SecureStore.deleteItemAsync(key);
  },
};

export const StorageKeys = {
  ServerUrl: 'chatwave.serverUrl',
  Token: 'chatwave.token',
  CurrentUser: 'chatwave.currentUser',
} as const;
