export const STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }

  /* ===== TOKENS — Zen-style: all surfaces derive from --accent ===== */
  :root {
    --accent: #e8b7a8;
    --_bg-base:      #141414;
    --_surface-base: #1c1a1a;

    --bg:            color-mix(in srgb, var(--accent)  3%, var(--_bg-base)      97%);
    --bg-elevated:   color-mix(in srgb, var(--accent)  4%, var(--_surface-base) 96%);
    --surface:       color-mix(in srgb, var(--accent)  3%, rgba(255,255,255,0.045) 97%);
    --surface-hover: color-mix(in srgb, var(--accent)  7%, rgba(255,255,255,0.075) 93%);
    --border:        color-mix(in srgb, var(--accent) 12%, rgba(255,255,255,0.11) 88%);
    --accent-soft:   color-mix(in srgb, var(--accent) 18%, transparent);
    --accent-glow:   color-mix(in srgb, var(--accent) 32%, transparent);

    --text:       rgba(255,255,255,0.93);
    --text-dim:   rgba(255,255,255,0.60);
    --text-muted: rgba(255,255,255,0.38);
    --danger:     #f87171;
    --panel:      #1f1b1b;
    --control:    #3a3a3a;
    --field:      #26252f;
    --field-border: rgba(219,221,242,0.72);
    --radius:     6px;
    --nav-w:      240px;
  }

  /* Light theme */
  :root[data-theme="light"] {
    --_bg-base:      #f0f0f8;
    --_surface-base: #e8e8f4;
    --bg:            color-mix(in srgb, var(--accent)  4%, var(--_bg-base)      96%);
    --bg-elevated:   color-mix(in srgb, var(--accent)  5%, var(--_surface-base) 95%);
    --surface:       color-mix(in srgb, var(--accent)  5%, rgba(0,0,0,0.04) 95%);
    --surface-hover: color-mix(in srgb, var(--accent)  9%, rgba(0,0,0,0.07) 91%);
    --border:        color-mix(in srgb, var(--accent) 16%, rgba(0,0,0,0.10) 84%);
    --text:       rgba(0,0,0,0.88);
    --text-dim:   rgba(0,0,0,0.55);
    --text-muted: rgba(0,0,0,0.36);
    --danger:     #dc2626;
  }

  html, body {
    height: 100%;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    overflow: hidden;
    /* Smooth all color transitions when accent/theme changes */
    transition: background 0.22s ease, color 0.22s ease;
  }

  /* ===== LAYOUT ===== */
  .layout { display: grid; grid-template-columns: var(--nav-w) 1fr; height: 100vh; }

  /* ===== SIDENAV ===== */
  nav.sidenav {
    background: var(--bg-elevated);
    border-right: 1px solid var(--border);
    padding: 24px 12px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1px;
    transition: background 0.22s ease, border-color 0.22s ease;
  }
  nav.sidenav::-webkit-scrollbar { width: 0; }

  .nav-title {
    font-size: 10.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.3px;
    color: var(--text-muted);
    padding: 0 10px 14px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 9px 10px;
    border-radius: 7px;
    color: var(--text-dim);
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.12s ease, color 0.12s ease;
    user-select: none;
  }
  .nav-item svg { width: 15px; height: 15px; flex-shrink: 0; }
  .nav-item:hover { background: var(--surface-hover); color: var(--text); }
  .nav-item.active {
    background: var(--accent-soft);
    color: var(--accent);
    box-shadow: inset 0 0 0 1px var(--accent-glow);
  }

  /* ===== MAIN ===== */
  main {
    overflow-y: auto;
    padding: 48px 42px 100px;
    background: var(--bg);
    transition: background 0.22s ease;
  }
  main::-webkit-scrollbar { width: 7px; }
  main::-webkit-scrollbar-track { background: transparent; }
  main::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  main::-webkit-scrollbar-thumb:hover { background: var(--accent-soft); }

  /* Category pane visibility */
  .category-pane { display: none; max-width: 664px; }
  .category-pane[data-active="true"] { display: block; animation: fadeUp 0.18s ease; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .category-pane > h1 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 14px;
    letter-spacing: 0;
  }
  .category-pane > .category-sub {
    color: var(--text-dim);
    font-size: 13px;
    margin-bottom: 30px;
  }

  /* ===== SUBCATEGORY ===== */
  .subcategory { margin-bottom: 32px; }
  .subcategory > h2 {
    font-size: 10.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.1px;
    color: var(--text-muted);
    margin-bottom: 7px;
    padding-left: 2px;
  }
  /* Zen-style section header variant */
  .subcategory > h2.section-header {
    font-size: 13px;
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0;
    color: var(--text-dim);
    margin-bottom: 8px;
    padding-left: 2px;
  }

  .groupbox {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    transition: background 0.22s ease, border-color 0.22s ease;
  }

  /* ===== ROWS ===== */
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 18px;
    border-bottom: 1px solid var(--border);
    gap: 20px;
    transition: border-color 0.22s ease;
  }
  .row:last-child { border-bottom: none; }
  .row.column { flex-direction: column; align-items: stretch; }

  .row-text { flex: 1; min-width: 0; }
  .row-label { font-size: 13.5px; font-weight: 500; color: var(--text); display: flex; align-items: center; gap: 8px; }
  .row-hint  { font-size: 12px; color: var(--text-dim); margin-top: 2px; }
  .row-control { flex-shrink: 0; }

  .badge {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 4px;
    background: rgba(251,191,36,0.12);
    color: #fbbf24;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
  }

  /* ===== FORM CONTROLS ===== */
  select, input[type="text"] {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 7px;
    color: var(--text);
    padding: 7px 11px;
    font-size: 13px;
    font-family: inherit;
    min-width: 170px;
    outline: none;
    transition: border-color 0.12s ease;
  }
  select:focus, input[type="text"]:focus { border-color: var(--accent); }

  /* ===== TOGGLE ===== */
  .toggle {
    position: relative;
    width: 38px;
    height: 21px;
    background: rgba(255,255,255,0.12);
    border-radius: 999px;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.18s ease;
  }
  :root[data-theme="light"] .toggle { background: rgba(0,0,0,0.14); }
  .toggle::after {
    content: '';
    position: absolute;
    top: 2.5px; left: 2.5px;
    width: 16px; height: 16px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.25);
    transition: transform 0.18s cubic-bezier(0.16,1,0.3,1);
  }
  .toggle.on { background: var(--accent); }
  .toggle.on::after { transform: translateX(17px); }

  /* ===== PILL ===== */
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 500;
    background: rgba(52,211,153,0.12);
    color: #34d399;
  }
  .pill.warn { background: rgba(251,191,36,0.12); color: #fbbf24; }

  /* ===== KBD ===== */
  kbd {
    display: inline-block;
    padding: 1px 7px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-bottom-width: 2px;
    border-radius: 5px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    color: var(--text);
  }

  .shortcut-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px 28px;
    padding: 16px 18px;
  }
  .shortcut-grid .desc { color: var(--text-dim); font-size: 13px; align-self: center; }
  .shortcut-grid .keys { display: flex; gap: 3px; align-items: center; }

  /* ===== LISTS ===== */
  .list-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .list-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 16px;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.1s ease;
  }
  .list-row:last-child { border-bottom: none; }
  .list-row:hover { background: var(--surface-hover); }
  .list-row .ico { font-size: 13px; opacity: 0.6; }
  .list-row .meta { flex: 1; min-width: 0; }
  .list-row .ttl { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .list-row .url { font-size: 11px; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }

  .empty { padding: 48px 20px; text-align: center; color: var(--text-muted); font-size: 13px; }

  /* ===== ABOUT ===== */
  .about-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 32px;
    text-align: center;
    transition: background 0.22s ease;
  }
  .about-logo {
    font-size: 38px;
    font-weight: 700;
    background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, white));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 4px;
    letter-spacing: -1px;
  }
  .about-tag { color: var(--text-dim); margin-bottom: 16px; }
  .about-version { font-size: 12px; color: var(--text-muted); }

  .danger-btn {
    background: rgba(239,68,68,0.10);
    border: 1px solid rgba(239,68,68,0.20);
    color: var(--danger);
    padding: 6px 13px;
    border-radius: 7px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.12s ease;
  }
  .danger-btn:hover { background: rgba(239,68,68,0.18); }

  /* ===== CHECKBOX LIST (Zen-style flat lists for Tabs/Browsing) ===== */
  .cb-list {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    padding: 4px 0;
    transition: background 0.22s ease, border-color 0.22s ease;
  }

  .cb-row {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    padding: 9px 18px;
    cursor: pointer;
    user-select: none;
    border-radius: 0;
    transition: background 0.1s ease;
  }
  .cb-row:hover { background: var(--surface-hover); }

  /* Hide native checkbox, we draw our own */
  .cb-input { display: none; }

  /* Custom square checkbox track */
  .cb-track {
    flex-shrink: 0;
    margin-top: 2px;
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 1.5px solid var(--border);
    background: transparent;
    transition: background 0.14s ease, border-color 0.14s ease;
    position: relative;
  }
  .cb-row:hover .cb-track { border-color: var(--accent); }
  .cb-input:checked + .cb-track {
    background: var(--accent);
    border-color: var(--accent);
  }
  /* Checkmark */
  .cb-input:checked + .cb-track::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpolyline points='2,6 5,9 10,3' stroke='white' stroke-width='1.8' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
      center/10px no-repeat;
  }

  .cb-body {
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex: 1;
  }
  .cb-label {
    font-size: 13.5px;
    font-weight: 400;
    color: var(--text);
    line-height: 1.4;
  }
  .cb-hint {
    font-size: 11.5px;
    color: var(--text-dim);
    margin-top: 1px;
    line-height: 1.4;
  }

  /* ===== INLINE SELECT ROW (label + dropdown inline, no box) ===== */
  .inline-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 18px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: background 0.22s ease;
  }
  .inline-row-label {
    font-size: 13.5px;
    font-weight: 400;
    color: var(--text);
    flex: 1;
  }

  /* ===== THEME MODE CARDS ===== */
  .theme-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    padding: 14px 16px;
  }

  .theme-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 9px;
    padding: 12px 10px 11px;
    border-radius: 10px;
    border: 2px solid var(--border);
    cursor: pointer;
    user-select: none;
    background: transparent;
    transition: background 0.12s ease, border-color 0.12s ease;
  }
  .theme-card:hover { background: var(--surface-hover); }
  .theme-card.active {
    border-color: var(--accent);
    background: var(--accent-soft);
  }

  .theme-card-preview {
    width: 100%;
    height: 50px;
    border-radius: 7px;
    border: 1px solid rgba(128,128,128,0.2);
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 7px 8px;
    overflow: hidden;
  }
  .dark-preview   { background: #10102a; }
  .light-preview  { background: #f2f2f8; }
  .system-preview { background: linear-gradient(135deg, #10102a 50%, #f2f2f8 50%); }

  .tcp-bar { height: 4px; border-radius: 2px; }
  .dark-preview   .tcp-bar { background: rgba(255,255,255,0.14); }
  .light-preview  .tcp-bar { background: rgba(0,0,0,0.12); }
  .system-preview .tcp-bar { background: rgba(128,128,128,0.25); }
  .tcp-bar.accent { background: var(--accent) !important; width: 60%; }

  .theme-card-label { font-size: 12px; font-weight: 500; color: var(--text-dim); }
  .theme-card.active .theme-card-label { color: var(--accent); }

  /* ===== ACCENT COLOR PICKER ===== */
  .color-picker-wrap {
    padding: 14px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .color-swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
    align-items: center;
  }

  .color-swatch {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    flex-shrink: 0;
    position: relative;
    transition: transform 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
  }
  .color-swatch:hover { transform: scale(1.18); }
  .color-swatch.active {
    border-color: white;
    box-shadow: 0 0 0 2.5px var(--swatch-color, var(--accent));
    transform: scale(1.08);
  }
  .color-swatch.active::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpolyline points='2,6 5,9 10,3' stroke='white' stroke-width='1.8' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
      center/12px no-repeat;
  }

  .color-custom-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-top: 6px;
    border-top: 1px solid var(--border);
  }

  .color-custom-label {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 500;
    flex-shrink: 0;
    width: 48px;
  }

  .color-custom-controls {
    display: flex;
    align-items: center;
    gap: 9px;
    flex: 1;
  }

  input[type="color"]#accent-custom-picker {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid var(--border);
    background: none;
    cursor: pointer;
    padding: 0;
    outline: none;
    -webkit-appearance: none;
    overflow: hidden;
    flex-shrink: 0;
    transition: transform 0.12s ease;
  }
  input[type="color"]#accent-custom-picker::-webkit-color-swatch-wrapper { padding: 0; }
  input[type="color"]#accent-custom-picker::-webkit-color-swatch { border: none; border-radius: 50%; }
  input[type="color"]#accent-custom-picker:hover { transform: scale(1.12); }

  .color-hex-input {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 7px;
    color: var(--text);
    padding: 5px 9px;
    font-size: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    width: 84px;
    outline: none;
    min-width: unset;
    transition: border-color 0.12s ease;
  }
  .color-hex-input:focus { border-color: var(--accent); }

  .color-preview-dot {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--accent);
    border: 1.5px solid var(--border);
    flex-shrink: 0;
    box-shadow: 0 0 0 3px var(--accent-soft);
    transition: background 0.18s ease, box-shadow 0.18s ease;
  }

  /* ===== ZEN GENERAL PAGE ===== */
  .general-page {
    color: var(--text);
    padding-bottom: 6px;
  }

  .general-page h1 {
    font-size: 24px;
    line-height: 1.2;
    font-weight: 700;
    margin: 4px 0 14px;
    letter-spacing: 0;
  }

  .zen-section {
    margin: 0 0 28px;
  }
  .zen-section.no-title > h2 {
    display: none;
  }
  .zen-section > h2 {
    font-size: 22px;
    line-height: 1.25;
    font-weight: 700;
    margin: 0 0 12px;
    letter-spacing: 0;
  }
  .compact-section {
    margin-bottom: 28px;
  }

  .zen-panel {
    background: var(--panel);
    border-radius: 5px;
    padding: 28px 30px;
    border: 1px solid rgba(255,255,255,0.015);
  }
  .compact-section .zen-panel {
    padding-block: 18px;
  }

  .zen-block {
    margin: 0;
  }
  .zen-block + .zen-block {
    margin-top: 44px;
  }
  .zen-block > h3 {
    color: var(--text-dim);
    font-size: 14px;
    line-height: 1.35;
    font-weight: 700;
    margin: 0 0 8px;
    letter-spacing: 0;
  }
  .zen-description,
  .zen-panel p {
    color: var(--text-dim);
    font-size: 15px;
    line-height: 1.28;
    margin: 0 0 14px;
  }
  .zen-description.tight {
    margin-bottom: 8px;
  }

  .general-page .cb-list {
    background: transparent;
    border: 0;
    border-radius: 0;
    padding: 0;
    overflow: visible;
  }
  .general-page .cb-row {
    align-items: flex-start;
    gap: 8px;
    min-height: 26px;
    padding: 4px 0;
    border-radius: 4px;
  }
  .general-page .cb-row:hover {
    background: transparent;
  }
  .general-page .cb-track {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    border-color: rgba(218,221,244,0.72);
    background: #262631;
  }
  .general-page .cb-input:checked + .cb-track {
    background: var(--accent);
    border-color: var(--accent);
  }
  .general-page .cb-input:disabled + .cb-track,
  .general-page .dependent-row.disabled .cb-track {
    opacity: 0.5;
  }
  .general-page .cb-label {
    font-size: 15px;
    line-height: 1.25;
    color: var(--text);
  }
  .general-page .cb-hint {
    font-size: 12px;
    color: var(--text-muted);
  }
  .general-page .cb-row.indented {
    margin-left: 24px;
  }
  .general-page .dependent-row.disabled .cb-label,
  .general-page .dependent-row.disabled .cb-hint {
    color: var(--text-muted);
  }

  .split-checkbox-row {
    display: grid;
    grid-template-columns: 1fr 150px;
    align-items: center;
    gap: 18px;
    margin-top: 2px;
  }

  .default-browser-callout {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 12px;
    min-height: 58px;
    padding: 12px;
    color: var(--text);
    background: var(--field);
    border: 1px solid rgba(183,187,216,0.58);
    border-radius: 8px;
  }

  .setting-action-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 150px;
    align-items: center;
    gap: 20px;
  }
  .setting-action-row p {
    margin: 0;
    color: var(--text);
  }

  .zen-button {
    min-height: 34px;
    border: 0;
    border-radius: 5px;
    background: var(--control);
    color: var(--text);
    padding: 7px 16px;
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.12s ease, opacity 0.12s ease, transform 0.12s ease;
  }
  .zen-button:hover:not(:disabled) {
    background: #474747;
  }
  .zen-button:active:not(:disabled) {
    transform: translateY(1px);
  }
  .zen-button.accent {
    background: var(--accent);
    color: #201312;
  }
  .zen-button.ghost {
    background: transparent;
    text-decoration: underline;
    padding-inline: 10px;
  }
  .zen-button.muted,
  .zen-button:disabled {
    opacity: 0.45;
    cursor: default;
  }
  .download-btn {
    min-width: 104px;
    padding-inline: 14px;
  }

  .text-link {
    appearance: none;
    border: 0;
    background: transparent;
    color: var(--text);
    padding: 0;
    font: inherit;
    text-decoration: underline;
    cursor: pointer;
  }
  .text-link:hover {
    color: var(--accent);
  }

  .inline-form-row {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 0;
    background: transparent;
    border: 0;
    border-radius: 0;
  }
  .inline-form-row label,
  .download-path-row label {
    color: var(--text);
    font-size: 15px;
  }
  .fonts-row select:first-of-type {
    min-width: 245px;
  }
  .fonts-row select:nth-of-type(2),
  .zoom-row select {
    min-width: 68px;
  }
  .language-row {
    margin: 6px 0 12px;
  }
  .language-row select {
    min-width: 300px;
  }

  .general-page select,
  .zen-text-input,
  .search-field input {
    min-height: 34px;
    background: var(--control);
    border: 0;
    border-radius: 7px;
    color: var(--text);
    padding: 6px 14px;
    font-size: 14px;
    outline: none;
  }
  .general-page select:focus,
  .zen-text-input:focus,
  .search-field input:focus {
    box-shadow: 0 0 0 1px var(--field-border);
  }

  .appearance-choice-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 14px;
  }
  .appearance-choice-card {
    display: flex;
    min-height: 106px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border-radius: 8px;
    border: 1px solid rgba(218,221,244,0.72);
    background: var(--field);
    color: var(--text);
    cursor: pointer;
    font: inherit;
  }
  .appearance-choice-card.active {
    border: 3px solid var(--accent);
  }
  .appearance-choice-label {
    font-size: 14px;
  }
  .browser-preview {
    width: 56px;
    height: 43px;
    border-radius: 4px;
    border: 1px solid rgba(0,0,0,0.32);
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 7px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.35);
  }
  .browser-preview.auto,
  .browser-preview.dark {
    background: #4a4853;
  }
  .browser-preview.light {
    background: #f5f5f4;
  }
  .browser-preview .preview-top {
    height: 5px;
    border-radius: 2px;
    background: currentColor;
    opacity: 0.72;
  }
  .browser-preview .preview-line {
    height: 3px;
    width: 72%;
    border-radius: 2px;
    background: currentColor;
    opacity: 0.68;
  }
  .browser-preview .preview-line.wide {
    width: 100%;
  }
  .browser-preview .preview-line.short {
    width: 48%;
  }
  .browser-preview.light {
    color: #555762;
  }
  .browser-preview.auto,
  .browser-preview.dark {
    color: #f3f3f8;
  }

  .radio-list {
    display: grid;
    gap: 10px;
  }
  .radio-row {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text);
    font-size: 15px;
    cursor: pointer;
  }
  .radio-input {
    display: none;
  }
  .radio-track {
    width: 16px;
    height: 16px;
    border-radius: 999px;
    border: 1px solid rgba(218,221,244,0.75);
    background: #262631;
    position: relative;
  }
  .radio-input:checked + .radio-track {
    border-color: var(--accent);
  }
  .radio-input:checked + .radio-track::after {
    content: '';
    position: absolute;
    inset: 3px;
    border-radius: 999px;
    background: var(--accent);
  }
  .manage-colors {
    margin: 12px 0 0 24px;
  }

  .zen-divider {
    height: 1px;
    background: rgba(255,255,255,0.09);
    margin: 30px -10px 24px;
  }
  .language-copy {
    margin-bottom: 6px !important;
  }
  .language-page-row {
    margin: 8px 0 4px;
  }
  .privacy-warning {
    color: var(--text) !important;
    font-weight: 700;
    margin: 2px 0 6px !important;
  }

  .download-language-box,
  .applications-table-wrap {
    background: var(--field);
    border: 1px solid rgba(218,221,244,0.62);
    border-radius: 4px;
    overflow: hidden;
  }
  .download-language-header,
  .language-download-row {
    min-height: 43px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 14px;
    padding: 8px 12px 8px 22px;
    border-bottom: 1px solid rgba(218,221,244,0.32);
  }
  .language-download-row:last-child {
    border-bottom: 0;
  }

  .download-path-row {
    display: grid;
    gap: 4px;
    margin-bottom: 12px;
  }
  .download-path-control {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 18px;
    align-items: center;
  }
  .download-path-input {
    background: var(--field);
    border: 1px solid var(--field-border);
  }

  .search-field {
    height: 32px;
    display: grid;
    grid-template-columns: 18px 1fr;
    align-items: center;
    gap: 6px;
    background: var(--field);
    border: 1px solid var(--field-border);
    border-radius: 7px;
    padding: 0 10px;
    margin-bottom: 8px;
  }
  .search-field span {
    width: 12px;
    height: 12px;
    border: 1.5px solid var(--text-muted);
    border-radius: 999px;
    position: relative;
  }
  .search-field span::after {
    content: '';
    position: absolute;
    right: -4px;
    bottom: -3px;
    width: 6px;
    height: 1.5px;
    background: var(--text-muted);
    transform: rotate(45deg);
    border-radius: 1px;
  }
  .search-field input {
    width: 100%;
    min-height: 28px;
    padding: 0;
    border-radius: 0;
    background: transparent;
  }

  .applications-table {
    width: 100%;
    height: 100%;
    border-collapse: collapse;
    color: var(--text);
    font-size: 15px;
  }
  .applications-table-wrap {
    height: 406px;
    overflow: auto;
  }
  .applications-table th,
  .applications-table td {
    height: 30px;
    padding: 4px 12px;
    text-align: left;
    font-weight: 400;
  }
  .applications-table th {
    border-bottom: 1px solid rgba(218,221,244,0.62);
    color: var(--text);
  }
  .applications-table th:first-child {
    width: 50%;
  }
  .applications-table th + th,
  .applications-table td + td {
    border-left: 1px solid rgba(218,221,244,0.3);
  }
  .file-icon,
  .action-icon {
    display: inline-flex;
    width: 15px;
    height: 15px;
    margin-right: 10px;
    vertical-align: -2px;
    border-radius: 2px;
    background: #f2f2f2;
    position: relative;
  }
  .action-icon.save {
    background: #b7e45a;
    clip-path: polygon(35% 0, 65% 0, 65% 46%, 90% 46%, 50% 100%, 10% 46%, 35% 46%);
  }
  .action-icon.file {
    border-radius: 999px;
    background: transparent;
    border: 2px double #d5d6d3;
  }
  .action-icon.handler {
    background: #f2f2f2;
  }
  .file-handling-title {
    color: var(--text) !important;
    margin: 6px 0 8px !important;
  }

  .updates-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 194px;
    gap: 18px;
  }
  .updates-grid p {
    color: var(--text);
    margin-bottom: 14px;
  }
  .update-status {
    margin-bottom: 0 !important;
  }
  .updates-actions {
    display: grid;
    gap: 8px;
    align-content: start;
  }
  .update-policy-box {
    margin-top: 44px;
    background: var(--field);
    border-radius: 4px;
    padding: 12px 10px;
  }
  .update-policy-box p {
    margin: -30px 0 6px;
    color: var(--text);
  }

  .network-settings-row {
    width: 100%;
    min-height: 53px;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    margin-top: 8px;
    padding: 0 16px;
    border: 1px solid rgba(218,221,244,0.62);
    border-radius: 8px;
    color: var(--text);
    background: transparent;
    font: inherit;
    font-size: 15px;
    cursor: pointer;
    text-align: left;
  }
  .network-settings-row:hover {
    background: var(--surface-hover);
  }
  .chevron {
    font-size: 30px;
    line-height: 1;
  }

  .settings-toast {
    position: fixed;
    right: 22px;
    bottom: 22px;
    z-index: 1000;
    max-width: min(360px, calc(100vw - 44px));
    padding: 10px 14px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--accent) 18%, #242222 82%);
    color: var(--text);
    border: 1px solid var(--border);
    box-shadow: 0 12px 28px rgba(0,0,0,0.28);
    opacity: 0;
    transform: translateY(8px);
    pointer-events: none;
    transition: opacity 0.16s ease, transform 0.16s ease;
  }
  .settings-toast.show {
    opacity: 1;
    transform: translateY(0);
  }

  /* ===== APPEARANCE PAGE ===== */
  .appearance-page {
    color: var(--text);
    padding-bottom: 6px;
  }
  .appearance-section {
    margin-bottom: 32px;
  }
  .appearance-section > h2 {
    font-size: 24px;
    margin-bottom: 14px;
  }
  .appearance-panel {
    padding: 30px;
  }
  .appearance-block + .appearance-block {
    margin-top: 22px;
  }
  .appearance-block > h3 {
    color: var(--text-dim);
    font-size: 15px;
    line-height: 1.3;
    margin: 0 0 2px;
  }
  .appearance-block > p {
    color: var(--text-dim);
    font-size: 15px;
    margin: 0 0 8px;
  }
  .appearance-page .cb-list {
    background: transparent;
    border: 0;
    border-radius: 0;
    padding: 0;
    overflow: visible;
  }
  .appearance-page .cb-row {
    gap: 8px;
    min-height: 28px;
    padding: 4px 0;
  }
  .appearance-page .cb-row:hover {
    background: transparent;
  }
  .appearance-page .cb-track {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    border-color: rgba(218,221,244,0.72);
    background: #262631;
  }
  .appearance-page .cb-input:checked + .cb-track {
    background: var(--accent);
    border-color: var(--accent);
  }
  .appearance-page .cb-label {
    font-size: 15px;
    line-height: 1.25;
  }
  .appearance-page .cb-row.indented {
    margin-left: 23px;
  }
  .appearance-page .dependent-row.disabled .cb-label,
  .appearance-page [data-dependent-on].disabled label,
  .appearance-page [data-dependent-on].disabled {
    color: var(--text-muted);
  }
  .browser-layout-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 26px;
    margin: 6px 0 18px;
  }
  .browser-layout-card {
    appearance: none;
    border: 0;
    background: transparent;
    color: var(--text);
    cursor: pointer;
    display: grid;
    gap: 8px;
    padding: 0;
    text-align: left;
    font: inherit;
  }
  .layout-preview {
    height: 178px;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    display: block;
    background:
      linear-gradient(180deg, rgba(255,129,186,0.95), rgba(252,178,175,0.8) 30%, transparent 31%),
      linear-gradient(145deg, #28356f 0 20%, #64416f 21% 34%, #c16b88 35% 47%, #24305f 48% 64%, #4563a1 65% 100%);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12);
  }
  .browser-layout-card.active .layout-preview {
    box-shadow: inset 0 0 0 3px var(--accent);
  }
  .layout-mountain {
    position: absolute;
    bottom: 0;
    width: 78%;
    height: 72%;
    background: linear-gradient(135deg, #51366c, #f08a9e 42%, #2d3468 43%, #1e2855 100%);
    clip-path: polygon(0 100%, 34% 18%, 50% 48%, 67% 8%, 100% 100%);
    opacity: 0.9;
  }
  .layout-mountain.m1 {
    left: -14%;
  }
  .layout-mountain.m2 {
    right: -16%;
    transform: scaleX(-1);
    opacity: 0.68;
  }
  .layout-window {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 70%;
    height: 70%;
    border-radius: 4px 0 0 0;
    background: #f8f7f6;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.12);
    overflow: hidden;
  }
  .layout-toolbar {
    display: block;
    height: 15px;
    background: #ece7e7;
    border-bottom: 1px solid #ded9d9;
  }
  .layout-sidebar {
    position: absolute;
    inset: 15px auto 0 0;
    width: 45%;
    background: #efe8e8;
    border-right: 1px solid #ded9d9;
    padding: 12px 9px;
    display: grid;
    align-content: start;
    gap: 8px;
  }
  .layout-sidebar span {
    display: block;
    height: 7px;
    border-radius: 3px;
    background: #c6bbbb;
  }
  .layout-content {
    position: absolute;
    inset: 15px 0 0 45%;
    background: #fbfbfa;
  }
  .sidebar-toolbar .layout-window {
    width: 70%;
  }
  .sidebar-toolbar .layout-sidebar {
    width: 38%;
  }
  .sidebar-toolbar .layout-content {
    left: 38%;
  }
  .collapsed-sidebar .layout-sidebar {
    width: 18px;
    padding-inline: 5px;
  }
  .collapsed-sidebar .layout-content {
    left: 18px;
  }
  .layout-label {
    color: var(--text);
    font-size: 15px;
    font-weight: 700;
  }
  .appearance-inline-row {
    gap: 12px;
    margin-top: 8px;
  }
  .appearance-inline-row label {
    color: var(--text);
    font-size: 15px;
  }
  .appearance-inline-row select {
    min-width: 120px;
    background: var(--control);
    border: 0;
    border-radius: 7px;
    color: var(--text);
    font-weight: 700;
  }
  .appearance-inline-row.disabled select {
    opacity: 0.45;
  }

  /* ===== SHORTCUTS PAGE ===== */
  .shortcuts-page {
    color: var(--text);
  }
  .shortcuts-page > h1 {
    font-size: 24px;
    line-height: 1.2;
    font-weight: 700;
    margin: 4px 0 14px;
    letter-spacing: 0;
  }
  .shortcuts-panel {
    padding: 28px 30px 34px;
  }
  .shortcuts-intro {
    margin-bottom: 32px;
  }
  .shortcuts-intro h2 {
    color: var(--text-dim);
    font-size: 15px;
    line-height: 1.3;
    margin: 0 0 3px;
  }
  .shortcuts-intro p {
    color: var(--text-dim);
    max-width: 460px;
    margin: 0 0 8px;
    font-size: 15px;
    line-height: 1.25;
  }
  .shortcut-reset-btn {
    min-width: 151px;
  }
  .shortcut-section {
    margin-top: 34px;
  }
  .shortcut-section h2 {
    color: var(--text-dim);
    font-size: 15px;
    line-height: 1.3;
    font-weight: 700;
    margin: 0 0 10px;
  }
  .shortcut-section-divider {
    height: 1px;
    background: rgba(255,255,255,0.08);
    margin-bottom: 14px;
  }
  .shortcut-rows {
    display: grid;
    gap: 9px;
  }
  .shortcut-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 180px;
    gap: 18px;
    align-items: center;
    min-height: 31px;
    color: var(--text-dim);
    font-size: 14px;
    line-height: 1.25;
  }
  .shortcut-row > span {
    min-width: 0;
  }
  .shortcut-input {
    width: 180px;
    min-width: 0;
    min-height: 30px;
    border-radius: 5px;
    border: 1px solid rgba(218, 183, 168, 0.24);
    background: #211d1c;
    color: var(--text);
    padding: 5px 8px;
    font: inherit;
    font-size: 14px;
    outline: none;
  }
  .shortcut-input::placeholder {
    color: var(--text-muted);
  }
  .shortcut-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 45%, transparent);
  }
  .shortcut-input[value="Not set"],
  .shortcut-input.is-empty {
    color: var(--text-muted);
  }

  @media (max-width: 900px) {
    .layout {
      grid-template-columns: 1fr;
    }
    nav.sidenav {
      display: none;
    }
    main {
      padding: 28px 18px 80px;
    }
    .category-pane {
      max-width: none;
    }
    .zen-panel {
      padding: 22px 18px;
    }
    .setting-action-row,
    .split-checkbox-row,
    .updates-grid,
    .download-path-control {
      grid-template-columns: 1fr;
    }
    .appearance-choice-grid {
      grid-template-columns: 1fr;
    }
    .browser-layout-grid {
      grid-template-columns: 1fr;
    }
    .layout-preview {
      height: 150px;
    }
    .shortcut-row {
      grid-template-columns: 1fr;
      gap: 6px;
    }
    .shortcut-input {
      width: 100%;
    }
    .fonts-row,
    .language-row,
    .zoom-row {
      align-items: stretch;
      flex-direction: column;
    }
    .fonts-row select:first-of-type,
    .language-row select {
      min-width: 0;
      width: 100%;
    }
  }
`;
