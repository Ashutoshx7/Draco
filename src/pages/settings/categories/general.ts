import { type Category, checkbox, checkboxList, select } from '../category';

function button(label: string, action: string, extraClass = ''): string {
  return `<button type="button" class="zen-button ${extraClass}" data-action="${action}">${label}</button>`;
}

function textInput(pref: string, value: string, className = ''): string {
  return `<input type="text" class="zen-text-input ${className}" data-pref="${pref}" data-pref-type="string" value="${value}" spellcheck="false" />`;
}

function radio(pref: string, value: string, label: string): string {
  return `
    <label class="radio-row">
      <input type="radio" class="radio-input" name="${pref}" value="${value}" data-pref="${pref}" data-pref-type="string" />
      <span class="radio-track"></span>
      <span>${label}</span>
    </label>
  `;
}

function textLink(label: string, action: string): string {
  return `<button type="button" class="text-link" data-action="${action}">${label}</button>`;
}

function choiceCard(value: string, label: string, mode: 'auto' | 'light' | 'dark'): string {
  return `
    <button type="button" class="appearance-choice-card" data-pref="websiteAppearance" data-pref-type="string" data-value="${value}" title="${label}">
      <span class="browser-preview ${mode}">
        <span class="preview-top"></span>
        <span class="preview-line wide"></span>
        <span class="preview-line"></span>
        <span class="preview-line short"></span>
      </span>
      <span class="appearance-choice-label">${label}</span>
    </button>
  `;
}

function section(title: string, content: string, className = ''): string {
  return `
    <section class="zen-section ${className}">
      <h2>${title}</h2>
      ${content}
    </section>
  `;
}

function panel(content: string, className = ''): string {
  return `<div class="zen-panel ${className}">${content}</div>`;
}

function block(title: string, content: string, description?: string): string {
  const desc = description ? `<p class="zen-description">${description}</p>` : '';
  return `
    <div class="zen-block">
      <h3>${title}</h3>
      ${desc}
      ${content}
    </div>
  `;
}

function applicationRows(): string {
  const rows = [
    ['AV1 Image File (AVIF)', 'Open in Draco', 'file'],
    ['Extensible Markup Language (XML)', 'Save File', 'save'],
    ['JPEG XL Image (JXL)', 'Open in Draco', 'file'],
    ['mailto', 'Use Url Handler Script (default)', 'handler'],
    ['Portable Document Format (PDF)', 'Open in Draco', 'file'],
    ['Scalable Vector Graphics (SVG)', 'Save File', 'save'],
    ['WebP Image', 'Open in Draco', 'file'],
  ];

  return rows.map(([type, action, icon]) => `
    <tr data-filter="${type} ${action}">
      <td><span class="file-icon ${icon}"></span>${type}</td>
      <td><span class="action-icon ${icon}"></span>${action}</td>
    </tr>
  `).join('');
}

function languageRows(): string {
  const languages = ['Albanian', 'Arabic', 'Azerbaijani', 'Bangla'];
  return languages.map(language => `
    <div class="language-download-row" data-filter="${language}">
      <span>${language}</span>
      ${button('Download', 'download-language', 'download-btn')}
    </div>
  `).join('');
}

