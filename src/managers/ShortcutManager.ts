import { WebContentsView, clipboard, dialog, app } from 'electron';
import { TabManager } from './TabManager';
import { AppDatabase } from '../database/Database';
import { IPC } from '../types';
import type { SpaceManager } from './SpaceManager';
import type { CompactModeManager } from './CompactModeManager';
import type { GlanceManager } from './GlanceManager';
import type { SplitViewManager } from './SplitViewManager';
import { shortcutPrefKey } from '../pages/settings/shortcutDefaults';

type ShortcutHandler = (event: Electron.Event, input: Electron.Input) => void;
type ShortcutProvider = (key: string, fallback: string) => string;

interface ParsedShortcut {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  key: string;
}

/**
 * ShortcutManager — browser keyboard shortcuts.
 *
 * User-visible shortcuts are stored as prefs named shortcut.<id>. Rows that map
 * to existing Draco actions are executed here; rows for features we do not have
 * yet remain editable/persisted settings until their feature exists.
 */
export class ShortcutManager {
  private readonly handler: ShortcutHandler;
  private spaceManager: SpaceManager | null = null;
  private compactMode: CompactModeManager | null = null;
  private glanceManager: GlanceManager | null = null;
  private splitView: SplitViewManager | null = null;
  private onOpenSettings: (() => void) | null = null;
  private getConfirmQuit: (() => boolean) | null = null;
  private getShortcutValue: ShortcutProvider | null = null;

  constructor(
    private readonly tabManager: TabManager,
    private readonly sidebarView: WebContentsView,
    private readonly database: AppDatabase,
    private readonly getMainWindow: () => Electron.BaseWindow | null,
  ) {
    this.handler = this.handleInput.bind(this);
  }

  setOpenSettings(cb: () => void): void {
    this.onOpenSettings = cb;
  }

  setConfirmQuit(fn: () => boolean): void {
    this.getConfirmQuit = fn;
  }

  setShortcutProvider(fn: ShortcutProvider): void {
    this.getShortcutValue = fn;
  }

  setSpaceManager(sm: SpaceManager): void {
    this.spaceManager = sm;
  }

  setCompactMode(cm: CompactModeManager): void {
    this.compactMode = cm;
  }

  setGlanceManager(gm: GlanceManager): void {
    this.glanceManager = gm;
  }

  setSplitView(sv: SplitViewManager): void {
    this.splitView = sv;
  }

  initialize(): void {
    this.sidebarView.webContents.on('before-input-event', this.handler);
    for (const view of this.tabManager.getAllViews()) {
      this.attachToView(view);
    }
    // Note: onViewCreated is now set in main.ts to also inject FingerprintGuard
  }

  attachToView(view: WebContentsView): void {
    view.webContents.on('before-input-event', this.handler);
  }

