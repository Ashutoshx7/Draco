/**
 * Astra Browser — Main Process Entry Point
 *
 * Orchestrates: AdBlocker, AppDatabase, TabManager, ShortcutManager,
 *               SpaceManager, CompactModeManager, GlanceManager
 */

import { app, BaseWindow, WebContentsView, ipcMain, session, dialog } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

import { TabManager } from './managers/TabManager';
import { AdBlocker } from './managers/AdBlocker';
import { ShortcutManager } from './managers/ShortcutManager';
import { SpaceManager } from './managers/SpaceManager';
import { CompactModeManager } from './managers/CompactModeManager';
import { GlanceManager } from './managers/GlanceManager';
import { SplitViewManager } from './managers/SplitViewManager';
import { FingerprintGuard } from './managers/FingerprintGuard';
import { PrefsManager } from './managers/PrefsManager';
import { AppDatabase } from './database/Database';
import { IPC, CONFIG } from './types';
import { parseUrl } from './utils/url';
import { getSettingsPageUrl } from './pages/settings';

require('events').defaultMaxListeners = CONFIG.MAX_LISTENERS;

// --------------------------------------------------
// Chromium Performance Flags (inspired by Helium browser)
// --------------------------------------------------
app.commandLine.appendSwitch('enable-features',
  'ParallelDownloading,HighEfficiencyMode,UseOzonePlatform,VaapiVideoDecodeLinuxGL'
);
// Smoother scrolling & GPU acceleration
app.commandLine.appendSwitch('enable-smooth-scrolling');
app.commandLine.appendSwitch('enable-gpu-rasterization');
// Zero-copy texture upload (reduces GPU memory copies)
app.commandLine.appendSwitch('enable-zero-copy');
// Don't throttle background tabs — critical for tab restore & media
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
// Use hardware GPU even if blocklisted (Helium pattern)
app.commandLine.appendSwitch('ignore-gpu-blocklist');
// Faster compositing pipeline
app.commandLine.appendSwitch('enable-accelerated-video-decode');
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');

if (started) app.quit();

let mainWindow: BaseWindow | null = null;
let tabManager: TabManager;
let spaceManager: SpaceManager;
let compactMode: CompactModeManager;
let glanceManager: GlanceManager;
let splitView: SplitViewManager;
let fingerprintGuard: FingerprintGuard;
let database: AppDatabase;
let prefs: PrefsManager;

// --------------------------------------------------
// Window creation
// --------------------------------------------------

