import { CONFIG } from '../types';
import { getSettingsPageUrl, isSettingsUrl } from '../pages/settings';

interface ParseOptions {
  /** Override the default search URL (used to inject the user's chosen engine) */
  searchUrl?: string;
}

const BANGS: Record<string, string> = {
  '!g':    'https://www.google.com/search?q=',
  '!d':    'https://duckduckgo.com/?q=',
  '!b':    'https://www.bing.com/search?q=',
  '!w':    'https://en.wikipedia.org/wiki/Special:Search?search=',
  '!yt':   'https://www.youtube.com/results?search_query=',
  '!gh':   'https://github.com/search?q=',
  '!so':   'https://stackoverflow.com/search?q=',
  '!r':    'https://www.reddit.com/search/?q=',
  '!npm':  'https://www.npmjs.com/search?q=',
  '!mdn':  'https://developer.mozilla.org/en-US/search?q=',
  '!tw':   'https://twitter.com/search?q=',
  '!am':   'https://www.amazon.com/s?k=',
  '!maps': 'https://www.google.com/maps/search/',
  '!img':  'https://www.google.com/search?tbm=isch&q=',
  '!t':    'https://translate.google.com/?sl=auto&tl=en&text=',
};

function extractBang(input: string): { bang: string; query: string } | null {
  const words = input.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const lower = words[i].toLowerCase();
    if (BANGS[lower]) {
      const queryWords = [...words.slice(0, i), ...words.slice(i + 1)];
      return { bang: lower, query: queryWords.join(' ') };
    }
  }
  return null;
}

/**
 * Parses user input and returns a navigable URL.
 *
 * Rules (in priority order):
 *   1. Internal scheme (draco://settings) → resolve to data URL
 *   2. Bang shortcuts (!g, !yt, etc.) — anywhere in input
 *   3. Spaces or no dot → search query (uses opts.searchUrl or CONFIG.SEARCH_URL)
 *   4. Missing protocol → prepend https://
 *   5. Otherwise → use as-is
 */
export function parseUrl(input: string, opts: ParseOptions = {}): string {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return CONFIG.DEFAULT_URL;
  }

  if (isSettingsUrl(trimmed)) {
    return getSettingsPageUrl();
  }

  const bangResult = extractBang(trimmed);
  if (bangResult) {
    return `${BANGS[bangResult.bang]}${encodeURIComponent(bangResult.query)}`;
  }

  const searchUrl = opts.searchUrl || CONFIG.SEARCH_URL;
  if (trimmed.includes(' ') || !trimmed.includes('.')) {
    return `${searchUrl}${encodeURIComponent(trimmed)}`;
  }

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }

  return trimmed;
}