  private handleInput(event: Electron.Event, input: Electron.Input): void {
    if (input.type !== 'keyDown') return;

    if (this.matchesShortcut(input, 'newTab', 'Ctrl+T')) {
      event.preventDefault();
      const tab = this.tabManager.createTab();
      this.tabManager.switchToTab(tab.id);
      return;
    }

    // Settings is intentionally kept as a stable browser shortcut.
    if (input.control && input.key === ',') {
      event.preventDefault();
      this.onOpenSettings?.();
      return;
    }

    if (this.matchesShortcut(input, 'quitApplication', 'Ctrl+Q')) {
      event.preventDefault();
      this.quitApplication();
      return;
    }

    if (this.matchesShortcut(input, 'closeWindow', 'Ctrl+Shift+W')) {
      event.preventDefault();
      this.getMainWindow()?.close();
      return;
    }

    if (this.matchesShortcut(input, 'closeTab', 'Ctrl+W')) {
      event.preventDefault();
      const id = this.tabManager.getActiveTabId();
      if (id) this.tabManager.closeTab(id);
      return;
    }

    if (this.switchToNumberedTab(input)) {
      event.preventDefault();
      return;
    }

    if (input.control && input.key === 'Tab' && !input.shift) {
      event.preventDefault();
      this.tabManager.nextTab();
      return;
    }

    if (input.control && input.key === 'Tab' && input.shift) {
      event.preventDefault();
      this.tabManager.previousTab();
      return;
    }

    if (
      this.matchesShortcut(input, 'openLocation', 'Ctrl+L') ||
      this.matchesShortcut(input, 'openLocationAlt', 'Alt+D') ||
      this.matchesShortcut(input, 'focusSearch', 'Ctrl+K') ||
      this.matchesShortcut(input, 'focusSearchAlt', 'Ctrl+J')
    ) {
      event.preventDefault();
      this.sidebarView.webContents.send(IPC.FOCUS_URL_BAR);
      return;
    }

    if (
      this.matchesShortcut(input, 'goBack', 'Alt+Left') ||
      this.matchesShortcut(input, 'navigateBackAlt', 'Ctrl+[')
    ) {
      event.preventDefault();
      this.tabManager.goBack();
      return;
    }

    if (
      this.matchesShortcut(input, 'goForward', 'Alt+Right') ||
      this.matchesShortcut(input, 'navigateForwardAlt', 'Ctrl+]')
    ) {
      event.preventDefault();
      this.tabManager.goForward();
      return;
    }

    if (this.matchesShortcut(input, 'reloadPageSkipCache', 'Ctrl+Shift+R')) {
      event.preventDefault();
      this.getActiveWebContents()?.reloadIgnoringCache();
      return;
    }

    if (this.matchesShortcut(input, 'reloadPage', 'Ctrl+R') || this.matchesKey(input, 'F5')) {
      event.preventDefault();
      this.tabManager.reload();
      return;
    }

    if (
      this.matchesShortcut(input, 'bookmarkThisPage', 'Ctrl+D') ||
      this.matchesShortcut(input, 'bookmarkThisPageAlt', 'Not set')
    ) {
      event.preventDefault();
      this.toggleBookmark();
      return;
    }

    if (this.matchesShortcut(input, 'togglePinTab', 'Ctrl+Shift+D')) {
      event.preventDefault();
      this.togglePinActiveTab();
      return;
    }

    if (
      this.matchesShortcut(input, 'findOnPage', 'Ctrl+F') ||
      this.matchesShortcut(input, 'findAgain', 'Ctrl+G') ||
      this.matchesShortcut(input, 'findPrevious', 'Ctrl+Shift+G')
    ) {
      event.preventDefault();
      this.sidebarView.webContents.send(IPC.SHOW_FIND_BAR);
      return;
    }

    if (this.matchesShortcut(input, 'zoomIn', 'Ctrl++')) {
      event.preventDefault();
      this.tabManager.zoomIn();
      return;
    }

    if (this.matchesShortcut(input, 'zoomOut', 'Ctrl+-')) {
      event.preventDefault();
      this.tabManager.zoomOut();
      return;
    }

    if (this.matchesShortcut(input, 'resetZoom', 'Ctrl+0')) {
      event.preventDefault();
      this.tabManager.zoomReset();
      return;
    }

    if (
      this.matchesShortcut(input, 'enterFullScreen', 'F11') ||
      this.matchesShortcut(input, 'exitFullScreen', 'F11')
    ) {
      event.preventDefault();
      const win = this.getMainWindow();
      if (win) win.setFullScreen(!win.isFullScreen());
      return;
    }

    if (this.matchesKey(input, 'Esc')) {
      // Close glance first if active
      if (this.glanceManager?.isActive()) {
        event.preventDefault();
        this.glanceManager.close();
        return;
      }
      this.tabManager.stopFind();
      this.sidebarView.webContents.send(IPC.FIND_RESULT, null);
      const win = this.getMainWindow();
      if (win?.isFullScreen()) win.setFullScreen(false);
      return;
    }

    if (
      this.matchesShortcut(input, 'toggleCompactMode', 'Ctrl+S') ||
      this.matchesShortcut(input, 'toggleFloatingSidebar', 'Ctrl+Alt+S')
    ) {
      event.preventDefault();
      this.compactMode?.toggleMode();
      return;
    }

    if (this.matchesShortcut(input, 'closeAllUnpinnedTabs', 'Ctrl+Shift+K')) {
      event.preventDefault();
      this.closeAllUnpinnedTabs();
      return;
    }

    if (this.switchToNumberedWorkspace(input)) {
      event.preventDefault();
      return;
    }

    if (this.matchesShortcut(input, 'forwardWorkspace', 'Ctrl+Alt+Right')) {
      event.preventDefault();
      this.spaceManager?.switchToNextSpace();
      return;
    }

    if (this.matchesShortcut(input, 'backwardWorkspace', 'Ctrl+Alt+Left')) {
      event.preventDefault();
      this.spaceManager?.switchToPreviousSpace();
      return;
    }

    if (this.matchesShortcut(input, 'newEmptySplitView', 'Ctrl+Shift+Plus')) {
      event.preventDefault();
      this.openSplitView('horizontal');
      return;
    }

    if (this.matchesShortcut(input, 'closeSplitView', 'Ctrl+Alt+U')) {
      event.preventDefault();
      this.splitView?.unsplit();
      return;
    }

    if (this.matchesShortcut(input, 'toggleSplitViewHorizontal', 'Ctrl+Alt+H')) {
      event.preventDefault();
      this.toggleSplitDirection('horizontal');
      return;
    }

    if (this.matchesShortcut(input, 'toggleSplitViewVertical', 'Ctrl+Alt+V')) {
      event.preventDefault();
      this.toggleSplitDirection('vertical');
      return;
    }

    if (this.matchesShortcut(input, 'expandGlance', 'Ctrl+O')) {
      event.preventDefault();
      this.glanceManager?.expand();
      return;
    }

    if (this.matchesShortcut(input, 'copyCurrentUrlAsMarkdown', 'Ctrl+Alt+Shift+C')) {
      event.preventDefault();
      this.copyCurrentUrl(true);
      return;
    }

    if (this.matchesShortcut(input, 'copyCurrentUrl', 'Ctrl+Shift+C')) {
      event.preventDefault();
      this.copyCurrentUrl(false);
      return;
    }

    if (this.matchesShortcut(input, 'toggleMute', 'Ctrl+M')) {
      event.preventDefault();
      const wc = this.getActiveWebContents();
      if (wc) wc.setAudioMuted(!wc.isAudioMuted());
      return;
    }

    if (this.matchesShortcut(input, 'printPage', 'Ctrl+P')) {
      event.preventDefault();
      this.getActiveWebContents()?.print({});
      return;
    }

    if (this.matchesShortcut(input, 'viewPageSource', 'Ctrl+U')) {
      event.preventDefault();
      const url = this.tabManager.getActiveTabUrl();
      if (url && !url.startsWith('view-source:')) {
        const tab = this.tabManager.createTab(`view-source:${url}`);
        this.tabManager.switchToTab(tab.id);
      }
      return;
    }

    if (this.matchesShortcut(input, 'takeScreenshot', 'Ctrl+Shift+S')) {
      event.preventDefault();
      this.copyScreenshotToClipboard();
      return;
    }

    if (
      this.matchesShortcut(input, 'toggleDevTools', 'Ctrl+Shift+I') ||
      this.matchesShortcut(input, 'toggleBrowserConsole', 'Ctrl+Shift+J') ||
      this.matchesShortcut(input, 'toggleInspector', 'Ctrl+Shift+L') ||
      this.matchesShortcut(input, 'toggleWebConsole', 'Ctrl+Shift+K') ||
      this.matchesShortcut(input, 'toggleJavaScriptDebugger', 'Ctrl+Shift+Z') ||
      this.matchesShortcut(input, 'toggleNetworkMonitor', 'Ctrl+Shift+E') ||
      this.matchesShortcut(input, 'toggleResponsiveDesignMode', 'Ctrl+Shift+M') ||
      this.matchesShortcut(input, 'toggleStyleEditor', 'Shift+F7') ||
      this.matchesShortcut(input, 'togglePerformance', 'Shift+F5') ||
      this.matchesShortcut(input, 'toggleStorage', 'Shift+F9') ||
      this.matchesShortcut(input, 'toggleAccessibility', 'Shift+F12')
    ) {
      event.preventDefault();
      this.toggleActiveDevTools();
      return;
    }
  }

