/**
 * Safe localStorage helpers for demo and environments where storage may be full or disabled.
 */

export function safeGet<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    return s != null ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage.setItem failed', key, e);
  }
}
