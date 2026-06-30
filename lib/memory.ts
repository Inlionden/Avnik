// 🔒 SHARED CONTRACT — the Memory store (localStorage now, Supabase later). Owned by Session 1.
// Same interface both ways; swap the backend without touching callers.

const PREFIX = "avnik:";
const isBrowser = typeof window !== "undefined";

export function get<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function set<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* quota / serialization — ignore for MVP */
  }
}

export function append<T>(key: string, item: T): T[] {
  const arr = get<T[]>(key, []);
  arr.push(item);
  set(key, arr);
  return arr;
}

/** RAG-lite: naive keyword retrieval over stored string-ish records. S3 can upgrade to embeddings. */
export function retrieve(key: string, query: string, limit = 5): unknown[] {
  const arr = get<unknown[]>(key, []);
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return arr.slice(-limit);
  return arr
    .map((item) => {
      const text = JSON.stringify(item).toLowerCase();
      const score = terms.reduce((s, t) => s + (text.includes(t) ? 1 : 0), 0);
      return { item, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);
}

export function clearAll(): void {
  if (!isBrowser) return;
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => window.localStorage.removeItem(k));
}

// Canonical keys (so all sessions agree)
export const KEYS = {
  profile: "profile",
  goals: "goals",
  tasks: "tasks",
  events: "events",
  journal: "journal",
  journalDraft: "journal:draft",
  beliefs: "beliefs",
  places: "places",
  settings: "settings",
  coachMessages: "coach:messages",
  coachMode: "coach:mode",
  coachDraft: "coach:draft",
} as const;
