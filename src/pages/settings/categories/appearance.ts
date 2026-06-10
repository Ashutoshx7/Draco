import { type Category, checkbox, checkboxList, select } from '../category';

function section(title: string, content: string): string {
  return `
    <section class="zen-section appearance-section">
      <h2>${title}</h2>
      <div class="zen-panel appearance-panel">${content}</div>
    </section>
  `;
}

function block(title: string, description: string, content: string): string {
  return `
    <div class="appearance-block">
      <h3>${title}</h3>
      <p>${description}</p>
      ${content}
    </div>
  `;
}

function layoutCard(value: string, label: string, variant: string): string {
  return `
    <button type="button" class="browser-layout-card ${variant}" data-pref="browserLayout" data-pref-type="string" data-value="${value}">
      <span class="layout-preview">
        <span class="layout-mountain m1"></span>
        <span class="layout-mountain m2"></span>
        <span class="layout-window">
          <span class="layout-toolbar"></span>
          <span class="layout-sidebar">
            <span></span><span></span><span></span><span></span>
          </span>
          <span class="layout-content"></span>
        </span>
      </span>
      <span class="layout-label">${label}</span>
    </button>
  `;
}

export const appearance: Category = {
  id: 'appearance',
  label: 'Appearance',
  icon: '<circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0 0 20 5 5 0 0 0 0-10 5 5 0 0 1 0-10z"/>',

  render: () => `
    <div class="appearance-page">
      ${section('Sidebar and tabs layout',
        block('Browser Layout', 'Choose the layout that suits you best',
          `<div class="browser-layout-grid">
            ${layoutCard('only-sidebar', 'Only Sidebar', 'only-sidebar')}
            ${layoutCard('sidebar-toolbar', 'Sidebar and Top Toolbar', 'sidebar-toolbar')}
            ${layoutCard('collapsed-sidebar', 'Collapsed Sidebar', 'collapsed-sidebar')}
          </div>`
        ) +
        block('Vertical Tabs', 'Manage your tabs in a vertical layout',
          checkboxList(
            checkbox('showNewTabButton', 'Show New Tab Button on Tab List') +
            `<label class="cb-row indented dependent-row" data-dependent-on="showNewTabButton">
              <input type="checkbox" class="cb-input" data-pref="newTabButtonTop" data-pref-type="bool" />
              <span class="cb-track"></span>
              <span class="cb-body"><span class="cb-label">Move the new tab button to the top</span></span>
            </label>`
          )
        )
      )}

      ${section('Theme Settings',
        block('Show in compact view', 'Only show the toolbars you use!',
          checkboxList(
            `<label class="cb-row indented">
              <input type="checkbox" class="cb-input" data-pref="compactToolbarPopup" data-pref-type="bool" />
              <span class="cb-track"></span>
              <span class="cb-body"><span class="cb-label">Briefly make the toolbar popup when switching or opening new tabs in compact mode</span></span>
            </label>`
          )
        )
      )}

      ${section('Glance',
        block('General settings for glance', 'Get a quick overview of your links without opening them in a new tab',
          checkboxList(checkbox('glanceEnabled', 'Enable Glance')) +
          `<div class="inline-form-row appearance-inline-row" data-dependent-on="glanceEnabled">
            <label>Trigger method</label>
            ${select('glanceTrigger', [
              { value: 'alt-click', label: 'Alt + Click' },
              { value: 'ctrl-click', label: 'Ctrl + Click' },
              { value: 'shift-click', label: 'Shift + Click' },
              { value: 'meta-click', label: 'Meta + Click' },
            ])}
          </div>`
        )
      )}

      ${section('Zen URL Bar',
        block('General settings for the URL bar', 'Customize the URL bar to your liking',
          `<div class="inline-form-row appearance-inline-row">
            <label>Behavior</label>
            ${select('urlBarBehavior', [
              { value: 'floating-typing', label: 'Floating only when typing' },
              { value: 'always-floating', label: 'Always floating' },
              { value: 'never-floating', label: 'Never floating' },
            ])}
          </div>`
        )
      )}
    </div>
  `,
};
