import { categories, dishes, categoryById, dishesByCategory } from '../data/menu.js';
import { dishCard } from './components.js';
import { icon } from './icons.js';
import { initChrome, wireWhatsApp } from './ui.js';

const grid = document.querySelector('[data-menu-grid]');
const chips = document.querySelector('[data-chips]');
const search = document.querySelector('[data-search]');
const countEl = document.querySelector('[data-count]');
const statusEl = document.querySelector('[data-status]');

const params = new URLSearchParams(window.location.search);
const initialCategory = params.get('category');
let category = categoryById(initialCategory) ? initialCategory : 'all';
let query = params.get('q') ?? '';

const chipData = [{ id: 'all', name: 'All dishes' }, ...categories];

function renderChips() {
  chips.innerHTML = chipData
    .map(
      (item) =>
        `<button class="chip" type="button" data-chip="${item.id}" aria-pressed="${item.id === category}">${item.name}</button>`
    )
    .join('');
}

function syncUrl() {
  const next = new URLSearchParams();
  if (category !== 'all') next.set('category', category);
  if (query.trim()) next.set('q', query.trim());
  const url = `${window.location.pathname}${next.toString() ? `?${next}` : ''}${window.location.hash}`;
  window.history.replaceState({}, '', url);
}

function matches(dish) {
  if (category !== 'all' && dish.category !== category) return false;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [dish.name, dish.description, dish.story, ...(dish.tags ?? [])]
    .join(' ')
    .toLowerCase()
    .includes(q);
}

function render() {
  const visible = dishes.filter(matches);
  // Menu cards are re-rendered on every filter, so they skip the scroll-reveal
  // animation (an unobserved .reveal would stay invisible).
  grid.innerHTML = visible.map((dish, index) => dishCard(dish, { index, reveal: false })).join('');

  const heading = categoryById(category)?.name;
  countEl.innerHTML =
    visible.length > 0
      ? `<strong>${visible.length}</strong> ${visible.length === 1 ? 'dish' : 'dishes'}${heading ? ` in “${heading}”` : ''}${query.trim() ? ` for “${query.trim()}”` : ''}`
      : '';

  statusEl.textContent = visible.length
    ? `${visible.length} ${visible.length === 1 ? 'dish' : 'dishes'} shown`
    : 'No dishes match your search.';

  if (!visible.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <h2>Nothing on this plate yet</h2>
      <p>We couldn’t find a dish matching “${query.trim() || 'that'}”. Try another search, or browse the full sample menu.</p>
      <button class="btn btn--green" type="button" data-reset>Show all dishes</button>
    </div>`;
    grid.querySelector('[data-reset]')?.addEventListener('click', () => {
      category = 'all';
      query = '';
      if (search) search.value = '';
      renderChips();
      syncUrl();
      render();
    });
  }

  wireWhatsApp(grid);
}

chips.addEventListener('click', (event) => {
  const button = event.target.closest('[data-chip]');
  if (!button) return;
  category = button.dataset.chip;
  renderChips();
  syncUrl();
  render();
});

let debounce;
search?.addEventListener('input', (event) => {
  clearTimeout(debounce);
  query = event.target.value;
  debounce = setTimeout(() => {
    syncUrl();
    render();
  }, 140);
});

if (search) {
  search.value = query;
  // Keyboard shortcut: "/" focuses the search field.
  window.addEventListener('keydown', (event) => {
    if (event.key === '/' && document.activeElement !== search) {
      event.preventDefault();
      search.focus();
    }
  });
}

if (!grid) {
  // Nothing to do without the menu grid.
} else {
  renderChips();
  render();
  initChrome();
  document.querySelector('[data-wa-menu]')?.addEventListener('click', () => {});
  document.querySelectorAll('[data-cat-icon]').forEach((el) => {
    el.innerHTML = icon('arrowRight');
  });
}
