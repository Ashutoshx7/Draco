import { type Category, row, subcategory, select } from '../category';

export const search: Category = {
  id: 'search',
  label: 'Search',
  icon: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',

  render: () => `
    <h1>Search</h1>
    <p class="category-sub">Default search engine and bang shortcuts.</p>

    ${subcategory('Engine',
      row({
        label: 'Default search engine',
        hint: 'Used when you type a query without a URL',
        control: select('searchEngine', [
          { value: 'duckduckgo', label: 'DuckDuckGo' },
          { value: 'google',     label: 'Google' },
          { value: 'bing',       label: 'Bing' },
          { value: 'brave',      label: 'Brave Search' },
        ]),
      })
    )}

    ${subcategory('Bangs',
      `<div class="row column">
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
      </div>`
    )}
  `,
};