  private shortcut(id: string, fallback: string): string {
    return this.getShortcutValue?.(shortcutPrefKey(id), fallback) || fallback;
  }

  private matchesShortcut(input: Electron.Input, id: string, fallback: string): boolean {
    return ShortcutManager.matches(input, this.shortcut(id, fallback));
  }

  private matchesKey(input: Electron.Input, key: string): boolean {
    return ShortcutManager.normalizeInputKey(input.key) === ShortcutManager.normalizeKeyName(key)
      && !input.control
      && !input.alt
      && !input.shift
      && !input.meta;
  }

  private static matches(input: Electron.Input, shortcut: string): boolean {
    const parsed = ShortcutManager.parseShortcut(shortcut);
    if (!parsed) return false;

    if (parsed.ctrl !== !!input.control) return false;
    if (parsed.alt !== !!input.alt) return false;
    if (parsed.shift !== !!input.shift) return false;
    if (parsed.meta !== !!input.meta) return false;

    const inputKey = ShortcutManager.normalizeInputKey(input.key);
    return inputKey === parsed.key || (parsed.key === '+' && inputKey === '=');
  }

  private static parseShortcut(shortcut: string): ParsedShortcut | null {
    const trimmed = shortcut.trim();
    if (!trimmed || trimmed.toLowerCase() === 'not set') return null;

    let source = trimmed;
    const plusIsKey = source.endsWith('++');
    if (plusIsKey) source = source.slice(0, -1);

    const parts = source.split('+').map(part => part.trim()).filter(Boolean);
    if (plusIsKey) parts.push('+');

    const parsed: ParsedShortcut = {
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
      key: '',
    };

    for (const part of parts) {
      const lower = part.toLowerCase();
      if (lower === 'ctrl' || lower === 'control') parsed.ctrl = true;
      else if (lower === 'alt' || lower === 'option') parsed.alt = true;
      else if (lower === 'shift') parsed.shift = true;
      else if (lower === 'meta' || lower === 'cmd' || lower === 'command' || lower === 'super') parsed.meta = true;
      else parsed.key = ShortcutManager.normalizeKeyName(part);
    }

    return parsed.key ? parsed : null;
  }

