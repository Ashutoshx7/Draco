import { STYLES } from './styles';
import { BRIDGE_SCRIPT } from './bridge';
import type { Category } from './category';

function wrapIcon(svgPath: string): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg>`;
}

function renderNav(categories: readonly Category[]): string {
  return `
    <nav class="sidenav">
      <div class="nav-title">Settings</div>
      ${categories.map(c => `
        <a class="nav-item" data-target="${c.id}" href="#${c.id}">
          ${wrapIcon(c.icon)}
          <span>${c.label}</span>
        </a>
      `).join('')}
    </nav>
  `;
}

function renderPanes(categories: readonly Category[]): string {
  return categories.map(c => `
    <section class="category-pane" data-category="${c.id}">
      ${c.render()}
    </section>
  `).join('');
}

export function renderShell(categories: readonly Category[]): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Settings — Draco</title>
<style>${STYLES}</style>
</head>
<body>
  <div class="layout">
    ${renderNav(categories)}
    <main>
      ${renderPanes(categories)}
    </main>
  </div>
  <script>${BRIDGE_SCRIPT}</script>
</body>
</html>`;
}