function createWindow(): void {
  mainWindow = new BaseWindow({
    width: CONFIG.WINDOW.WIDTH,
    height: CONFIG.WINDOW.HEIGHT,
    minWidth: CONFIG.WINDOW.MIN_WIDTH,
    minHeight: CONFIG.WINDOW.MIN_HEIGHT,
    title: CONFIG.WINDOW.TITLE,
    backgroundColor: CONFIG.WINDOW.BG_COLOR,
    titleBarStyle: 'hidden',
    // No titleBarOverlay — doesn't work on Linux.
    // Custom Zen-style controls: hidden behind content, revealed on hover.
  });

  // Ensure window background is dark — during resize compositor lag,
  // any gap between BrowserViews flashes the window background color.
  // Belt-and-suspenders: set on both BaseWindow AND each WebContentsView.
  mainWindow.setBackgroundColor(CONFIG.WINDOW.BG_COLOR);

  const sidebarView = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });
  sidebarView.setBackgroundColor(CONFIG.WINDOW.BG_COLOR);
  mainWindow.contentView.addChildView(sidebarView);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    sidebarView.webContents.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    sidebarView.webContents.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // --------------------------------------------------
  // Managers
  // --------------------------------------------------

  const preloadPath = path.join(__dirname, 'preload.js');

  tabManager = new TabManager(mainWindow, sidebarView, database, preloadPath);
  tabManager.setThumbnailsEnabled(prefs.getBool('tabThumbnails'));
  tabManager.setAlwaysAskDownload(() => prefs.getBool('alwaysAskDownload'));
  tabManager.setDownloadPath(() => prefs.getString('downloadPath'));
  tabManager.setNewTabUrlProvider(() => {
    const choice = prefs.getString('newTabPage');
    if (choice === 'blank') return 'about:blank';
    return null; // fall through to cached Draco Home
  });
  spaceManager = new SpaceManager(database, sidebarView, tabManager);

  // CompactMode: controls sidebar auto-hide.
  // Hover keeps content full width; explicit toggle animates dock/undock layout.
  compactMode = new CompactModeManager(mainWindow, sidebarView, (sidebarWidth) => {
    tabManager.layoutWithSidebarWidth(sidebarWidth);
  }, (sidebarWidth, durationMs, easing) => {
    tabManager.animateContentForSidebarWidth(sidebarWidth, durationMs, easing);
  });

  // Glance: link preview overlay
  glanceManager = new GlanceManager(mainWindow, sidebarView, tabManager);
  tabManager.setGlanceRequestHandler((url, x, y) => {
    if (!prefs.getBool('glanceEnabled')) return;
    glanceManager.open(url, x, y);
  });

  // SplitView: side-by-side tabs
  splitView = new SplitViewManager(mainWindow, sidebarView, tabManager);

  // FingerprintGuard: privacy protection (Helium-inspired)
  fingerprintGuard = new FingerprintGuard();
  fingerprintGuard.initialize();

  const shortcutManager = new ShortcutManager(tabManager, sidebarView, database, () => mainWindow);

  // Bidirectional linking (Zen pattern: managers reference each other)
  tabManager.setSpaceManager(spaceManager);
  shortcutManager.setSpaceManager(spaceManager);
  shortcutManager.setCompactMode(compactMode);
  shortcutManager.setGlanceManager(glanceManager);
  shortcutManager.setSplitView(splitView);
  shortcutManager.setOpenSettings(() => openSettings());
  shortcutManager.setConfirmQuit(() => prefs.getBool('confirmQuit'));
  shortcutManager.setShortcutProvider((key, fallback) => prefs.getString(key) || fallback);

  let lastCompactTarget: 'expanded' | 'hidden' | null = null;
  function syncBrowserLayoutPrefs(): void {
    const target = (prefs.getString('browserLayout') === 'collapsed-sidebar' || prefs.getBool('compactSidebar'))
      ? 'hidden'
      : 'expanded';
    if (target === lastCompactTarget) return;
    lastCompactTarget = target;
    compactMode.setMode(target);
  }

  const contentPrefsBound = new WeakSet<Electron.WebContents>();
  function injectContentPrefs(wc: Electron.WebContents): void {
    const css: string[] = [];
    if (prefs.getBool('alwaysShowScrollbars')) {
      css.push('::-webkit-scrollbar { display: block !important; }');
    }
    if (prefs.getBool('alwaysUnderlineLinks')) {
      css.push('a { text-decoration: underline !important; }');
    }

    const payload = JSON.stringify({
      css: css.join('\n'),
      glanceEnabled: prefs.getBool('glanceEnabled'),
      glanceTrigger: prefs.getString('glanceTrigger') || 'alt-click',
    });

    wc.executeJavaScript(`
      (() => {
        const prefs = ${payload};
        let style = document.getElementById('__astra_content_prefs__');
        if (!style) {
          style = document.createElement('style');
          style.id = '__astra_content_prefs__';
          document.documentElement.appendChild(style);
        }
        style.textContent = prefs.css || '';

        window.__astraGlancePrefs = {
          enabled: prefs.glanceEnabled,
          trigger: prefs.glanceTrigger,
        };
        if (!window.__astraGlanceInstalled) {
          window.__astraGlanceInstalled = true;
          document.addEventListener('click', event => {
            const gp = window.__astraGlancePrefs || {};
            if (!gp.enabled) return;
            const anchor = event.target && event.target.closest ? event.target.closest('a[href]') : null;
            if (!anchor || !anchor.href) return;
            const trigger = gp.trigger || 'alt-click';
            const matches =
              (trigger === 'alt-click' && event.altKey) ||
              (trigger === 'ctrl-click' && event.ctrlKey) ||
              (trigger === 'shift-click' && event.shiftKey) ||
              (trigger === 'meta-click' && event.metaKey);
            if (!matches) return;
            event.preventDefault();
            event.stopPropagation();
            console.log('__ASTRA_GLANCE_OPEN__:' + JSON.stringify({
              url: anchor.href,
              x: event.clientX,
              y: event.clientY,
            }));
          }, true);
        }
      })();
    `).catch(() => { /* page may not permit injection or may have navigated */ });
  }

  // Apply content-level prefs to a single WebContents
  function applyContentPrefs(wc: Electron.WebContents): void {
    const zoom = parseInt(prefs.getString('defaultZoom') || '100', 10) / 100;
    wc.setZoomFactor(zoom);
    injectContentPrefs(wc);
    if (contentPrefsBound.has(wc)) return;
    contentPrefsBound.add(wc);
    wc.on('did-finish-load', () => injectContentPrefs(wc));
  }

  // Broadcast pref changes to the sidebar so it can react (space glow, etc.)
  prefs.onChange(() => {
    sidebarView.webContents.send(IPC.PREFS_UPDATED, prefs.snapshot());
    tabManager.setThumbnailsEnabled(prefs.getBool('tabThumbnails'));
    syncBrowserLayoutPrefs();
    // Re-apply zoom to all open tabs when defaultZoom changes
    for (const view of tabManager.getAllViews()) {
      applyContentPrefs(view.webContents);
    }
  });
  // Initial push once the sidebar finishes loading
  sidebarView.webContents.once('did-finish-load', () => {
    sidebarView.webContents.send(IPC.PREFS_UPDATED, prefs.snapshot());
  });
  syncBrowserLayoutPrefs();

  // Inject fingerprint protection into each new tab + apply content prefs
  tabManager.setOnViewCreated((view) => {
    shortcutManager.attachToView(view);
    fingerprintGuard.injectProtections(view.webContents);
    applyContentPrefs(view.webContents);
  });

  // Session restore — respects the user's restoreSession preference
  const shouldRestore = prefs.get('restoreSession');
  const restored = shouldRestore ? tabManager.restoreSession() : false;
  if (!restored) {
    const firstTab = tabManager.createTab();
    tabManager.switchToTab(firstTab.id);
  }

  shortcutManager.initialize();
  mainWindow.on('resize', () => tabManager.layout());

  // Save session before window closes — only if restore is enabled
  mainWindow.on('close', (e) => {
    const tabCount = tabManager.getAllTabIds().length;
    if (prefs.getBool('confirmMultiTabClose') && tabCount > 1) {
      const choice = dialog.showMessageBoxSync(mainWindow!, {
        type: 'question',
        buttons: ['Close All Tabs', 'Cancel'],
        defaultId: 0,
        cancelId: 1,
        message: `Close ${tabCount} tabs?`,
        detail: 'You have multiple tabs open. Close them all and exit?',
      });
      if (choice === 1) { e.preventDefault(); return; }
    }
    if (prefs.get('restoreSession')) {
      tabManager.saveSession();
    }
  });

  // --------------------------------------------------
  // IPC Handlers
  // --------------------------------------------------

  ipcMain.on(IPC.REQUEST_TABS, () => tabManager.sendTabsToSidebar());
  ipcMain.on(IPC.NAVIGATE, (_e, url: string) => tabManager.navigateActiveTab(parseUrl(url, { searchUrl: prefs.getSearchUrl() })));
  ipcMain.on(IPC.GO_BACK, () => tabManager.goBack());
  ipcMain.on(IPC.GO_FORWARD, () => tabManager.goForward());
  ipcMain.on(IPC.REFRESH, () => tabManager.reload());

  ipcMain.on(IPC.NEW_TAB, (_e, url?: string) => {
    const tab = tabManager.createTab(url || undefined);
    if (prefs.getBool('compactToolbarPopup')) compactMode.flashSidebar();
    // Only auto-switch if the user wants it (or this is a user-initiated new tab with no URL)
    if (!url || prefs.getBool('switchToNewTab')) {
      tabManager.switchToTab(tab.id);
    }
  });

  ipcMain.on(IPC.OPEN_SETTINGS, () => openSettings());

  ipcMain.handle(IPC.PREF_GET_ALL, () => prefs.snapshot());

  ipcMain.handle(IPC.PREF_SET, (_e, key: string, value: unknown) => {
    prefs.set(key, value); // Registry validates — invalid prefs are silently dropped
    return prefs.snapshot();
  });

  function openSettings() {
    const settingsUrl = getSettingsPageUrl();
    // If an existing tab is already on settings, just switch to it
    const existing = tabManager.findSettingsTab();
    if (existing) {
      tabManager.switchToTab(existing.id);
      return;
    }
    const tab = tabManager.createTab(settingsUrl);
    tabManager.switchToTab(tab.id);

    // Inject the draco bridge once the page finishes loading
    const view = tab.view;
    const inject = () => {
      const bookmarks     = JSON.stringify(database.getBookmarks());
      const history       = JSON.stringify(database.getFullHistory());
      const prefsSnapshot = JSON.stringify(prefs.snapshot());
      view.webContents.executeJavaScript(`
        (function() {
          const __prefs = ${prefsSnapshot};
          window.draco = {
            getBookmarks: () => Promise.resolve(${bookmarks}),
            getHistory:   () => Promise.resolve(${history}),
            getPrefs:     () => Promise.resolve(__prefs),
            setPref: (key, value) => {
              __prefs[key] = value;
              console.log('__DRACO_SET_PREF__:' + JSON.stringify({ key, value }));
              return Promise.resolve(value);
            },
            performAction: (action, payload) => {
              console.log('__DRACO_ACTION__:' + JSON.stringify({ action, payload }));
              return Promise.resolve(true);
            },
            _applyPrefs: (nextPrefs) => {
              Object.assign(__prefs, nextPrefs || {});
              window.dispatchEvent(new CustomEvent('draco-prefs-updated', { detail: __prefs }));
            },
            _toast: (message) => {
              window.dispatchEvent(new CustomEvent('draco-toast', { detail: message }));
            },
            navigate: (url) => { window.location.href = url; },
            clearHistory: () => {
              console.log('__DRACO_CLEAR_HISTORY__');
              return Promise.resolve();
            },
          };
          window.dispatchEvent(new Event('draco-ready'));
        })();
      `).catch(() => { /* page navigated away */ });
    };

    view.webContents.on('did-finish-load', () => {
      inject();
    });

    const pushSettingsPrefs = () => {
      const snapshot = JSON.stringify(prefs.snapshot());
      view.webContents.executeJavaScript(`
        if (window.draco && window.draco._applyPrefs) {
          window.draco._applyPrefs(${snapshot});
        }
      `).catch(() => { /* ignore */ });
    };

    const showSettingsToast = (message: string) => {
      view.webContents.executeJavaScript(`
        if (window.draco && window.draco._toast) {
          window.draco._toast(${JSON.stringify(message)});
        }
      `).catch(() => { /* ignore */ });
    };

    view.webContents.on('console-message', (_e, _level, message) => {
      if (message === '__DRACO_CLEAR_HISTORY__') {
        database.clearHistory();
        sidebarView.webContents.send(IPC.HISTORY_RESULT, []);
        view.webContents.executeJavaScript(`
          if (window.draco) {
            window.draco.getHistory = () => Promise.resolve([]);
            const el = document.getElementById('history-list');
            if (el) el.innerHTML = '<div class="empty">No history yet.</div>';
          }
        `).catch(() => { /* ignore */ });
        return;
      }
      if (message.startsWith('__DRACO_SET_PREF__:')) {
        try {
          const { key, value } = JSON.parse(message.slice('__DRACO_SET_PREF__:'.length));
          prefs.set(key, value);
        } catch { /* malformed */ }
      }
      if (message.startsWith('__DRACO_ACTION__:')) {
        try {
          const { action } = JSON.parse(message.slice('__DRACO_ACTION__:'.length));
          if (action === 'choose-download-folder') {
            const dirs = dialog.showOpenDialogSync(mainWindow!, {
              title: 'Choose download folder',
              defaultPath: prefs.getString('downloadPath') === 'Downloads'
                ? app.getPath('downloads')
                : prefs.getString('downloadPath'),
              properties: ['openDirectory', 'createDirectory'],
            });
            if (dirs?.[0]) {
              prefs.set('downloadPath', dirs[0]);
              pushSettingsPrefs();
              showSettingsToast('Download folder updated.');
            }
            return;
          }
          if (action === 'make-default') {
            const httpOk = app.setAsDefaultProtocolClient('http');
            const httpsOk = app.setAsDefaultProtocolClient('https');
            prefs.set('defaultBrowserCheck', true);
            pushSettingsPrefs();
            showSettingsToast(httpOk || httpsOk
              ? 'Default browser request sent to the operating system.'
              : 'Draco could not become the default browser from this build.');
            return;
          }
        } catch { /* malformed */ }
      }
    });
  }

  ipcMain.on(IPC.CLOSE_TAB, (_e, tabId: string) => tabManager.closeTab(tabId));
  ipcMain.on(IPC.SWITCH_TAB, (_e, tabId: string) => {
    tabManager.switchToTab(tabId);
    if (prefs.getBool('compactToolbarPopup')) compactMode.flashSidebar();
  });

  ipcMain.on(IPC.REORDER_TABS, (_e, data: { oldIndex: number; newIndex: number }) => {
    tabManager.reorderTabs(data.oldIndex, data.newIndex);
  });

  // Hibernate
  ipcMain.on(IPC.HIBERNATE_TAB, (_e, tabId: string) => tabManager.hibernateTab(tabId));

  // Pin/Unpin
  ipcMain.on(IPC.PIN_TAB, (_e, tabId: string) => tabManager.pinTab(tabId));
  ipcMain.on(IPC.UNPIN_TAB, (_e, tabId: string) => tabManager.unpinTab(tabId));

  // Find in page
  ipcMain.on(IPC.FIND_IN_PAGE, (_e, text: string) => tabManager.findInPage(text));
  ipcMain.on(IPC.FIND_STOP, () => tabManager.stopFind());

  // History
  ipcMain.on(IPC.GET_HISTORY, () => {
    sidebarView.webContents.send(IPC.HISTORY_RESULT, database.getFullHistory());
  });

  ipcMain.on(IPC.CLEAR_HISTORY, () => {
    database.clearHistory();
    sidebarView.webContents.send(IPC.HISTORY_RESULT, []);
  });

  // Suggestions
  ipcMain.on(IPC.SEARCH_SUGGESTIONS, (_e, query: string) => {
    sidebarView.webContents.send(IPC.SUGGESTIONS_RESULT, database.getSuggestions(query));
  });

  // Bookmarks
  ipcMain.on(IPC.ADD_BOOKMARK, (_e, data: { url: string; title: string }) => {
    database.addBookmark(data.url, data.title);
    sidebarView.webContents.send(IPC.BOOKMARK_STATUS, true);
  });

  ipcMain.on(IPC.REMOVE_BOOKMARK, (_e, url: string) => {
    database.removeBookmark(url);
    sidebarView.webContents.send(IPC.BOOKMARK_STATUS, false);
  });

  ipcMain.on(IPC.GET_BOOKMARKS, () => {
    sidebarView.webContents.send(IPC.BOOKMARKS_RESULT, database.getBookmarks());
  });

  // DevTools in dev mode only
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    sidebarView.webContents.openDevTools({ mode: 'detach' });
  }

  // --------------------------------------------------
  // Workspace IPC Handlers (Zen-inspired)
  // --------------------------------------------------

  ipcMain.on(IPC.REQUEST_SPACES, () => spaceManager.sendSpacesToSidebar());

  ipcMain.on(IPC.SPACE_SWITCH, (_e, spaceId: string) => {
    spaceManager.switchToSpace(spaceId);
  });

  ipcMain.on(IPC.SPACE_CREATE, (_e, data: { name: string; color: string; icon: string }) => {
    spaceManager.createSpace(data.name, data.color, data.icon);
  });

  ipcMain.on(IPC.SPACE_DELETE, (_e, spaceId: string) => {
    spaceManager.deleteSpace(spaceId);
  });

  ipcMain.on(IPC.SPACE_RENAME, (_e, data: { spaceId: string; name: string }) => {
    spaceManager.renameSpace(data.spaceId, data.name);
  });

  ipcMain.on(IPC.SPACE_REORDER, (_e, data: { spaceId: string; newIndex: number }) => {
    spaceManager.reorderSpace(data.spaceId, data.newIndex);
  });

  ipcMain.on(IPC.SPACE_UPDATE_COLOR, (_e, data: { spaceId: string; color: string }) => {
    spaceManager.updateSpaceColor(data.spaceId, data.color);
  });

  // --------------------------------------------------
  // Compact Mode IPC Handlers
  // --------------------------------------------------

  ipcMain.on('compact:toggle', () => compactMode.toggleMode());
  ipcMain.on('compact:set-mode', (_e, mode: string) => {
    compactMode.setMode(mode as any);
  });
  ipcMain.on('compact:mouse-move', (_e, data: { x: number; y: number }) => {
    compactMode.handleMouseMove(data.x, data.y);
  });
  ipcMain.on('compact:lock-popup', () => compactMode.lockForPopup());
  ipcMain.on('compact:unlock-popup', () => compactMode.unlockFromPopup());

  // Edge hover detection (Wayland-compatible)
  ipcMain.on('compact:edge-enter', () => compactMode.onEdgeEnter());
  ipcMain.on('compact:edge-leave', (_e, data?: { x: number; y: number }) => compactMode.onEdgeLeave(data));
  ipcMain.on('compact:edge-cancel-hide', () => compactMode.onEdgeCancelHide());

  // --------------------------------------------------
  // Window Controls IPC (custom Zen-style buttons)
  // --------------------------------------------------
  ipcMain.on('window:minimize', () => mainWindow?.minimize());
  ipcMain.on('window:maximize', () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  });
  ipcMain.on('window:close', () => mainWindow?.close());
  // Send maximize state back to renderer for button icon toggle
  mainWindow.on('maximize', () => sidebarView.webContents.send('window:maximized', true));
  mainWindow.on('unmaximize', () => sidebarView.webContents.send('window:maximized', false));
  // --------------------------------------------------
  // Zen-style toolbar reveal — IPC-driven
  //
  // cursor polling doesn't work on Wayland (security restrictions).
  // Instead, the sidebar renderer sends IPC when the drag area is hovered.
  // Main process shifts the content BrowserView accordingly.
  // --------------------------------------------------
  let toolbarCollapseTimer: ReturnType<typeof setTimeout> | null = null;
  ipcMain.on('toolbar:expand', () => {
    if (toolbarCollapseTimer) { clearTimeout(toolbarCollapseTimer); toolbarCollapseTimer = null; }
    tabManager.setToolbarExpanded(true);
  });
  ipcMain.on('toolbar:collapse', () => {
    if (toolbarCollapseTimer) return;
    toolbarCollapseTimer = setTimeout(() => {
      tabManager.setToolbarExpanded(false);
      toolbarCollapseTimer = null;
    }, 300);
  });

  // --------------------------------------------------
  // Sidebar Resize IPC
  // --------------------------------------------------

  ipcMain.on(IPC.SIDEBAR_RESIZE, (_e, width: number) => {
    compactMode.setResizing(true);

    tabManager.setSidebarWidth(width);
    const clampedWidth = tabManager.getSidebarWidth();
    compactMode.setBaseWidth(clampedWidth);

    if (compactMode.getMode() === 'hidden') {
      // Overlay mode: only resize the sidebar view, don't move content
      const { height } = mainWindow.getContentBounds();
      sidebarView.setBounds({ x: 0, y: 0, width: clampedWidth + 8, height });
    } else {
      // Expanded mode: resize both sidebar and content together
      tabManager.layoutWithSidebarWidth(clampedWidth);
    }

    sidebarView.webContents.send(IPC.SIDEBAR_WIDTH_CHANGED, clampedWidth);

    if ((ipcMain as any)._resizeIdleTimer) clearTimeout((ipcMain as any)._resizeIdleTimer);
    (ipcMain as any)._resizeIdleTimer = setTimeout(() => {
      compactMode.setResizing(false);
    }, 150);
  });

  // --------------------------------------------------
  // Glance IPC Handlers (Zen's killer feature)
  // --------------------------------------------------

  ipcMain.on('glance:open', (_e, data: { url: string; x: number; y: number }) => {
    glanceManager.open(data.url, data.x, data.y);
  });
  ipcMain.on('glance:close', () => glanceManager.close());
  ipcMain.on('glance:expand', () => glanceManager.expand());

  // --------------------------------------------------
  // Split View IPC Handlers (Helium + Zen combined)
  // --------------------------------------------------

  ipcMain.on('split:enter', (_e, data: { leftTabId: string; rightTabId?: string; direction?: string }) => {
    splitView.split(data.leftTabId, data.rightTabId, (data.direction as any) || 'horizontal');
  });
  ipcMain.on('split:exit', () => splitView.unsplit());
  ipcMain.on('split:toggle-direction', () => splitView.toggleDirection());
  ipcMain.on('split:swap', () => splitView.swapPanes());
  ipcMain.on('split:resize', (_e, data: { position: number }) => {
    splitView.handleDividerDrag(data.position);
  });

  // --------------------------------------------------
  // Privacy IPC
  // --------------------------------------------------

  ipcMain.on('privacy:toggle', () => {
    fingerprintGuard.setEnabled(!fingerprintGuard.isEnabled());
    sidebarView.webContents.send('privacy:state', {
      enabled: fingerprintGuard.isEnabled(),
    });
  });
  ipcMain.on('privacy:get-state', () => {
    sidebarView.webContents.send('privacy:state', {
      enabled: fingerprintGuard.isEnabled(),
    });
  });
}