  private static normalizeInputKey(key: string): string {
    const map: Record<string, string> = {
      ArrowLeft: 'Left',
      ArrowRight: 'Right',
      ArrowUp: 'Up',
      ArrowDown: 'Down',
      Escape: 'Esc',
      ' ': 'Space',
      Spacebar: 'Space',
      Delete: 'Delete',
      Backspace: 'Backspace',
      Home: 'Home',
      End: 'End',
      PageUp: 'PageUp',
      PageDown: 'PageDown',
      Insert: 'Insert',
      Tab: 'Tab',
      '=': '+',
    };
    if (map[key]) return map[key];
    if (/^F\d{1,2}$/i.test(key)) return key.toUpperCase();
    if (key.length === 1) return /[a-z]/i.test(key) ? key.toUpperCase() : key;
    return key;
  }

  private static normalizeKeyName(key: string): string {
    const map: Record<string, string> = {
      left: 'Left',
      right: 'Right',
      up: 'Up',
      down: 'Down',
      arrowleft: 'Left',
      arrowright: 'Right',
      arrowup: 'Up',
      arrowdown: 'Down',
      esc: 'Esc',
      escape: 'Esc',
      space: 'Space',
      spacebar: 'Space',
      plus: '+',
      delete: 'Delete',
      del: 'Delete',
      backspace: 'Backspace',
      tab: 'Tab',
      home: 'Home',
      end: 'End',
      pageup: 'PageUp',
      pagedown: 'PageDown',
      insert: 'Insert',
    };
    const lower = key.toLowerCase();
    if (map[lower]) return map[lower];
    if (/^f\d{1,2}$/.test(lower)) return lower.toUpperCase();
    if (key.length === 1) return /[a-z]/i.test(key) ? key.toUpperCase() : key;
    return key;
  }

  private getActiveWebContents(): Electron.WebContents | null {
    const activeId = this.tabManager.getActiveTabId();
    if (!activeId) return null;
    return this.tabManager.findTabById(activeId)?.view.webContents || null;
  }

