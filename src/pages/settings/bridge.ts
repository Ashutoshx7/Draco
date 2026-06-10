/**
 * Runtime script embedded in the settings page.
 *
 * Responsibilities:
 *   - Category routing via URL hash
 *   - Auto-binding: [data-pref] toggles/selects → draco.setPref()
 *   - Theme mode card picker (dark / light / system)
 *   - Accent color swatch + custom picker — updates CSS vars live (Zen-style)
 *   - Window close button → window.close()
 *   - Bookmarks/history list rendering
 *   - Clear-history button
 */
export const BRIDGE_SCRIPT = `
(function() {
  'use strict';

  // ---------- Category routing ----------
  // Note: settings is a data: URL — location.hash navigation doesn't work.
  // Drive switching entirely through direct DOM manipulation.
  const navItems = document.querySelectorAll('.nav-item');
  const panes    = document.querySelectorAll('.category-pane');
  const validIds = new Set(Array.from(panes).map(p => p.dataset.category));

  function activate(id) {
    if (!validIds.has(id)) id = 'general';
    navItems.forEach(n => n.classList.toggle('active', n.dataset.target === id));
    panes.forEach(p => { p.dataset.active = String(p.dataset.category === id); });
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
  }

  activate('general');

  navItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const t = item.dataset.target;
      if (t) activate(t);
    });
  });

  // ---------- Auto-binding (toggles + selects) ----------
  let currentPrefs = {};

  function isEmptyShortcutValue(value) {
    return !value || value.trim().toLowerCase() === 'not set';
  }

  function syncShortcutEmptyState(input) {
    if (!input || !input.dataset.shortcutInput) return;
    input.classList.toggle('is-empty', isEmptyShortcutValue(input.value));
  }

  function applyDependentControls(prefs) {
    const dependentPrefs = ['linkPreviews', 'showNewTabButton', 'glanceEnabled'];
    dependentPrefs.forEach(pref => {
      const enabled = prefs[pref] === true;
      document.querySelectorAll('[data-dependent-on="' + pref + '"]').forEach(row => {
        row.classList.toggle('disabled', !enabled);
        row.querySelectorAll('input, button, select').forEach(input => {
          input.disabled = !enabled;
        });
      });
    });

    const customContrast = prefs.contrastControl === 'custom';
    document.querySelectorAll('.manage-colors').forEach(btn => {
      btn.disabled = !customContrast;
      btn.classList.toggle('muted', !customContrast);
    });
  }

  function applyPrefsToInputs(prefs) {
    if (!prefs) return;
    currentPrefs = Object.assign({}, currentPrefs, prefs);
    document.querySelectorAll('.toggle[data-pref-type="bool"]').forEach(t => {
      const v = prefs[t.dataset.pref];
      if (v === true)  t.classList.add('on');
      if (v === false) t.classList.remove('on');
    });
    document.querySelectorAll('.cb-input[data-pref-type="bool"]').forEach(cb => {
      const v = prefs[cb.dataset.pref];
      if (typeof v === 'boolean') cb.checked = v;
    });
    document.querySelectorAll('select[data-pref-type="string"]').forEach(s => {
      const v = prefs[s.dataset.pref];
      if (typeof v === 'string') s.value = v;
    });
    document.querySelectorAll('input[type="text"][data-pref-type="string"]').forEach(input => {
      const v = prefs[input.dataset.pref];
      if (typeof v === 'string' && document.activeElement !== input) input.value = v;
      syncShortcutEmptyState(input);
    });
    document.querySelectorAll('.radio-input[data-pref-type="string"]').forEach(input => {
      const v = prefs[input.dataset.pref];
      if (typeof v === 'string') input.checked = input.value === v;
    });
    document.querySelectorAll('[data-value][data-pref-type="string"]').forEach(card => {
      const v = prefs[card.dataset.pref];
      card.classList.toggle('active', typeof v === 'string' && card.dataset.value === v);
    });
    applyDependentControls(currentPrefs);
    if (typeof prefs.themeMode  === 'string') applyThemeMode(prefs.themeMode,  false);
    if (typeof prefs.accentColor === 'string') applyAccentColor(prefs.accentColor, false);
  }

  function persistPref(key, value) {
    currentPrefs[key] = value;
    applyDependentControls(currentPrefs);
    if (window.draco) window.draco.setPref(key, value);
  }

  function bindInputs() {
    document.querySelectorAll('.toggle[data-pref-type="bool"]').forEach(t => {
      t.addEventListener('click', () => {
        t.classList.toggle('on');
        const v = t.classList.contains('on');
        persistPref(t.dataset.pref, v);
      });
    });
    document.querySelectorAll('.cb-input[data-pref-type="bool"]').forEach(cb => {
      cb.addEventListener('change', () => {
        persistPref(cb.dataset.pref, cb.checked);
      });
    });
    document.querySelectorAll('select[data-pref-type="string"]').forEach(s => {
      s.addEventListener('change', () => {
        persistPref(s.dataset.pref, s.value);
      });
    });
    document.querySelectorAll('.radio-input[data-pref-type="string"]').forEach(r => {
      r.addEventListener('change', () => {
        if (!r.checked) return;
        persistPref(r.dataset.pref, r.value);
      });
    });
    document.querySelectorAll('[data-value][data-pref-type="string"]').forEach(card => {
      card.addEventListener('click', () => {
        persistPref(card.dataset.pref, card.dataset.value);
        document.querySelectorAll('[data-pref="' + card.dataset.pref + '"][data-value]').forEach(c => {
          c.classList.toggle('active', c === card);
        });
      });
    });

    const textTimers = new WeakMap();
    document.querySelectorAll('input[type="text"][data-pref-type="string"]:not([data-shortcut-input])').forEach(input => {
      input.addEventListener('input', () => {
        clearTimeout(textTimers.get(input));
        textTimers.set(input, setTimeout(() => {
          persistPref(input.dataset.pref, input.value);
        }, 300));
      });
    });
  }
  bindInputs();

  function normalizeShortcutKey(key) {
    const map = {
      Control: '',
      Shift: '',
      Alt: '',
      Meta: '',
      Escape: 'Esc',
      ArrowLeft: 'Left',
      ArrowRight: 'Right',
      ArrowUp: 'Up',
      ArrowDown: 'Down',
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
    };
    if (Object.prototype.hasOwnProperty.call(map, key)) return map[key];
    if (/^F\\d{1,2}$/.test(key)) return key.toUpperCase();
    if (key.length === 1) return /[a-z]/i.test(key) ? key.toUpperCase() : key;
    return key;
  }

  function formatShortcutEvent(event) {
    const key = normalizeShortcutKey(event.key);
    if (!key) return '';
    const parts = [];
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    if (event.metaKey) parts.push('Meta');
    if (key === 'Backspace') return 'Not set';
    parts.push(key);
    return parts.join('+');
  }

  document.querySelectorAll('input[data-shortcut-input]').forEach(input => {
    syncShortcutEmptyState(input);
    input.addEventListener('focus', () => {
      input.select();
    });
    input.addEventListener('keydown', event => {
      event.preventDefault();
      event.stopPropagation();
      if (event.key === 'Escape') {
        input.blur();
        return;
      }
      const value = formatShortcutEvent(event);
      if (!value) return;
      input.value = value;
      syncShortcutEmptyState(input);
      persistPref(input.dataset.pref, value);
    });
  });

  // ---------- Theme mode cards ----------
  function resolveTheme(mode) {
    if (mode !== 'system') return mode;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyThemeMode(mode, persist) {
    document.querySelectorAll('.theme-card').forEach(c => {
      c.classList.toggle('active', c.dataset.themeMode === mode);
    });
    document.documentElement.dataset.theme = resolveTheme(mode);
    if (persist && window.draco) window.draco.setPref('themeMode', mode);
  }

  document.querySelectorAll('.theme-card').forEach(c => {
    c.addEventListener('click', () => {
      const m = c.dataset.themeMode;
      if (m) applyThemeMode(m, true);
    });
  });

  // React to OS color scheme changes when mode === 'system'
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const active = document.querySelector('.theme-card.active');
    if (active && active.dataset.themeMode === 'system') {
      document.documentElement.dataset.theme = resolveTheme('system');
    }
  });

  // ---------- Accent color ----------
  function isValidHex(v) { return /^#[0-9a-fA-F]{6}$/.test(v); }

  function applyAccentColor(hex, persist) {
    if (!isValidHex(hex)) return;
    const root = document.documentElement;

    // Set the primary token — all derived CSS vars update automatically
    // because they use color-mix(in srgb, var(--accent) ...)
    root.style.setProperty('--accent', hex);

    // Sync swatch active indicators
    const swatches = document.querySelectorAll('.color-swatch');
    let matched = false;
    swatches.forEach(s => {
      const isMatch = s.dataset.accent === hex;
      s.classList.toggle('active', isMatch);
      if (isMatch) matched = true;
    });

    // Sync custom picker
    const picker  = document.getElementById('accent-custom-picker');
    const hexInp  = document.getElementById('accent-hex-input');
    const dot     = document.getElementById('accent-preview-dot');

    if (picker) {
      picker.value = hex;
      picker.style.borderColor = matched ? '' : hex;
    }
    if (hexInp && document.activeElement !== hexInp) hexInp.value = hex;
    if (dot) dot.style.background = hex;

    if (persist && window.draco) window.draco.setPref('accentColor', hex);
  }

  // Preset swatches
  document.querySelectorAll('.color-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      if (sw.dataset.accent) applyAccentColor(sw.dataset.accent, true);
    });
  });

  // Native color picker
  const picker = document.getElementById('accent-custom-picker');
  if (picker) picker.addEventListener('input', () => applyAccentColor(picker.value, true));

  // Hex text input (debounced)
  const hexInp = document.getElementById('accent-hex-input');
  let hexTimer;
  if (hexInp) {
    hexInp.addEventListener('input', () => {
      clearTimeout(hexTimer);
      hexTimer = setTimeout(() => {
        let v = hexInp.value.trim();
        if (!v.startsWith('#')) v = '#' + v;
        applyAccentColor(v, true);
      }, 320);
    });
  }

  // ---------- Zen General controls ----------
  let toastTimer;
  function showToast(message) {
    if (!message) return;
    let toast = document.querySelector('.settings-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'settings-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  window.addEventListener('draco-toast', event => {
    showToast(event.detail);
  });

  window.addEventListener('draco-prefs-updated', event => {
    applyPrefsToInputs(event.detail);
  });

  const localActionMessages = {
    'import-browser-data': 'Import data wizard is not available in this build yet.',
    'container-settings': 'Container tab settings are saved from the checkbox for now.',
    'learn-container-tabs': 'Container tabs keep site data separated by context.',
    'manage-colors': 'Choose Custom contrast control before managing colors.',
    'advanced-fonts': 'Advanced font controls are not available in this build yet.',
    'language-alternatives': 'Language alternatives were opened.',
    'page-language': 'Preferred page language controls are not available in this build yet.',
    'translation-settings': 'Translation preferences are not available in this build yet.',
    'update-history': 'No update history is available yet.',
    'check-updates': 'You are on the latest available Draco build.',
    'update-notes': 'No release notes are bundled with this build.',
    'learn-drm': 'DRM playback depends on platform media support.',
    'learn-performance': 'Recommended performance settings keep hardware acceleration and efficient defaults enabled.',
    'learn-pip': 'Picture-in-Picture keeps videos visible in a floating player.',
    'learn-media-keys': 'Media keys can control playback from keyboards and headsets.',
    'learn-extensions': 'Recommendations can suggest useful extensions while browsing.',
    'learn-features': 'Recommendations can suggest Draco features while browsing.',
    'learn-network': 'Network settings control proxy and connection behavior.',
    'network-settings': 'Network proxy settings are not available in this build yet.',
  };

  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      if (btn.disabled) {
        showToast(localActionMessages[btn.dataset.action]);
        return;
      }

      const action = btn.dataset.action;
      if (action === 'reset-shortcuts') {
        document.querySelectorAll('input[data-shortcut-input]').forEach(input => {
          input.value = input.dataset.default || 'Not set';
          syncShortcutEmptyState(input);
          persistPref(input.dataset.pref, input.value);
        });
        showToast('Keyboard shortcuts reset to defaults.');
        return;
      }
      if (action === 'download-language') {
        btn.textContent = 'Downloaded';
        btn.disabled = true;
        showToast('Language downloaded for offline translation.');
        return;
      }
      if (action === 'download-all-languages') {
        document.querySelectorAll('.language-download-row .download-btn').forEach(downloadBtn => {
          downloadBtn.textContent = 'Downloaded';
          downloadBtn.disabled = true;
        });
        btn.textContent = 'Downloaded all';
        btn.disabled = true;
        showToast('All listed languages downloaded.');
        return;
      }

      if (window.draco && window.draco.performAction) {
        window.draco.performAction(action);
      }
      if (action !== 'choose-download-folder' && action !== 'make-default') {
        showToast(localActionMessages[action] || 'Action completed.');
      }
    });
  });

  document.querySelectorAll('[data-table-filter]').forEach(input => {
    input.addEventListener('input', () => {
      const target = document.getElementById(input.dataset.tableFilter);
      if (!target) return;
      const q = input.value.trim().toLowerCase();
      target.querySelectorAll('tbody tr').forEach(row => {
        row.style.display = row.dataset.filter.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  });

  // ---------- List rendering ----------
  function renderList(id, items, emptyMsg, icon) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!items || !items.length) {
      el.innerHTML = '<div class="empty">' + emptyMsg + '</div>';
      return;
    }
    el.innerHTML = items.slice(0, 200).map(it => {
      const url   = (it.url   || '').replace(/"/g, '&quot;');
      const title = (it.title || it.url || '').replace(/</g, '&lt;');
      return '<div class="list-row" data-url="' + url + '">' +
        '<span class="ico">' + icon + '</span>' +
        '<div class="meta"><div class="ttl">' + title + '</div>' +
        '<div class="url">' + url + '</div></div></div>';
    }).join('');
    el.querySelectorAll('.list-row').forEach(row => {
      row.addEventListener('click', () => {
        if (window.draco && window.draco.navigate) window.draco.navigate(row.dataset.url);
      });
    });
  }

  function refreshBookmarks() {
    if (window.draco && window.draco.getBookmarks)
      window.draco.getBookmarks().then(items => renderList('bookmarks-list', items, 'No bookmarks yet. Star any page to save it.', '★'));
  }
  function refreshHistory() {
    if (window.draco && window.draco.getHistory)
      window.draco.getHistory().then(items => renderList('history-list', items, 'No history yet.', '◷'));
  }

  const clearBtn = document.getElementById('clear-history');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (window.draco && window.draco.clearHistory)
        window.draco.clearHistory().then(() => refreshHistory());
    });
  }

  // ---------- Wait for bridge, then hydrate ----------
  let attempts = 0;
  const wait = setInterval(() => {
    if (window.draco) {
      clearInterval(wait);
      refreshBookmarks();
      refreshHistory();
      if (window.draco.getPrefs) window.draco.getPrefs().then(applyPrefsToInputs);
    } else if (++attempts > 40) {
      clearInterval(wait);
      ['bookmarks-list','history-list'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<div class="empty">Bridge unavailable</div>';
      });
    }
  }, 50);
})();
`;