export const general: Category = {
  id: 'general',
  label: 'General',
  icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',

  render: () => `
    <div class="general-page">
      <h1>General</h1>

      ${section('', panel(
        block('Startup',
          checkboxList(
            checkbox('restoreSession', 'Open previous windows and tabs') +
            checkbox('continueWhereLeftOff', 'Continue where you left off') +
            checkbox('defaultBrowserCheck', 'Always check if Draco is your default browser')
          ) +
          `<div class="default-browser-callout">
            <span>Draco is not your default browser</span>
            ${button('Make Default...', 'make-default', 'accent')}
          </div>`
        ) +
        block('Import Browser Data',
          `<div class="setting-action-row">
            <p>Import bookmarks, passwords, history, and autofill data into Draco.</p>
            ${button('Import Data', 'import-browser-data')}
          </div>`
        ) +
        block('Tabs',
          checkboxList(
            checkbox('ctrlTabRecentOrder', 'Ctrl+Tab cycles through tabs in recently used order') +
            checkbox('openLinksInNewTab', 'Open links in tabs instead of new windows') +
            checkbox('openAppLinksNextToTab', 'Open links from apps next to your active tab') +
            checkbox('switchToNewTab', 'When you open a link, image or media in a new tab, switch to it immediately') +
            checkbox('confirmMultiTabClose', 'Ask before closing multiple tabs') +
            checkbox('confirmQuit', 'Ask before quitting with Ctrl+Q') +
            `<div class="split-checkbox-row">
              ${checkbox('containerTabs', `Enable Container Tabs ${textLink('Learn more', 'learn-container-tabs')}`)}
              ${button('Settings...', 'container-settings')}
            </div>`
          )
        )
      ), 'no-title')}

      ${section('Language and Appearance', panel(
        block('Website appearance',
          `<div class="appearance-choice-grid">
            ${choiceCard('automatic', 'Automatic', 'auto')}
            ${choiceCard('light', 'Light', 'light')}
            ${choiceCard('dark', 'Dark', 'dark')}
          </div>`,
          'Some websites adapt their color scheme based on your preferences. Choose which color scheme you would like to use for those sites.'
        ) +
        block('Contrast Control',
          `<div class="radio-list">
            ${radio('contrastControl', 'automatic', 'Automatic (use system settings)')}
            ${radio('contrastControl', 'off', 'Off')}
            ${radio('contrastControl', 'custom', 'Custom')}
          </div>
          ${button('Manage Colors...', 'manage-colors', 'muted manage-colors')}`,
          'Websites have a variety of foreground and background colors. Configure Draco to use the same colors across websites for improved readability.'
        ) +
        block('Fonts',
          `<div class="inline-form-row fonts-row">
            <label>Default font</label>
            ${select('defaultFont', [
              { value: 'default-noto-serif', label: 'Default (Noto Serif)' },
              { value: 'serif', label: 'Serif' },
              { value: 'sans-serif', label: 'Sans Serif' },
              { value: 'monospace', label: 'Monospace' },
            ])}
            <label>Size</label>
            ${select('fontSize', [
              { value: '12', label: '12' },
              { value: '14', label: '14' },
              { value: '16', label: '16' },
              { value: '18', label: '18' },
              { value: '20', label: '20' },
              { value: '24', label: '24' },
            ])}
            ${button('Advanced...', 'advanced-fonts')}
          </div>`
        ) +
        block('Zoom',
          `<div class="inline-form-row zoom-row">
            <label>Default zoom</label>
            ${select('defaultZoom', [
              { value: '67', label: '67%' },
              { value: '75', label: '75%' },
              { value: '80', label: '80%' },
              { value: '90', label: '90%' },
              { value: '100', label: '100%' },
              { value: '110', label: '110%' },
              { value: '125', label: '125%' },
              { value: '150', label: '150%' },
              { value: '175', label: '175%' },
              { value: '200', label: '200%' },
              { value: '250', label: '250%' },
              { value: '300', label: '300%' },
            ])}
          </div>
          ${checkboxList(checkbox('zoomTextOnly', 'Zoom text only'))}`
        ) +
        `<div class="zen-divider"></div>` +
        block('Language',
          `<p class="language-copy">Choose the languages used to display menus, messages, and notifications from Draco.</p>
          <div class="inline-form-row language-row">
            ${select('language', [
              { value: 'en-US', label: 'English (US)' },
              { value: 'en-GB', label: 'English (UK)' },
              { value: 'hi-IN', label: 'Hindi' },
              { value: 'es-ES', label: 'Spanish' },
            ])}
            ${button('Set Alternatives...', 'language-alternatives')}
          </div>
          <div class="setting-action-row language-page-row">
            <p>Choose your preferred language for displaying pages</p>
            ${button('Choose...', 'page-language')}
          </div>
          <p class="privacy-warning">Changing the default language could make it easier for Websites to track you.</p>
          ${checkboxList(checkbox('spellCheck', 'Check your spelling as you type'))}`
        ) +
        block('Translations',
          `<div class="setting-action-row">
            <p>Set your language and site translation preferences and manage languages downloaded for offline translation.</p>
            ${button('Settings...', 'translation-settings')}
          </div>
          <div class="download-language-box">
            <div class="download-language-header">
              <span>Download languages for offline translation</span>
              ${button('Download all', 'download-all-languages', 'download-btn')}
            </div>
            ${languageRows()}
          </div>`
        )
      ))}

      ${section('Files and Applications', panel(
        block('Downloads',
          `<div class="download-path-row">
            <label>Save files to</label>
            <div class="download-path-control">
              ${textInput('downloadPath', 'Downloads', 'download-path-input')}
              ${button('Browse...', 'choose-download-folder', 'ghost')}
            </div>
          </div>
          ${checkboxList(
            checkbox('alwaysAskDownload', 'Always ask you where to save files') +
            checkbox('deletePrivateDownloads', 'Delete files downloaded in private browsing when all private windows are closed')
          )}`
        ) +
        block('Applications',
          `<p class="zen-description tight">Choose how Draco handles the files you download from the web or the applications you use while browsing.</p>
          <div class="search-field">
            <span></span>
            <input type="text" data-table-filter="applications-table" placeholder="Search file types or applications" />
          </div>
          <div class="applications-table-wrap">
            <table id="applications-table" class="applications-table">
              <thead>
                <tr><th>Content Type</th><th>Action</th></tr>
              </thead>
              <tbody>${applicationRows()}</tbody>
            </table>
          </div>
          <p class="file-handling-title">What should Draco do with other files?</p>
          <div class="radio-list">
            ${radio('fileHandling', 'save', 'Save files')}
            ${radio('fileHandling', 'ask', 'Ask whether to open or save files')}
          </div>`
        ) +
        block('Digital Rights Management (DRM) Content',
          checkboxList(checkbox('drmContent', `Play DRM-controlled content ${textLink('Learn more', 'learn-drm')}`))
        )
      ))}

      ${section('Draco Updates', panel(
        `<div class="updates-grid">
          <div>
            <p>Keep Draco up to date for the best performance, stability, and security.</p>
            <p>Version 1.0.0 (64-bit) ${textLink('What\'s new', 'update-notes')}</p>
            <p class="update-status">Draco is being updated by another instance</p>
          </div>
          <div class="updates-actions">
            ${button('Show Update History...', 'update-history')}
            ${button('Check for updates', 'check-updates', 'muted')}
          </div>
        </div>
        <div class="update-policy-box">
          <p>Allow Draco to</p>
          <div class="radio-list">
            ${radio('updatePolicy', 'auto', 'Automatically install updates (recommended)')}
            ${radio('updatePolicy', 'manual', 'Check for updates but let you choose to install them')}
          </div>
        </div>`
      ))}

      ${section('Performance', panel(
        checkboxList(checkbox('recommendedPerformance', `Use recommended performance settings ${textLink('Learn more', 'learn-performance')}`))
      ), 'compact-section')}

      ${section('Browsing', panel(
        checkboxList(
          checkbox('autoscrolling', 'Use autoscrolling') +
          checkbox('smoothScrolling', 'Use smooth scrolling') +
          checkbox('alwaysShowScrollbars', 'Always show scrollbars') +
          checkbox('cursorNavigation', 'Always use the cursor keys to navigate within pages') +
          checkbox('alwaysUnderlineLinks', 'Always underline links') +
          checkbox('findAsYouType', 'Search for text when you start typing') +
          checkbox('pictureInPicture', `Enable Picture-in-Picture video controls ${textLink('Learn more', 'learn-pip')}`) +
          checkbox('mediaKeysControl', `Control media via keyboard, headset, or virtual interface ${textLink('Learn more', 'learn-media-keys')}`) +
          checkbox('recommendExtensions', `Recommend extensions as you browse ${textLink('Learn more', 'learn-extensions')}`) +
          checkbox('recommendFeatures', `Recommend features as you browse ${textLink('Learn more', 'learn-features')}`) +
          checkbox('linkPreviews', 'Enable link previews', 'See the page title, description, and more when you use the shortcut or right-click on a link.') +
          `<label class="cb-row indented dependent-row" data-dependent-on="linkPreviews">
            <input type="checkbox" class="cb-input" data-pref="linkPreviewAi" data-pref-type="bool" />
            <span class="cb-track"></span>
            <span class="cb-body"><span class="cb-label">Allow AI to read the beginning of the page and generate key points</span></span>
          </label>
          <label class="cb-row indented dependent-row" data-dependent-on="linkPreviews">
            <input type="checkbox" class="cb-input" data-pref="linkPreviewShortcut" data-pref-type="bool" />
            <span class="cb-track"></span>
            <span class="cb-body"><span class="cb-label">Shortcut: Click and hold the link for 1 second (long press)</span></span>
          </label>`
        )
      ))}

      ${section('Network Settings', panel(
        `<p>Configure how Draco connects to the internet. ${textLink('Learn more', 'learn-network')}</p>
        <button type="button" class="network-settings-row" data-action="network-settings">
          <span>Settings...</span>
          <span class="chevron">&rsaquo;</span>
        </button>`
      ))}
    </div>
  `,
};
