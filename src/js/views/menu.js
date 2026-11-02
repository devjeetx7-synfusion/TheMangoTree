/** Complete food menu (/menu) with working filters and search. */
import { categories, dishes, categoryById, searchText } from '../../data/menu.js';
import { site } from '../../data/site.js';
import { ROUTES, menuHref } from '../links.js';
import { icon } from '../icons.js';
import { dishCard, breadcrumb } from '../components.js';
import { escapeHtml } from '../utils.js';

export const title = 'Menu · The Mango Tree Cafe, Chhapra';
export const description =
  'Browse the illustrated sample menu — pizza, burgers, pasta, momos, sandwiches, snacks, desserts, coffee and shakes. Filter by category or search by name.';

export function render() {
  return `
    <section class="page-hero">
      <div class="container">
        ${breadcrumb([{ label: 'Home', href: ROUTES.home }, { label: 'Menu' }])}
        <h1>Something for<br /><em>every craving.</em></h1>
        <p>Pizza, burgers, momos, pasta, desserts and coffee — browse the illustrated sample menu below. Every dish opens its own detail page with a photograph, sample price and WhatsApp ordering.</p>
        <p class="page-hero__note">${icon('info')} Sample menu · dishes, descriptions, ingredients and prices are placeholders</p>
      </div>
    </section>

    <div class="menu-toolbar">
      <div class="container menu-toolbar__inner">
        <div class="chip-row" data-chips aria-label="Filter dishes by category"></div>
        <label class="search">
          <span class="visually-hidden">Search the menu</span>
          <input type="search" placeholder="Search dishes…" data-search autocomplete="off" />
          ${icon('search')}
        </label>
      </div>
    </div>

    <section class="section section--tight">
      <div class="container">
        <div class="menu-results">
          <p data-count aria-live="polite"></p>
          <p class="visually-hidden" data-status role="status" aria-live="polite"></p>
        </div>
        <div class="dish-grid dish-grid--list" data-menu-grid></div>
        <div class="gallery-note" style="margin-top:26px">
          ${icon('info')}
          <span><strong>Sample content:</strong> ${site.sampleNote} Food photographs are illustrative. ${site.orderNote}</span>
        </div>
      </div>
    </section>
  `;
}

export function mount(root, route, signal) {
  const grid = root.querySelector('[data-menu-grid]');
  const chips = root.querySelector('[data-chips]');
  const search = root.querySelector('[data-search]');
  const countEl = root.querySelector('[data-count]');
  const statusEl = root.querySelector('[data-status]');
  if (!grid || !chips) return;

  const initialCategory = route.query.get('category');
  let category = categoryById(initialCategory) ? initialCategory : 'all';
  let query = route.query.get('q') ?? '';
  const chipData = [{ id: 'all', name: 'All dishes' }, ...categories];

  const syncUrl = () => {
    const hash = window.location.hash || '';
    window.history.replaceState(window.history.state || {}, '', `${menuHref({ category, q: query })}${hash}`);
  };

  const renderChips = () => {
    chips.innerHTML = chipData
      .map((item) => `<button class="chip" type="button" data-chip="${item.id}" aria-pressed="${item.id === category}">${escapeHtml(item.name)}</button>`)
      .join('');
  };

  const renderGrid = () => {
    const q = query.trim().toLowerCase();
    const visible = dishes.filter(
      (dish) => (category === 'all' || dish.category === category) && (!q || searchText(dish).includes(q))
    );

    grid.innerHTML = visible.map((dish, index) => dishCard(dish, { index, reveal: false })).join('');

    const heading = categoryById(category)?.name;
    countEl.innerHTML = visible.length
      ? `<strong>${visible.length}</strong> ${visible.length === 1 ? 'dish' : 'dishes'}${heading ? ` in “${escapeHtml(heading)}”` : ''}${q ? ` for “${escapeHtml(query.trim())}”` : ''}`
      : '';
    statusEl.textContent = visible.length
      ? `${visible.length} ${visible.length === 1 ? 'dish' : 'dishes'} shown`
      : 'No dishes match your search.';

    if (!visible.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <h2>Nothing on this plate yet</h2>
        <p>We couldn’t find a dish matching “${escapeHtml(query.trim() || 'that')}”. Try another search, or browse the full sample menu.</p>
        <button class="btn btn--green" type="button" data-reset>Show all dishes</button>
      </div>`;
      grid.querySelector('[data-reset]')?.addEventListener('click', () => {
        category = 'all';
        query = '';
        search.value = '';
        renderChips();
        syncUrl();
        renderGrid();
      }, { signal });
    }
  };

  chips.addEventListener('click', (event) => {
    const button = event.target.closest('[data-chip]');
    if (!button) return;
    category = button.dataset.chip;
    renderChips();
    syncUrl();
    renderGrid();
  }, { signal });

  let debounce;
  search.addEventListener('input', (event) => {
    clearTimeout(debounce);
    query = event.target.value;
    debounce = window.setTimeout(() => {
      syncUrl();
      renderGrid();
    }, 120);
  }, { signal });
  search.value = query;

  root.addEventListener('keydown', (event) => {
    if (event.key === '/' && document.activeElement !== search && !/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName ?? '')) {
      event.preventDefault();
      search.focus();
    }
  }, { signal });

  renderChips();
  renderGrid();
}
