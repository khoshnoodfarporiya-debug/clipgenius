import { getIconSvg } from '../services/icons.js';

const TAB_ITEMS = [
  { id: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
  { id: 'trending', icon: 'trending-up', label: 'Trending' },
  { id: 'generator', icon: 'sparkles', label: 'Generator' },
  { id: 'planner', icon: 'calendar', label: 'Planner' },
  { id: 'settings', icon: 'settings', label: 'Settings' },
];

let activeTabIndicator = null;

/**
 * Creates the mobile bottom tab bar navigation element.
 * @param {function} onNavigate - Called with page id on tab click
 * @param {string} activePage - Currently active page id
 * @returns {HTMLElement}
 */
export function createMobileTabBar(onNavigate, activePage) {
  const container = document.createElement('nav');
  container.className = 'mobile-tab-bar';
  container.id = 'mobile-tab-bar';

  const list = document.createElement('ul');
  list.className = 'mobile-tab-list';

  TAB_ITEMS.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'mobile-tab-item' + (item.id === activePage ? ' active' : '');
    li.id = `tab-item-${item.id}`;

    const button = document.createElement('button');
    button.className = 'mobile-tab-btn';
    button.setAttribute('data-page', item.id);
    button.setAttribute('aria-label', item.label);

    // Glowing dot / circle background effect for active state
    const glowBg = document.createElement('div');
    glowBg.className = 'mobile-tab-glow';
    button.appendChild(glowBg);

    // Icon wrapper using pre-rendered SVGs
    const iconWrap = document.createElement('div');
    iconWrap.className = 'mobile-tab-icon';
    iconWrap.innerHTML = getIconSvg(item.icon, { class: 'mobile-tab-svg' });
    button.appendChild(iconWrap);

    // Label
    const label = document.createElement('span');
    label.className = 'mobile-tab-label';
    label.textContent = item.label;
    button.appendChild(label);

    // Dynamic Haptic Feedback feel via animation on click/touchstart
    button.addEventListener('click', () => {
      // Navigate
      onNavigate(item.id);
      
      // Trigger spring animation
      button.classList.add('tab-clicked');
      setTimeout(() => {
        button.classList.remove('tab-clicked');
      }, 300);
    });

    li.appendChild(button);
    list.appendChild(li);
  });

  container.appendChild(list);
  return container;
}

/**
 * Updates the active tab active class.
 * @param {string} activeId - The active page ID
 */
export function updateMobileTabBarActive(activeId) {
  const tabContainer = document.getElementById('mobile-tab-bar');
  if (!tabContainer) return;

  const items = tabContainer.querySelectorAll('.mobile-tab-item');
  items.forEach((item) => {
    const btn = item.querySelector('.mobile-tab-btn');
    if (btn && btn.getAttribute('data-page') === activeId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}
