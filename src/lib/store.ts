import type { TestSession } from './types.js';

const SESSIONS_KEY = 'yy-sessions';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getSessions(): TestSession[] {
  return read<TestSession[]>(SESSIONS_KEY, []);
}

export function saveSession(session: TestSession): void {
  const sessions = getSessions();
  const idx = sessions.findIndex(s => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
  }
  write(SESSIONS_KEY, sessions);
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter(s => s.id !== id);
  write(SESSIONS_KEY, sessions);
}
