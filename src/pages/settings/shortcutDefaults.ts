export interface ShortcutItem {
  readonly id: string;
  readonly label: string;
  readonly defaultValue: string;
}

export interface ShortcutGroup {
  readonly title: string;
  readonly items: readonly ShortcutItem[];
}

export const SHORTCUT_PREF_PREFIX = 'shortcut.';

export function shortcutPrefKey(id: string): string {
  return `${SHORTCUT_PREF_PREFIX}${id}`;
}

export const SHORTCUT_GROUPS: readonly ShortcutGroup[] = [
  {
    title: 'Compact Mode',
    items: [
      { id: 'toggleFloatingSidebar', label: 'Toggle Floating Sidebar', defaultValue: 'Ctrl+Alt+S' },
      { id: 'toggleCompactMode', label: 'Toggle Compact Mode', defaultValue: 'Ctrl+S' },
    ],
  },
  {
    title: 'Workspaces',
    items: [
      { id: 'closeAllUnpinnedTabs', label: 'Close All Unpinned Tabs', defaultValue: 'Ctrl+Shift+K' },
      { id: 'backwardWorkspace', label: 'Backward Workspace', defaultValue: 'Ctrl+Alt+Left' },
      { id: 'forwardWorkspace', label: 'Forward Workspace', defaultValue: 'Ctrl+Alt+Right' },
      { id: 'switchWorkspace1', label: 'Switch to Workspace 1', defaultValue: 'Not set' },
      { id: 'switchWorkspace2', label: 'Switch to Workspace 2', defaultValue: 'Not set' },
      { id: 'switchWorkspace3', label: 'Switch to Workspace 3', defaultValue: 'Not set' },
      { id: 'switchWorkspace4', label: 'Switch to Workspace 4', defaultValue: 'Not set' },
      { id: 'switchWorkspace5', label: 'Switch to Workspace 5', defaultValue: 'Not set' },
      { id: 'switchWorkspace6', label: 'Switch to Workspace 6', defaultValue: 'Not set' },
      { id: 'switchWorkspace7', label: 'Switch to Workspace 7', defaultValue: 'Not set' },
      { id: 'switchWorkspace8', label: 'Switch to Workspace 8', defaultValue: 'Not set' },
      { id: 'switchWorkspace9', label: 'Switch to Workspace 9', defaultValue: 'Not set' },
      { id: 'switchWorkspace10', label: 'Switch to Workspace 10', defaultValue: 'Not set' },
    ],
  },
  {
    title: 'Split View',
    items: [
      { id: 'newEmptySplitView', label: 'New Empty Split View', defaultValue: 'Ctrl+Shift+Plus' },
      { id: 'closeSplitView', label: 'Close Split View', defaultValue: 'Ctrl+Alt+U' },
      { id: 'toggleSplitViewHorizontal', label: 'Toggle Split View Horizontal', defaultValue: 'Ctrl+Alt+H' },
      { id: 'toggleSplitViewVertical', label: 'Toggle Split View Vertical', defaultValue: 'Ctrl+Alt+V' },
      { id: 'toggleSplitViewGrid', label: 'Toggle Split View Grid', defaultValue: 'Ctrl+Alt+G' },
    ],
  },
  {
    title: 'Other Zen Features',
    items: [
      { id: 'expandGlance', label: 'Expand Glance', defaultValue: 'Ctrl+O' },
      { id: 'togglePinTab', label: 'Toggle Pin Tab', defaultValue: 'Ctrl+Shift+D' },
      { id: 'copyCurrentUrlAsMarkdown', label: 'Copy current URL as Markdown', defaultValue: 'Ctrl+Alt+Shift+C' },
      { id: 'copyCurrentUrl', label: 'Copy current URL', defaultValue: 'Ctrl+Shift+C' },
      { id: 'toggleSidebarWidth', label: "Toggle Sidebar's Width", defaultValue: 'Not set' },
      { id: 'resetPinnedTabToPinnedUrl', label: 'Reset Pinned Tab to Pinned URL', defaultValue: 'Not set' },
    ],
  },
  {
    title: 'Window & Tab Management',
    items: [
      { id: 'newWindow', label: 'New Window', defaultValue: 'Ctrl+N' },
      { id: 'newTab', label: 'New Tab', defaultValue: 'Ctrl+T' },
      { id: 'closeTab', label: 'Close Tab', defaultValue: 'Ctrl+W' },
      { id: 'closeWindow', label: 'Close Window', defaultValue: 'Ctrl+Shift+W' },
      { id: 'quitApplication', label: 'Quit Application', defaultValue: 'Ctrl+Q' },
      { id: 'restoreLastClosedTab', label: 'Restore Last Closed Tab', defaultValue: 'Ctrl+Shift+T' },
      { id: 'undoCloseWindow', label: 'Undo Close Window', defaultValue: 'Ctrl+Shift+N' },
      { id: 'selectTab1', label: 'Select tab #1', defaultValue: 'Alt+1' },
      { id: 'selectTab2', label: 'Select tab #2', defaultValue: 'Alt+2' },
      { id: 'selectTab3', label: 'Select tab #3', defaultValue: 'Alt+3' },
      { id: 'selectTab4', label: 'Select tab #4', defaultValue: 'Alt+4' },
      { id: 'selectTab5', label: 'Select tab #5', defaultValue: 'Alt+5' },
      { id: 'selectTab6', label: 'Select tab #6', defaultValue: 'Alt+6' },
      { id: 'selectTab7', label: 'Select tab #7', defaultValue: 'Alt+7' },
      { id: 'selectTab8', label: 'Select tab #8', defaultValue: 'Alt+8' },
      { id: 'selectLastTab', label: 'Select last tab', defaultValue: 'Alt+9' },
    ],
  },
  {
    title: 'Navigation',
    items: [
      { id: 'goBack', label: 'Go Back', defaultValue: 'Alt+Left' },
      { id: 'goForward', label: 'Go Forward', defaultValue: 'Alt+Right' },
      { id: 'navigateBackAlt', label: 'Navigate Back (Alt)', defaultValue: 'Ctrl+[' },
      { id: 'navigateForwardAlt', label: 'Navigate Forward (Alt)', defaultValue: 'Ctrl+]' },
      { id: 'goHome', label: 'Go Home', defaultValue: 'Alt+Home' },
      { id: 'reloadPage', label: 'Reload Page', defaultValue: 'Ctrl+R' },
      { id: 'reloadPageSkipCache', label: 'Reload Page (Skip Cache)', defaultValue: 'Ctrl+Shift+R' },
      { id: 'goToHistory', label: 'Go to history', defaultValue: 'Ctrl+Shift+H' },
      { id: 'privateBrowsing', label: 'Private Browsing', defaultValue: 'Ctrl+Shift+P' },
    ],
  },
  {
    title: 'Search & Find',
    items: [
      { id: 'focusSearch', label: 'Focus Search', defaultValue: 'Ctrl+K' },
      { id: 'focusSearchAlt', label: 'Focus Search (Alt)', defaultValue: 'Ctrl+J' },
      { id: 'findOnPage', label: 'Find on Page', defaultValue: 'Ctrl+F' },
      { id: 'findAgain', label: 'Find Again', defaultValue: 'Ctrl+G' },
      { id: 'findPrevious', label: 'Find Previous', defaultValue: 'Ctrl+Shift+G' },
    ],
  },
  {
    title: 'Page Operations',
    items: [
      { id: 'openLocation', label: 'Open Location', defaultValue: 'Ctrl+L' },
      { id: 'openLocationAlt', label: 'Open Location (Alt)', defaultValue: 'Alt+D' },
      { id: 'savePage', label: 'Save Page', defaultValue: 'Ctrl+Alt+Shift+S' },
      { id: 'printPage', label: 'Print Page', defaultValue: 'Ctrl+P' },
      { id: 'toggleReaderMode', label: 'Toggle Reader Mode', defaultValue: 'Ctrl+Alt+R' },
      { id: 'togglePictureInPicture', label: 'Toggle Picture-in-Picture', defaultValue: 'Ctrl+Shift+]' },
      { id: 'viewPageSource', label: 'View Page Source', defaultValue: 'Ctrl+U' },
      { id: 'viewPageInfo', label: 'View Page Info', defaultValue: 'Ctrl+I' },
    ],
  },
  {
    title: 'History & Bookmarks',
    items: [
      { id: 'showAllHistory', label: 'Show All History', defaultValue: 'Ctrl+Shift+H' },
      { id: 'bookmarkThisPage', label: 'Bookmark This Page', defaultValue: 'Ctrl+D' },
      { id: 'bookmarkThisPageAlt', label: 'Bookmark This Page', defaultValue: 'Not set' },
      { id: 'showBookmarksLibrary', label: 'Show Bookmarks Library', defaultValue: 'Ctrl+Shift+O' },
    ],
  },
  {
    title: 'Media & Display',
    items: [
      { id: 'toggleMute', label: 'Toggle Mute', defaultValue: 'Ctrl+M' },
      { id: 'zoomOut', label: 'Zoom Out', defaultValue: 'Ctrl+-' },
      { id: 'zoomIn', label: 'Zoom In', defaultValue: 'Ctrl++' },
      { id: 'resetZoom', label: 'Reset Zoom', defaultValue: 'Ctrl+0' },
      { id: 'switchTextDirection', label: 'Switch Text Direction', defaultValue: 'Ctrl+Shift+X' },
      { id: 'takeScreenshot', label: 'Take Screenshot', defaultValue: 'Ctrl+Shift+S' },
    ],
  },
  {
    title: 'Developer Tools',
    items: [
      { id: 'toggleDevTools', label: 'Toggle DevTools', defaultValue: 'Ctrl+Shift+I' },
      { id: 'toggleBrowserToolbox', label: 'Toggle Browser Toolbox', defaultValue: 'Ctrl+Alt+Shift+I' },
      { id: 'toggleBrowserConsole', label: 'Toggle Browser Console', defaultValue: 'Ctrl+Shift+J' },
      { id: 'toggleResponsiveDesignMode', label: 'Toggle Responsive Design Mode', defaultValue: 'Ctrl+Shift+M' },
      { id: 'toggleInspector', label: 'Toggle Inspector', defaultValue: 'Ctrl+Shift+L' },
      { id: 'toggleWebConsole', label: 'Toggle Web Console', defaultValue: 'Ctrl+Shift+K' },
      { id: 'toggleJavaScriptDebugger', label: 'Toggle JavaScript Debugger', defaultValue: 'Ctrl+Shift+Z' },
      { id: 'toggleNetworkMonitor', label: 'Toggle Network Monitor', defaultValue: 'Ctrl+Shift+E' },
      { id: 'toggleStyleEditor', label: 'Toggle Style Editor', defaultValue: 'Shift+F7' },
      { id: 'togglePerformance', label: 'Toggle Performance', defaultValue: 'Shift+F5' },
      { id: 'toggleStorage', label: 'Toggle Storage', defaultValue: 'Shift+F9' },
      { id: 'toggleDOM', label: 'Toggle DOM', defaultValue: 'Ctrl+Shift+W' },
      { id: 'toggleAccessibility', label: 'Toggle Accessibility', defaultValue: 'Shift+F12' },
    ],
  },
  {
    title: 'Other',
    items: [
      { id: 'openDownloads', label: 'Open Downloads', defaultValue: 'Ctrl+Shift+Y' },
      { id: 'openAddOns', label: 'Open Add-ons', defaultValue: 'Ctrl+Shift+A' },
      { id: 'openFile', label: 'Open File', defaultValue: 'Not set' },
      { id: 'deleteKey', label: 'Delete Key', defaultValue: 'Delete' },
      { id: 'enterFullScreen', label: 'Enter Full Screen', defaultValue: 'F11' },
      { id: 'exitFullScreen', label: 'Exit Full Screen', defaultValue: 'F11' },
      { id: 'aboutProcesses', label: 'About Processes', defaultValue: 'Shift+Esc' },
      { id: 'showBookmarksSidebar', label: 'Show Bookmarks Sidebar', defaultValue: 'Ctrl+B' },
      { id: 'showBookmarksToolbar', label: 'Show Bookmarks Toolbar', defaultValue: 'Ctrl+Shift+B' },
      { id: 'browserStop', label: 'Browser:Stop', defaultValue: 'Not set' },
      { id: 'toggleAiChatbotSidebar', label: 'Toggle AI Chatbot Sidebar', defaultValue: 'Ctrl+Alt+X' },
      { id: 'toggleFirefoxSidebar', label: 'Toggle Firefox Sidebar', defaultValue: 'Ctrl+Alt+Z' },
      { id: 'showAllTabs', label: 'Show all tabs', defaultValue: 'Ctrl+Shift+Tab' },
      { id: 'clearBrowsingData', label: 'Clear Browsing Data', defaultValue: 'Ctrl+Shift+Delete' },
      { id: 'wrCaptureCommand', label: 'WR Capture Command', defaultValue: 'Ctrl+#' },
      { id: 'toggleWrCaptureSequence', label: 'Toggle WR Capture Sequence', defaultValue: 'Ctrl+^' },
    ],
  },
];
