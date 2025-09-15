import React from 'react';

export type SyncLevel = 'idle' | 'synced' | 'local-only' | 'error';

export type SyncStatus = {
  level: SyncLevel;
  message?: string;
  updatedAt: number; // epoch ms
};

const STORAGE_KEY = 'coaction-sync-status';
const EVENT_NAME = 'coaction-sync-status';

export function getSyncStatus(): SyncStatus {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SyncStatus;
  } catch (e) {}
  return { level: 'idle', message: undefined, updatedAt: Date.now() };
}

export function setSyncStatus(status: Omit<SyncStatus, 'updatedAt'> & { message?: string }) {
  const next: SyncStatus = { ...status, updatedAt: Date.now() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (e) {}
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
  } catch (e) {}
}

export function useSyncStatus() {
  const [status, setStatus] = React.useState<SyncStatus>(() => getSyncStatus());

  React.useEffect(() => {
    const onCustom = (e: Event) => {
      const ce = e as CustomEvent<SyncStatus>;
      setStatus(ce.detail || getSyncStatus());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setStatus(getSyncStatus());
    };
    window.addEventListener(EVENT_NAME, onCustom as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, onCustom as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return status;
}

