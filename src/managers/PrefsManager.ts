import type { AppDatabase } from '../database/Database';

/**
 * Strongly-typed pref shape. Adding a pref:
 *   1. Add its key + default here
 *   2. Use prefs.get('foo') anywhere
 *   3. Set from the settings page via window.draco.setPref('foo', value)
 *
 * Values are stored as strings in SQLite. Booleans round-trip as "1"/"0".
 */
export type SearchEngine = 'duckduckgo' | 'google' | 'bing' | 'brave';

export interface PrefsShape {
  searchEngine: SearchEngine;
  restoreSession: boolean;
}

const DEFAULTS: PrefsShape = {
  searchEngine: 'duckduckgo',
  restoreSession: true,
};

const SEARCH_ENGINE_URLS: Record<SearchEngine, string> = {
  duckduckgo: 'https://duckduckgo.com/?q=',
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  brave: 'https://search.brave.com/search?q=',
};

export class PrefsManager {
  private cache: PrefsShape;

  constructor(private readonly db: AppDatabase) {
    this.cache = { ...DEFAULTS };
    this.load();
  }

  private load(): void {
    const raw = this.db.getAllPrefs();
    if (raw.searchEngine && raw.searchEngine in SEARCH_ENGINE_URLS) {
      this.cache.searchEngine = raw.searchEngine as SearchEngine;
    }
    if (raw.restoreSession != null) {
      this.cache.restoreSession = raw.restoreSession === '1';
    }
  }

  get<K extends keyof PrefsShape>(key: K): PrefsShape[K] {
    return this.cache[key];
  }

  set<K extends keyof PrefsShape>(key: K, value: PrefsShape[K]): void {
    this.cache[key] = value;
    const serialized = typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
    this.db.setPref(key, serialized);
  }

  /** Snapshot for renderer — uses the same shape as PrefsShape */
  snapshot(): PrefsShape {
    return { ...this.cache };
  }

  /** Resolve the current search engine URL (used by parseUrl) */
  getSearchUrl(): string {
    return SEARCH_ENGINE_URLS[this.cache.searchEngine];
  }
}
