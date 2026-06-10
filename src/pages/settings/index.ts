/**
 * draco://settings — composes the per-category files into a single data URL.
 *
 * Adding a category: drop a file in ./categories/<name>.ts that exports
 * a Category, then add it to CATEGORIES below. The shell handles nav + routing.
 */
import { renderShell } from './shell';
import type { Category } from './category';

import { general }    from './categories/general';
import { appearance } from './categories/appearance';
import { privacy }    from './categories/privacy';
import { search }     from './categories/search';
import { shortcuts }  from './categories/shortcuts';
import { bookmarks }  from './categories/bookmarks';
import { history }    from './categories/history';
import { about }      from './categories/about';

const CATEGORIES: readonly Category[] = [
  general, appearance, privacy, search, shortcuts, bookmarks, history, about,
];

export function getSettingsPageUrl(): string {
  const html = renderShell(CATEGORIES);
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

/** Recognized internal URLs that resolve to the settings page. */
export function isSettingsUrl(url: string): boolean {
  return url === 'draco://settings' || url === 'astra://settings' || url.startsWith('draco://settings');
}
