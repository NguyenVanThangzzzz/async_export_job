interface Entry {
  value: unknown;
  expiresAt: number;
}

const store = new Map<string, Entry>();

export function memGet(key: string) {
  const e = store.get(key);
  if (!e || Date.now() > e.expiresAt) {
    store.delete(key);
    return null;
  }
  return e.value;
}

export function memSet(key: string, value: unknown, ttlMs: number) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function memDel(key: string) {
  store.delete(key);
}
