import { type Category } from '../category';
import { SHORTCUT_GROUPS, shortcutPrefKey } from '../shortcutDefaults';

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function shortcutInput(id: string, defaultValue: string): string {
  const value = escapeAttr(defaultValue);
  return `
    <input
      type="text"
      class="shortcut-input"
      data-pref="${shortcutPrefKey(id)}"
      data-pref-type="string"
      data-shortcut-input="true"
      data-default="${value}"
      value="${value}"
      placeholder="Not set"
      spellcheck="false"
    />
  `;
}

function shortcutGroup(title: string, items: readonly { id: string; label: string; defaultValue: string }[]): string {
  return `
    <section class="shortcut-section">
      <h2>${title}</h2>
      <div class="shortcut-section-divider"></div>
      <div class="shortcut-rows">
        ${items.map(item => `
          <label class="shortcut-row">
            <span>${item.label}</span>
            ${shortcutInput(item.id, item.defaultValue)}
          </label>
        `).join('')}
      </div>
    </section>
  `;
}

export const shortcuts: Category = {
  id: 'shortcuts',
  label: 'Shortcuts',
  icon: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12"/>',

  render: () => `
    <div class="shortcuts-page">
      <h1>Keyboard Shortcuts</h1>
      <div class="zen-panel shortcuts-panel">
        <div class="shortcuts-intro">
          <h2>Customize your keyboard shortcuts</h2>
          <p>Change the default keyboard shortcuts to your liking and improve your browsing experience</p>
          <button type="button" class="zen-button shortcut-reset-btn" data-action="reset-shortcuts">Reset to Default</button>
        </div>
        ${SHORTCUT_GROUPS.map(group => shortcutGroup(group.title, group.items)).join('')}
      </div>
    </div>
  `,
};
