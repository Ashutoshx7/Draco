/**
 * Category descriptor — one per left-nav entry. Categories are self-contained:
 * the file exports {id, label, icon, render()} and the shell composes them.
 *
 * id is used as the URL hash (#privacy) and as the data-category attribute
 * on the rendered <section>. Clicking a nav item toggles which pane is visible.
 */
export interface Category {
  readonly id: string;
  readonly label: string;
  /** Inline SVG markup, no <svg> wrapper — the shell wraps it. */
  readonly icon: string;
  /** Returns the HTML body for the category pane (excluding the <section> wrapper). */
  render(): string;
}

/** Reusable row helper — keeps category files terse and consistent. */
export function row(opts: { label: string; hint?: string; control: string; badge?: string; column?: boolean }): string {
  const badge = opts.badge ? ` <span class="badge">${opts.badge}</span>` : '';
  const hint = opts.hint ? `<div class="row-hint">${opts.hint}</div>` : '';
  const cls = opts.column ? 'row column' : 'row';
  return `
    <div class="${cls}">
      <div class="row-text">
        <div class="row-label">${opts.label}${badge}</div>
        ${hint}
      </div>
      <div class="row-control">${opts.control}</div>
    </div>
  `;
}

/** Subcategory wrapper. Pass zen:true for a normal-weight section header without a groupbox. */
export function subcategory(title: string, rowsHtml: string, opts?: { zen?: boolean; noBox?: boolean }): string {
  const headerClass = (opts?.zen || opts?.noBox) ? 'section-header' : '';
  const content = (opts?.noBox)
    ? rowsHtml
    : `<div class="groupbox">${rowsHtml}</div>`;
  return `
    <div class="subcategory">
      <h2 class="${headerClass}">${title}</h2>
      ${content}
    </div>
  `;
}

/** Standard toggle bound to a pref via auto-binding. */
export function toggle(pref: string): string {
  return `<div class="toggle" data-pref="${pref}" data-pref-type="bool"></div>`;
}

/** Standard select bound to a pref. options: [{value, label, disabled?}] */
export function select(pref: string, options: Array<{ value: string; label: string; disabled?: boolean }>): string {
  const opts = options.map(o =>
    `<option value="${o.value}"${o.disabled ? ' disabled' : ''}>${o.label}</option>`
  ).join('');
  return `<select data-pref="${pref}" data-pref-type="string">${opts}</select>`;
}

/**
 * Zen-style checkbox row — label sits right of the box, optional hint below.
 * Used for Tabs/Browsing list sections where toggles would feel heavy.
 */
export function checkbox(pref: string, label: string, hint?: string): string {
  const hintHtml = hint ? `<span class="cb-hint">${hint}</span>` : '';
  return `
    <label class="cb-row">
      <input type="checkbox" class="cb-input" data-pref="${pref}" data-pref-type="bool" />
      <span class="cb-track"></span>
      <span class="cb-body">
        <span class="cb-label">${label}</span>${hintHtml}
      </span>
    </label>
  `;
}

/** Wraps a list of checkbox() items in a flat card (no dividers). */
export function checkboxList(itemsHtml: string): string {
  return `<div class="cb-list">${itemsHtml}</div>`;
}
