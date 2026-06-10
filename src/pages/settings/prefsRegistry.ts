import { SHORTCUT_GROUPS, shortcutPrefKey } from './shortcutDefaults';

/**
 * Single source of truth for every user preference.
 *
 * Adding a pref:
 *   1. Add a PrefDef here
 *   2. Drop an input with data-pref="key" into a category template
 *   3. (Optional) Read it in main.ts via prefs.get('key')
 *
 * No per-key switch statements anywhere — the bridge auto-binds inputs
 * and PrefsManager validates against this registry.
 */

export type PrefType = 'bool' | 'string';

export interface PrefDef {
  readonly key: string;
  readonly type: PrefType;
  readonly default: boolean | string;
  /** For type:'string', the allowed values. Anything else is rejected. */
  readonly options?: readonly string[];
  /** Marks prefs that don't take effect until restart. Used for UI hint only. */
  readonly requiresRestart?: boolean;
}

const SHORTCUT_PREFS: readonly PrefDef[] = SHORTCUT_GROUPS.flatMap(group =>
  group.items.map(item => ({
    key: shortcutPrefKey(item.id),
    type: 'string' as const,
    default: item.defaultValue,
  }))
);

export const PREFS_REGISTRY: readonly PrefDef[] = [
  // ── General › Startup ────────────────────────────────────────────────────
  { key: 'restoreSession',        type: 'bool',   default: true },
  { key: 'continueWhereLeftOff',  type: 'bool',   default: false },
  { key: 'defaultBrowserCheck',   type: 'bool',   default: false },

  // ── General › New Tab ────────────────────────────────────────────────────
  { key: 'newTabPage',            type: 'string', default: 'draco', options: ['draco', 'blank'] },

  // ── General › Tabs ───────────────────────────────────────────────────────
  { key: 'tabThumbnails',         type: 'bool',   default: true },
  { key: 'ctrlTabRecentOrder',    type: 'bool',   default: false },
  { key: 'openLinksInNewTab',     type: 'bool',   default: true },
  { key: 'openAppLinksNextToTab', type: 'bool',   default: false },
  { key: 'switchToNewTab',        type: 'bool',   default: false },
  { key: 'confirmMultiTabClose',  type: 'bool',   default: false },
  { key: 'confirmQuit',           type: 'bool',   default: true },
  { key: 'middleClickClose',      type: 'bool',   default: true },
  { key: 'containerTabs',         type: 'bool',   default: true },

  // ── General › Language and Appearance ────────────────────────────────────
  { key: 'websiteAppearance',     type: 'string', default: 'automatic', options: ['automatic', 'light', 'dark'] },
  { key: 'contrastControl',       type: 'string', default: 'off', options: ['automatic', 'off', 'custom'] },
  { key: 'defaultFont',           type: 'string', default: 'default-noto-serif', options: ['default-noto-serif', 'serif', 'sans-serif', 'monospace'] },
  { key: 'fontSize',              type: 'string', default: '16', options: ['12', '14', '16', '18', '20', '24'] },
  { key: 'language',              type: 'string', default: 'en-US', options: ['en-US', 'en-GB', 'hi-IN', 'es-ES'] },
  { key: 'spellCheck',            type: 'bool',   default: true },

  // ── General › Browsing ───────────────────────────────────────────────────
  { key: 'autoscrolling',         type: 'bool',   default: false },
  { key: 'smoothScrolling',       type: 'bool',   default: true },
  { key: 'alwaysShowScrollbars',  type: 'bool',   default: false },
  { key: 'cursorNavigation',      type: 'bool',   default: false },
  { key: 'alwaysUnderlineLinks',  type: 'bool',   default: false },
  { key: 'findAsYouType',         type: 'bool',   default: false },
  { key: 'pictureInPicture',      type: 'bool',   default: true },
  { key: 'mediaKeysControl',      type: 'bool',   default: true },
  { key: 'linkPreviews',          type: 'bool',   default: false },

  // ── General › Zoom ───────────────────────────────────────────────────────
  { key: 'defaultZoom',           type: 'string', default: '100', options: ['67', '75', '80', '90', '100', '110', '125', '150', '175', '200', '250', '300'] },
  { key: 'zoomTextOnly',          type: 'bool',   default: false },

  // ── General › Downloads ──────────────────────────────────────────────────
  { key: 'alwaysAskDownload',     type: 'bool',   default: false },
  { key: 'downloadPath',          type: 'string', default: 'Downloads' },
  { key: 'deletePrivateDownloads', type: 'bool',  default: false },
  { key: 'fileHandling',          type: 'string', default: 'save', options: ['save', 'ask'] },
  { key: 'drmContent',            type: 'bool',   default: true },

  // ── General › Updates / Recommendations ──────────────────────────────────
  { key: 'updatePolicy',          type: 'string', default: 'auto', options: ['auto', 'manual'] },
  { key: 'recommendedPerformance', type: 'bool',  default: true },
  { key: 'recommendExtensions',   type: 'bool',   default: false },
  { key: 'recommendFeatures',     type: 'bool',   default: false },
  { key: 'linkPreviewAi',         type: 'bool',   default: false },
  { key: 'linkPreviewShortcut',   type: 'bool',   default: true },

  // ── General › Performance ────────────────────────────────────────────────
  { key: 'hwAccel',               type: 'bool',   default: true,  requiresRestart: true },

  // ── Appearance ───────────────────────────────────────────────────────────
  { key: 'themeMode',             type: 'string', default: 'dark', options: ['dark', 'light', 'system'] },
  { key: 'accentColor',           type: 'string', default: '#e8b7a8' },
  { key: 'compactSidebar',        type: 'bool',   default: false },
  { key: 'spaceGlow',             type: 'bool',   default: true },
  { key: 'browserLayout',         type: 'string', default: 'only-sidebar', options: ['only-sidebar', 'sidebar-toolbar', 'collapsed-sidebar'] },
  { key: 'showNewTabButton',      type: 'bool',   default: true },
  { key: 'newTabButtonTop',       type: 'bool',   default: true },
  { key: 'compactToolbarPopup',   type: 'bool',   default: false },
  { key: 'glanceEnabled',         type: 'bool',   default: true },
  { key: 'glanceTrigger',         type: 'string', default: 'alt-click', options: ['alt-click', 'ctrl-click', 'shift-click', 'meta-click'] },
  { key: 'urlBarBehavior',        type: 'string', default: 'floating-typing', options: ['floating-typing', 'always-floating', 'never-floating'] },

  // ── Privacy & Security ───────────────────────────────────────────────────
  { key: 'dnt',                   type: 'bool',   default: true },
  { key: 'clearOnQuit',           type: 'bool',   default: false },

  // ── Search ───────────────────────────────────────────────────────────────
  { key: 'searchEngine',          type: 'string', default: 'duckduckgo', options: ['duckduckgo', 'google', 'bing', 'brave'] },

  // ── Keyboard Shortcuts ───────────────────────────────────────────────────
  ...SHORTCUT_PREFS,
] as const;

/** Lookup by key (O(n) but n is tiny). */
export function getPrefDef(key: string): PrefDef | undefined {
  return PREFS_REGISTRY.find(p => p.key === key);
}

/** Returns a defaults dict {key: defaultValue}. */
export function getDefaults(): Record<string, boolean | string> {
  const out: Record<string, boolean | string> = {};
  for (const def of PREFS_REGISTRY) out[def.key] = def.default;
  return out;
}

/** Validate an incoming value against its registry entry. */
export function validatePref(key: string, value: unknown): { ok: true; value: boolean | string } | { ok: false } {
  const def = getPrefDef(key);
  if (!def) return { ok: false };

  if (def.type === 'bool') {
    if (typeof value === 'boolean') return { ok: true, value };
    if (value === '1' || value === 1) return { ok: true, value: true };
    if (value === '0' || value === 0) return { ok: true, value: false };
    return { ok: false };
  }

  if (def.type === 'string') {
    if (typeof value !== 'string') return { ok: false };
    if (def.options && !def.options.includes(value)) return { ok: false };
    return { ok: true, value };
  }

  return { ok: false };
}
