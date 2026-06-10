import { type Category } from '../category';

export const history: Category = {
  id: 'history',
  label: 'History',
  icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',

  render: () => `
    <h1>History</h1>
    <p class="category-sub">Recently visited pages.</p>
    <div style="display:flex; justify-content: flex-end; margin-bottom: 8px;">
      <button class="danger-btn" id="clear-history">Clear all history</button>
    </div>
    <div class="list-card" id="history-list">
      <div class="empty">Loading…</div>
    </div>
  `,
};
