import type { AppDatabase } from '../database/Database';
import { PREFS_REGISTRY, getDefaults, validatePref, type PrefDef } from '../pages/settings/prefsRegistry';

type PrefValue = boolean | string;

const SEARCH_ENGINE_URLS: Record<string, string> = {
  duckduckgo: 'https://duckduckgo.com/?q=',
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  brave: 'https://search.brave.com/search?q=',
};

/**
 * Generic preferences store backed by SQLite.
 *
 * Schema/defaults/validation come from PREFS_REGISTRY — adding a pref
 * never touches this class.
 */
export class PrefsManager {
  private cache: Record<string, PrefValue>;
  private listeners: Array<(key: string, value: PrefValue) => void> = [];

  constructor(private readonly db: AppDatabase) {
    this.cache = getDefaults();
    this.load();
  }

  private load(): void {
    const raw = this.db.getAllPrefs();
    for (const def of PREFS_REGISTRY) {
      const stored = raw[def.key];
      if (stored == null) continue;

      if (def.type === 'bool') {
        this.cache[def.key] = stored === '1';
      } else if (def.type === 'string') {
        if (def.options && !def.options.includes(stored)) continue;
        this.cache[def.key] = stored;
      }
    }
  }

  get(key: string): PrefValue {
    return this.cache[key];
  }

  getBool(key: string): boolean {
    return this.cache[key] === true;
  }

  getString(key: string): string {
    const v = this.cache[key];
    return typeof v === 'string' ? v : '';
  }

  /** Set a pref. Returns true if accepted, false if rejected by validation. */
  set(key: string, value: unknown): boolean {
    const result = validatePref(key, value);
    if (!result.ok) return false;

    this.cache[key] = result.value;
    const serialized = typeof result.value === 'boolean' ? (result.value ? '1' : '0') : result.value;
    this.db.setPref(key, serialized);

    for (const fn of this.listeners) fn(key, result.value);
    return true;
  }

  /** Subscribe to pref changes. Returns unsubscribe fn. */
  onChange(fn: (key: string, value: PrefValue) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  /** Snapshot for renderer. */
  snapshot(): Record<string, PrefValue> {
    return { ...this.cache };
  }

  /** Resolve current search engine to a URL prefix. */
  getSearchUrl(): string {
    const engine = this.getString('searchEngine');
    return SEARCH_ENGINE_URLS[engine] || SEARCH_ENGINE_URLS.duckduckgo;
  }

  /** Registry — exposed for inspection by callers (UI hints, etc). */
  getRegistry(): readonly PrefDef[] {
    return PREFS_REGISTRY;
  }
}
