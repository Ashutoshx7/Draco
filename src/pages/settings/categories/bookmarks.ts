import { type Category } from '../category';

export const bookmarks: Category = {
  id: 'bookmarks',
  label: 'Bookmarks',
  icon: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',

  render: () => `
    <h1>Bookmarks</h1>
    <p class="category-sub">All saved pages across every workspace.</p>
    <div class="list-card" id="bookmarks-list">
      <div class="empty">Loading…</div>
    </div>
  `,
};
