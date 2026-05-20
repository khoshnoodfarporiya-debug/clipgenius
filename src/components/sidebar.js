import { getIconSvg } from '../services/icons.js';

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
  { id: 'trending', icon: 'trending-up', label: 'Trending' },
  { id: 'generator', icon: 'sparkles', label: 'Idea Generator' },
  { id: 'planner', icon: 'calendar', label: 'Content Planner' },
  { id: 'settings', icon: 'settings', label: 'Settings' },
];

/**
 * Creates the sidebar navigation element.
 * @param {function} onNavigate - Called with page id on nav click
 * @param {string} activePage - Currently active page id
 * @returns {HTMLElement}
 */
export function createSidebar(onNavigate, activePage) {
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';

  // ── Logo / Brand ──────────────────────────────────────────
  const brand = document.createElement('div');
  brand.className = 'sidebar-brand';

  const logo = document.createElement('h1');
  logo.className = 'sidebar-logo';
  logo.textContent = 'ClipGenius';

  const tagline = document.createElement('span');
  tagline.className = 'sidebar-tagline';
  tagline.textContent = 'AI Content Engine';

  brand.appendChild(logo);
  brand.appendChild(tagline);
  sidebar.appendChild(brand);

  // ── Navigation List ───────────────────────────────────────
  const nav = document.createElement('nav');
  nav.className = 'sidebar-nav';

  const ul = document.createElement('ul');

  NAV_ITEMS.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'sidebar-nav-item' + (item.id === activePage ? ' active' : '');

    const button = document.createElement('button');
    button.className = 'sidebar-nav-btn';
    button.setAttribute('data-page', item.id);
    button.setAttribute('aria-label', item.label);

    // Icon via getIconSvg
    const iconWrap = document.createElement('span');
    iconWrap.className = 'sidebar-icon';
    iconWrap.innerHTML = getIconSvg(item.icon, { class: 'sidebar-svg-icon' });

    const label = document.createElement('span');
    label.className = 'sidebar-label';
    label.textContent = item.label;

    button.appendChild(iconWrap);
    button.appendChild(label);

    button.addEventListener('click', () => {
      onNavigate(item.id);
      // Close mobile sidebar on navigate
      sidebar.classList.remove('sidebar-open');
    });

    li.appendChild(button);
    ul.appendChild(li);
  });

  nav.appendChild(ul);
  sidebar.appendChild(nav);

  // ── Bottom Version ────────────────────────────────────────
  const version = document.createElement('div');
  version.className = 'sidebar-version';
  version.textContent = 'v1.0';
  sidebar.appendChild(version);

  // ── Mobile Toggle ─────────────────────────────────────────
  const toggle = document.createElement('button');
  toggle.className = 'sidebar-toggle';
  toggle.setAttribute('aria-label', 'Toggle sidebar');
  toggle.innerHTML = '<span></span><span></span><span></span>';
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-open');
  });
  sidebar.appendChild(toggle);

  return sidebar;
}

/**
 * Convert kebab-case icon name to camelCase for lucide.icons lookup.
 * e.g. 'layout-dashboard' → 'LayoutDashboard'
 */
function toCamelCase(str) {
  return str
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}
