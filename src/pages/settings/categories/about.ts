import { type Category } from '../category';

export const about: Category = {
  id: 'about',
  label: 'About',
  icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',

  render: () => `
    <h1>About</h1>
    <p class="category-sub">App info and credits.</p>
    <div class="about-card">
      <div class="about-logo">Draco</div>
      <div class="about-tag">Protection. Privacy. Peace of mind.</div>
      <div class="about-version">Version 0.1.0 · Electron</div>
    </div>
  `,
};