  private quitApplication(): void {
    if (this.getConfirmQuit?.()) {
      const win = this.getMainWindow();
      const choice = dialog.showMessageBoxSync(win as any, {
        type: 'question',
        buttons: ['Quit', 'Cancel'],
        defaultId: 0,
        cancelId: 1,
        message: 'Quit Draco?',
        detail: 'Are you sure you want to quit?',
      });
      if (choice === 1) return;
    }
    app.quit();
  }

  private toggleBookmark(): void {
    const url = this.tabManager.getActiveTabUrl();
    const title = this.tabManager.getActiveTabTitle();
    if (!url || url.startsWith('data:') || url.startsWith('astra://')) return;

    if (this.database.isBookmarked(url)) {
      this.database.removeBookmark(url);
      this.sidebarView.webContents.send(IPC.BOOKMARK_STATUS, false);
    } else {
      this.database.addBookmark(url, title);
      this.sidebarView.webContents.send(IPC.BOOKMARK_STATUS, true);
    }
  }

  private togglePinActiveTab(): void {
    const activeId = this.tabManager.getActiveTabId();
    if (!activeId) return;
    const tab = this.tabManager.findTabById(activeId);
    if (!tab) return;
    if (tab.isPinned) this.tabManager.unpinTab(activeId);
    else this.tabManager.pinTab(activeId);
  }

  private closeAllUnpinnedTabs(): void {
    for (const id of [...this.tabManager.getAllTabIds()]) {
      const tab = this.tabManager.findTabById(id);
      if (tab && !tab.isPinned) this.tabManager.closeTab(id);
    }
  }

  private switchToNumberedTab(input: Electron.Input): boolean {
    const allTabIds = this.tabManager.getAllTabIds();
    for (let index = 0; index < 8; index++) {
      if (!this.matchesShortcut(input, `selectTab${index + 1}`, `Alt+${index + 1}`)) continue;
      if (allTabIds[index]) this.tabManager.switchToTab(allTabIds[index]);
      return true;
    }
    if (this.matchesShortcut(input, 'selectLastTab', 'Alt+9')) {
      const id = allTabIds[allTabIds.length - 1];
      if (id) this.tabManager.switchToTab(id);
      return true;
    }
    return false;
  }

  private switchToNumberedWorkspace(input: Electron.Input): boolean {
    if (!this.spaceManager) return false;
    const spaces = this.spaceManager.getSpaces();
    for (let index = 0; index < 10; index++) {
      if (!this.matchesShortcut(input, `switchWorkspace${index + 1}`, 'Not set')) continue;
      if (spaces[index]) this.spaceManager.switchToSpace(spaces[index].id);
      return true;
    }
    return false;
  }

  private openSplitView(direction: 'horizontal' | 'vertical'): void {
    if (this.splitView?.isActive()) {
      this.toggleSplitDirection(direction);
      return;
    }
    const activeId = this.tabManager.getActiveTabId();
    if (!activeId) return;
    let tabIds = this.tabManager.getAllTabIds();
    if (tabIds.length < 2) {
      this.tabManager.createTab();
      tabIds = this.tabManager.getAllTabIds();
    }
    const secondId = tabIds.find(id => id !== activeId);
    if (secondId) this.splitView?.split(activeId, secondId, direction);
  }

  private toggleSplitDirection(direction: 'horizontal' | 'vertical'): void {
    if (!this.splitView?.isActive()) {
      this.openSplitView(direction);
      return;
    }
    if (this.splitView.getState().direction !== direction) {
      this.splitView.toggleDirection();
    }
  }

  private copyCurrentUrl(markdown: boolean): void {
    const url = this.tabManager.getActiveTabUrl();
    if (!url) return;
    const title = this.tabManager.getActiveTabTitle() || url;
    clipboard.writeText(markdown ? `[${title}](${url})` : url);
    this.sidebarView.webContents.send('url-copied', url);
  }

  private copyScreenshotToClipboard(): void {
    this.getActiveWebContents()?.capturePage()
      .then(image => clipboard.writeImage(image))
      .catch(() => { /* capture can fail during navigation */ });
  }

  private toggleActiveDevTools(): void {
    const wc = this.getActiveWebContents();
    if (!wc) return;
    if (wc.isDevToolsOpened()) wc.closeDevTools();
    else wc.openDevTools({ mode: 'detach' });
  }
}
