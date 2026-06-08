/**
 * Settings Page — draco://settings
 *
 * Full-page preferences (Zen/Firefox about:preferences style).
 * Rendered inside a content WebContentsView like any other tab so it
 * lives in tab history, has back/forward, and can be bookmarked.
 *
 * Sections: General · Appearance · Privacy & Security · Search ·
 *           Shortcuts · Bookmarks · History · About
 *
 * Each section is a self-contained <section> in one document. Left-nav
 * uses scrollspy + smooth-scroll to feel like distinct pages without the
 * latency of navigating between them.
 */

const ICONS = {
  general:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  appearance:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0 0 20 5 5 0 0 0 0-10 5 5 0 0 1 0-10z"/></svg>',
  privacy:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  search:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  shortcuts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12"/></svg>',
  bookmarks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  history:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  about:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
};

export function getSettingsPageUrl(): string {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Settings — Draco</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #0f0f1f;
    --bg-elevated: #16162e;
    --surface: rgba(255,255,255,0.04);
    --surface-hover: rgba(255,255,255,0.07);
    --border: rgba(255,255,255,0.08);
    --text: rgba(255,255,255,0.94);
    --text-dim: rgba(255,255,255,0.6);
    --text-muted: rgba(255,255,255,0.4);
    --accent: #6366f1;
    --accent-soft: rgba(99,102,241,0.14);
    --danger: #f87171;
    --radius: 10px;
    --nav-w: 240px;
  }

  html, body {
    height: 100%;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    overflow: hidden;
  }

  .layout {
    display: grid;
    grid-template-columns: var(--nav-w) 1fr;
    height: 100vh;
  }

  /* ===== LEFT NAV ===== */
  nav.sidenav {
    background: var(--bg-elevated);
    border-right: 1px solid var(--border);
    padding: 28px 14px;
    overflow-y: auto;
  }

  .nav-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--text-muted);
    padding: 0 12px 14px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 8px;
    color: var(--text-dim);
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: background 0.12s ease, color 0.12s ease;
    margin-bottom: 1px;
  }

  .nav-item svg { width: 16px; height: 16px; flex-shrink: 0; }
  .nav-item:hover { background: var(--surface-hover); color: var(--text); }
  .nav-item.active {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .nav-item.active svg { color: var(--accent); }

  /* ===== MAIN ===== */
  main {
    overflow-y: auto;
    padding: 48px 64px 120px;
    scroll-behavior: smooth;
  }

  main::-webkit-scrollbar { width: 8px; }
  main::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.08);
    border-radius: 4px;
  }
  main::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.14); }

  section {
    max-width: 720px;
    margin-bottom: 56px;
    scroll-margin-top: 32px;
  }

  section h2 {
    font-size: 26px;
    font-weight: 600;
    margin-bottom: 6px;
    letter-spacing: -0.4px;
  }

  section .section-sub {
    color: var(--text-dim);
    font-size: 13px;
    margin-bottom: 24px;
  }

  /* Setting rows */
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 8px;
    gap: 24px;
  }

  .row-text { flex: 1; min-width: 0; }
  .row-label { font-size: 14px; font-weight: 500; color: var(--text); }
  .row-hint { font-size: 12px; color: var(--text-dim); margin-top: 3px; }
  .row-control { flex-shrink: 0; }

  /* Form controls */
  select, input[type="text"] {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    padding: 8px 12px;
    font-size: 13px;
    font-family: inherit;
    min-width: 180px;
    outline: none;
    transition: border-color 0.12s;
  }
  select:focus, input[type="text"]:focus { border-color: var(--accent); }

  /* Toggle switch */
  .toggle {
    position: relative;
    width: 40px;
    height: 22px;
    background: rgba(255,255,255,0.12);
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.18s;
    flex-shrink: 0;
  }
  .toggle::after {
    content: '';
    position: absolute;
    top: 3px; left: 3px;
    width: 16px; height: 16px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .toggle.on { background: var(--accent); }
  .toggle.on::after { transform: translateX(18px); }

  /* Status pill */
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 500;
    background: rgba(52, 211, 153, 0.12);
    color: #34d399;
  }
  .pill.warn { background: rgba(251, 191, 36, 0.12); color: #fbbf24; }

  /* Kbd */
  kbd {
    display: inline-block;
    padding: 2px 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-bottom-width: 2px;
    border-radius: 5px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11.5px;
    color: var(--text);
  }

  .shortcut-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px 32px;
    padding: 18px 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  .shortcut-grid .desc { color: var(--text-dim); font-size: 13px; }
  .shortcut-grid .keys { display: flex; gap: 4px; align-items: center; }

  /* Lists (bookmarks / history) */
  .list-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .list-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 18px;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.1s;
  }
  .list-row:last-child { border-bottom: none; }
  .list-row:hover { background: var(--surface-hover); }
  .list-row .ico { font-size: 14px; opacity: 0.7; }
  .list-row .meta { flex: 1; min-width: 0; }
  .list-row .ttl { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .list-row .url { font-size: 11px; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }

  .empty {
    padding: 48px 20px;
    text-align: center;
    color: var(--text-muted);
    font-size: 13px;
  }

  /* About */
  .about-card {
    background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(165,180,252,0.04));
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 32px;
    text-align: center;
  }
  .about-logo {
    font-size: 40px;
    font-weight: 700;
    background: linear-gradient(135deg, #6366f1, #a5b4fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 4px;
    letter-spacing: -1px;
  }
  .about-tag { color: var(--text-dim); margin-bottom: 18px; }
  .about-version { font-size: 12px; color: var(--text-muted); }

  .danger-btn {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: var(--danger);
    padding: 7px 14px;
    border-radius: 7px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.12s;
  }
  .danger-btn:hover { background: rgba(239, 68, 68, 0.18); }
</style>
</head>
<body>
  <div class="layout">
    <nav class="sidenav">
      <div class="nav-title">Settings</div>
      <div class="nav-item active" data-target="general">${ICONS.general}<span>General</span></div>
      <div class="nav-item" data-target="appearance">${ICONS.appearance}<span>Appearance</span></div>
      <div class="nav-item" data-target="privacy">${ICONS.privacy}<span>Privacy &amp; Security</span></div>
      <div class="nav-item" data-target="search">${ICONS.search}<span>Search</span></div>
      <div class="nav-item" data-target="shortcuts">${ICONS.shortcuts}<span>Shortcuts</span></div>
      <div class="nav-item" data-target="bookmarks">${ICONS.bookmarks}<span>Bookmarks</span></div>
      <div class="nav-item" data-target="history">${ICONS.history}<span>History</span></div>
      <div class="nav-item" data-target="about">${ICONS.about}<span>About</span></div>
    </nav>

    <main>
      <section id="general">
        <h2>General</h2>
        <p class="section-sub">Default behavior and startup options.</p>

        <div class="row">
          <div class="row-text">
            <div class="row-label">Restore previous session</div>
            <div class="row-hint">Reopen tabs and workspaces from last time on launch</div>
          </div>
          <div class="row-control"><div class="toggle on" data-pref="restoreSession" data-pref-type="bool"></div></div>
        </div>

        <div class="row">
          <div class="row-text">
            <div class="row-label">Default new tab page</div>
            <div class="row-hint">What to show when opening a fresh tab</div>
          </div>
          <div class="row-control">
            <select data-pref="newTabPage">
              <option value="draco">Draco Home</option>
              <option value="blank">Blank Page</option>
              <option value="custom">Custom URL…</option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="row-text">
            <div class="row-label">Hardware acceleration</div>
            <div class="row-hint">Use GPU for rendering — requires restart</div>
          </div>
          <div class="row-control"><div class="toggle on" data-pref="hwAccel"></div></div>
        </div>
      </section>

      <section id="appearance">
        <h2>Appearance</h2>
        <p class="section-sub">Theme, sidebar, and visual density.</p>

        <div class="row">
          <div class="row-text">
            <div class="row-label">Theme</div>
            <div class="row-hint">Draco Dark is the only theme right now — light coming soon</div>
          </div>
          <div class="row-control">
            <select data-pref="theme">
              <option value="dark">Draco Dark</option>
              <option value="light" disabled>Light (soon)</option>
              <option value="system" disabled>Match System (soon)</option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="row-text">
            <div class="row-label">Compact sidebar</div>
            <div class="row-hint">Auto-hide sidebar when not in use (Ctrl+S)</div>
          </div>
          <div class="row-control"><div class="toggle" data-pref="compactSidebar"></div></div>
        </div>

        <div class="row">
          <div class="row-text">
            <div class="row-label">Workspace color glow</div>
            <div class="row-hint">Tint sidebar background with the active workspace color</div>
          </div>
          <div class="row-control"><div class="toggle on" data-pref="spaceGlow"></div></div>
        </div>
      </section>

      <section id="privacy">
        <h2>Privacy &amp; Security</h2>
        <p class="section-sub">Protections enabled by default.</p>

        <div class="row">
          <div class="row-text">
            <div class="row-label">Ad blocker</div>
            <div class="row-hint">Blocks ads, trackers, and known malicious domains</div>
          </div>
          <div class="row-control"><span class="pill">●  Enabled</span></div>
        </div>

        <div class="row">
          <div class="row-text">
            <div class="row-label">Fingerprint guard</div>
            <div class="row-hint">Canvas noise · WebGL spoofing · Referrer trimming</div>
          </div>
          <div class="row-control"><span class="pill">●  Active</span></div>
        </div>

        <div class="row">
          <div class="row-text">
            <div class="row-label">Do Not Track</div>
            <div class="row-hint">Send "do not track" with every request</div>
          </div>
          <div class="row-control"><div class="toggle on" data-pref="dnt"></div></div>
        </div>

        <div class="row">
          <div class="row-text">
            <div class="row-label">Clear browsing data on quit</div>
            <div class="row-hint">Cookies, cache, and site storage are wiped when Draco closes</div>
          </div>
          <div class="row-control"><div class="toggle" data-pref="clearOnQuit"></div></div>
        </div>
      </section>

      <section id="search">
        <h2>Search</h2>
        <p class="section-sub">Default search engine and bang shortcuts.</p>

        <div class="row">
          <div class="row-text">
            <div class="row-label">Default search engine</div>
            <div class="row-hint">Used when you type a query without a URL</div>
          </div>
          <div class="row-control">
            <select data-pref="searchEngine" data-pref-type="string">
              <option value="duckduckgo">DuckDuckGo</option>
              <option value="google">Google</option>
              <option value="bing">Bing</option>
              <option value="brave">Brave Search</option>
            </select>
          </div>
        </div>

        <div class="row" style="flex-direction: column; align-items: stretch;">
          <div class="row-text" style="margin-bottom: 12px;">
            <div class="row-label">Bang shortcuts</div>
            <div class="row-hint">Type a bang anywhere to redirect: "react !mdn hooks"</div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 24px; font-size: 12px; color: var(--text-dim);">
            <div><kbd>!g</kbd> Google</div>
            <div><kbd>!yt</kbd> YouTube</div>
            <div><kbd>!gh</kbd> GitHub</div>
            <div><kbd>!w</kbd> Wikipedia</div>
            <div><kbd>!so</kbd> Stack Overflow</div>
            <div><kbd>!mdn</kbd> MDN</div>
            <div><kbd>!npm</kbd> npm</div>
            <div><kbd>!r</kbd> Reddit</div>
          </div>
        </div>
      </section>

      <section id="shortcuts">
        <h2>Keyboard Shortcuts</h2>
        <p class="section-sub">Everything you can do without leaving the keyboard.</p>

        <div class="shortcut-grid">
          <div class="desc">New tab</div><div class="keys"><kbd>Ctrl</kbd>+<kbd>T</kbd></div>
          <div class="desc">Close tab</div><div class="keys"><kbd>Ctrl</kbd>+<kbd>W</kbd></div>
          <div class="desc">Reopen closed tab</div><div class="keys"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd></div>
          <div class="desc">Toggle sidebar</div><div class="keys"><kbd>Ctrl</kbd>+<kbd>S</kbd></div>
          <div class="desc">Split view</div><div class="keys"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd></div>
          <div class="desc">Copy URL</div><div class="keys"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd></div>
          <div class="desc">Switch workspace</div><div class="keys"><kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>←/→</kbd></div>
          <div class="desc">Find in page</div><div class="keys"><kbd>Ctrl</kbd>+<kbd>F</kbd></div>
          <div class="desc">Open settings</div><div class="keys"><kbd>Ctrl</kbd>+<kbd>,</kbd></div>
          <div class="desc">Close glance / find</div><div class="keys"><kbd>Esc</kbd></div>
        </div>
      </section>

      <section id="bookmarks">
        <h2>Bookmarks</h2>
        <p class="section-sub">All saved pages across every workspace.</p>
        <div class="list-card" id="bookmarks-list">
          <div class="empty">Loading…</div>
        </div>
      </section>

      <section id="history">
        <h2>History</h2>
        <p class="section-sub">Recently visited pages.</p>
        <div style="display:flex; justify-content: flex-end; margin-bottom: 8px;">
          <button class="danger-btn" id="clear-history">Clear all history</button>
        </div>
        <div class="list-card" id="history-list">
          <div class="empty">Loading…</div>
        </div>
      </section>

      <section id="about">
        <h2>About</h2>
        <p class="section-sub">App info and credits.</p>
        <div class="about-card">
          <div class="about-logo">Draco</div>
          <div class="about-tag">Protection. Privacy. Peace of mind.</div>
          <div class="about-version">Version 0.1.0 · Electron</div>
        </div>
      </section>
    </main>
  </div>

  <script>
    const navItems = document.querySelectorAll('.nav-item');
    const sections = Array.from(document.querySelectorAll('section'));
    const main = document.querySelector('main');

    // Click to scroll
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const target = document.getElementById(item.dataset.target);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Scrollspy
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navItems.forEach(n => n.classList.toggle('active', n.dataset.target === id));
        }
      });
    }, { root: main, rootMargin: '-20% 0px -70% 0px', threshold: 0 });
    sections.forEach(s => observer.observe(s));

    // Toggle switches — persist locally (or via bridge for real prefs)
    document.querySelectorAll('.toggle').forEach(t => {
      const isBridgePref = t.dataset.prefType === 'bool';
      if (!isBridgePref) {
        const key = 'draco-pref-' + t.dataset.pref;
        try {
          const v = localStorage.getItem(key);
          if (v === '1') t.classList.add('on');
          else if (v === '0') t.classList.remove('on');
        } catch {}
        t.addEventListener('click', () => {
          t.classList.toggle('on');
          try { localStorage.setItem(key, t.classList.contains('on') ? '1' : '0'); } catch {}
        });
      } else {
        t.addEventListener('click', () => {
          t.classList.toggle('on');
          if (window.draco && window.draco.setPref) {
            window.draco.setPref(t.dataset.pref, t.classList.contains('on'));
          }
        });
      }
    });

    // Selects — persist locally (or via bridge for real prefs)
    document.querySelectorAll('select[data-pref]').forEach(s => {
      const isBridgePref = s.dataset.prefType === 'string';
      if (!isBridgePref) {
        const key = 'draco-pref-' + s.dataset.pref;
        try {
          const v = localStorage.getItem(key);
          if (v) s.value = v;
        } catch {}
        s.addEventListener('change', () => {
          try { localStorage.setItem(key, s.value); } catch {}
        });
      } else {
        s.addEventListener('change', () => {
          if (window.draco && window.draco.setPref) {
            window.draco.setPref(s.dataset.pref, s.value);
          }
        });
      }
    });

    // Apply real-pref values once the bridge is ready
    function applyBridgePrefs(p) {
      if (!p) return;
      document.querySelectorAll('.toggle[data-pref-type="bool"]').forEach(t => {
        const v = p[t.dataset.pref];
        if (v === true) t.classList.add('on');
        else if (v === false) t.classList.remove('on');
      });
      document.querySelectorAll('select[data-pref-type="string"]').forEach(s => {
        const v = p[s.dataset.pref];
        if (typeof v === 'string') s.value = v;
      });
    }

    // Bookmarks & history via window.draco bridge injected from main process
    function renderList(containerId, items, emptyMsg) {
      const el = document.getElementById(containerId);
      if (!items || items.length === 0) {
        el.innerHTML = '<div class="empty">' + emptyMsg + '</div>';
        return;
      }
      el.innerHTML = items.slice(0, 200).map(it => {
        const url = (it.url || '').replace(/"/g, '&quot;');
        const title = (it.title || it.url || '').replace(/</g, '&lt;');
        return '<div class="list-row" data-url="' + url + '">' +
          '<span class="ico">' + (containerId === 'bookmarks-list' ? '★' : '◷') + '</span>' +
          '<div class="meta"><div class="ttl">' + title + '</div><div class="url">' + url + '</div></div>' +
        '</div>';
      }).join('');
      el.querySelectorAll('.list-row').forEach(row => {
        row.addEventListener('click', () => {
          if (window.draco && window.draco.navigate) window.draco.navigate(row.dataset.url);
        });
      });
    }

    function refreshBookmarks() {
      if (window.draco && window.draco.getBookmarks) {
        window.draco.getBookmarks().then(items => renderList('bookmarks-list', items, 'No bookmarks yet. Star any page to save it.'));
      }
    }
    function refreshHistory() {
      if (window.draco && window.draco.getHistory) {
        window.draco.getHistory().then(items => renderList('history-list', items, 'No history yet.'));
      }
    }

    document.getElementById('clear-history').addEventListener('click', () => {
      if (window.draco && window.draco.clearHistory) {
        window.draco.clearHistory().then(() => refreshHistory());
      }
    });

    // Wait for bridge — main process injects window.draco via executeJavaScript
    let attempts = 0;
    const waitForBridge = setInterval(() => {
      if (window.draco) {
        clearInterval(waitForBridge);
        refreshBookmarks();
        refreshHistory();
        if (window.draco.getPrefs) {
          window.draco.getPrefs().then(applyBridgePrefs);
        }
      } else if (++attempts > 40) {
        clearInterval(waitForBridge);
        document.getElementById('bookmarks-list').innerHTML = '<div class="empty">Bridge unavailable</div>';
        document.getElementById('history-list').innerHTML = '<div class="empty">Bridge unavailable</div>';
      }
    }, 50);
  </script>
</body>
</html>`;

  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

/** Recognized internal URLs that resolve to the settings page */
export function isSettingsUrl(url: string): boolean {
  return url === 'draco://settings' || url === 'astra://settings' || url.startsWith('draco://settings');
}