// --------------------------------------------------
// App lifecycle
// --------------------------------------------------

app.on('ready', async () => {
  // Performance: Initialize AdBlocker and Database in parallel with each other
  // (AdBlocker fetches filter lists from network — don't block window creation on it)
  const adBlocker = new AdBlocker();
  database = new AppDatabase();
  prefs = new PrefsManager(database);

  // Wire DNT header — toggling the pref takes effect immediately because the
  // hook reads from `prefs` on every request, not from a captured snapshot.
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if (prefs.getBool('dnt')) {
      details.requestHeaders['DNT'] = '1';
    } else {
      delete details.requestHeaders['DNT'];
    }
    callback({ requestHeaders: details.requestHeaders });
  });

  // Start AdBlocker async, then open window immediately — tabs will be protected
  // by the time the user loads a real URL (AdBlocker is fast on second run via cache)
  const adBlockerReady = adBlocker.initialize();

  createWindow();

  // Wait in background — blocks are applied to the session once ready
  adBlockerReady.catch((err) => console.error('[Astra] AdBlocker failed:', err));

  let isQuitting = false;
  app.on('before-quit', async (event) => {
    if (isQuitting) return;
    if (!prefs?.getBool('clearOnQuit')) {
      tabManager?.saveSession();
      database?.close();
      return;
    }

    // User asked to wipe browsing data — delay quit until clear finishes.
    event.preventDefault();
    isQuitting = true;
    try {
      await session.defaultSession.clearStorageData({
        storages: ['cookies', 'localstorage', 'indexdb', 'serviceworkers', 'websql', 'shadercache', 'cachestorage'],
      });
      await session.defaultSession.clearCache();
    } catch (err) {
      console.error('[Astra] clearOnQuit failed:', err);
    }
    tabManager?.saveSession();
    database?.close();
    app.quit();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BaseWindow.getAllWindows().length === 0) createWindow();
});
