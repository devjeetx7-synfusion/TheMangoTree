/** Complete food menu (/menu) with working filters and live search. */
import { categories, dishes, categoryById, searchText } from '../../data/menu.js';
import { site } from '../../data/site.js';
import { ROUTES, menuHref } from '../links.js';
import { icon } from '../icons.js';
import { dishCard, breadcrumb } from '../components.js';
import { escapeHtml } from '../utils.js';

export const title = 'Menu · The Mango Tree Cafe, Chhapra';
export const description =
  'Browse the illustrated sample menu — pizza, burgers, pasta, momos, sandwiches, snacks, desserts, coffee and shakes. Filter by category or search by name.';

const CARD_SIZES = '(max-width: 720px) 120px, (max-width: 1080px) 46vw, 360px';

export function render() {
  return `
    <section class="page-hero">
      <div class="container">
        ${breadcrumb([{ label: 'Home', href: ROUTES.home }, { label: 'Menu' }])}
        <h1>Something for<br /><em>every craving.</em></h1>
        <p>Pizza, burgers, momos, pasta, desserts and coffee — browse the illustrated sample menu below. Every dish opens its own page with a photograph, sample price and WhatsApp ordering.</p>
        <p class="page-hero__note">${icon('info')} Sample menu · dishes, descriptions and prices are placeholders</p>
        <ul class="page-hero__stats" aria-label="Menu at a glance">
          <li><strong>${dishes.length}</strong> sample dishes</li>
          <li><strong>${categories.length}</strong> categories</li>
          <li><strong>100%</strong> illustrative photography</li>
        </ul>
      </div>
    </section>

    <div class="menu-toolbar">
      <div class="container menu-toolbar__inner">
        <div class="chip-row" data-chips role="group" aria-label="Filter dishes by category"></div>
        <div class="search" data-search-wrap>
          <label class="visually-hidden" for="menu-search">Search the menu</label>
          <input id="menu-search" type="search" placeholder="Search dishes…" data-search autocomplete="off" />
          ${icon('search')}
          <button class="search__clear" type="button" data-search-clear aria-label="Clear search">
            ${icon('close')}
          </button>
        </div>
      </div>
    </div>

    <section class="section section--tight">
      <div class="container">
        <h2 class="visually-hidden">Menu results</h2>
        <div class="menu-results">
          <p data-count aria-live="polite"></p>
          <p class="menu-results__note">Sample prices · confirmed in chat</p>
          <p class="visually-hidden" data-status role="status" aria-live="polite"></p>
        </div>
        <div class="dish-grid dish-grid--list" data-menu-grid></div>
        <p class="gallery-note">
          ${icon('info')}
          <span><strong>Sample content:</strong> ${site.sampleNote} Food photographs are illustrative. ${site.orderNote}</span>
        </p>
      </div>
    </section>
  `;
}

export function mount(root, route, signal) {
  const grid = root.querySelector('[data-menu-grid]');
  const chips = root.querySelector('[data-chips]');
  const search = root.querySelector('[data-search]');
  const searchWrap = root.querySelector('[data-search-wrap]');
  const clearSearch = root.querySelector('[data-search-clear]');
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

  const syncSearchUi = () => {
    searchWrap?.classList.toggle('has-value', Boolean(search?.value.trim()));
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

    grid.innerHTML = visible.map((dish, index) => dishCard(dish, { index, reveal: false, sizes: CARD_SIZES })).join('');

    const heading = categoryById(category)?.name;
    countEl.innerHTML = visible.length
      ? `<strong>${visible.length}</strong> ${visible.length === 1 ? 'dish' : 'dishes'}${heading ? ` in “${escapeHtml(heading)}”` : ''}${q ? ` for “${escapeHtml(query.trim())}”` : ''}`
      : '';
    statusEl.textContent = visible.length
      ? `${visible.length} ${visible.length === 1 ? 'dish' : 'dishes'} shown`
      : 'No dishes match your search.';

    if (!visible.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <p class="eyebrow" style="justify-content:center">Nothing on this plate</p>
        <h2>No dish matches that yet.</h2>
        <p>We couldn’t find a dish matching “${escapeHtml(query.trim() || 'that')}”. Try another name, or browse the full sample menu.</p>
        <button class="btn btn--green" type="button" data-reset>Show all dishes</button>
      </div>`;
      grid.querySelector('[data-reset]')?.addEventListener('click', () => {
        category = 'all';
        query = '';
        if (search) search.value = '';
        syncSearchUi();
        renderChips();
        syncUrl();
        renderGrid();
        search?.focus();
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
  search?.addEventListener('input', (event) => {
    clearTimeout(debounce);
    query = event.target.value;
    syncSearchUi();
    debounce = window.setTimeout(() => {
      syncUrl();
      renderGrid();
    }, 120);
  }, { signal });

  clearSearch?.addEventListener('click', () => {
    if (!search) return;
    search.value = '';
    query = '';
    clearTimeout(debounce);
    syncSearchUi();
    syncUrl();
    renderGrid();
    search.focus();
  }, { signal });

  search?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && search.value) {
      event.preventDefault();
      clearSearch?.click();
    }
  }, { signal });

  root.addEventListener('keydown', (event) => {
    if (
      event.key === '/' &&
      document.activeElement !== search &&
      !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? '')
    ) {
      event.preventDefault();
      search?.focus();
    }
  }, { signal });

  search && (search.value = query);
  syncSearchUi();
  renderChips();
  renderGrid();
}
