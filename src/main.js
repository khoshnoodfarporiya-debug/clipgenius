import { createSidebar } from './components/sidebar.js';
import { initToastContainer } from './components/toast.js';
import { initIosInstallPrompt } from './components/iosPrompt.js';
import { render as renderDashboard } from './pages/dashboard.js';
import { render as renderTrending } from './pages/trending.js';
import { render as renderGenerator } from './pages/generator.js';
import { render as renderPlanner } from './pages/planner.js';
import { render as renderSettings } from './pages/settings.js';



const PAGE_RENDERERS = {
  dashboard: renderDashboard,
  trending: renderTrending,
  generator: renderGenerator,
  planner: renderPlanner,
  settings: renderSettings,
};

let currentPage = 'dashboard';
let sidebarEl = null;

/**
 * Navigate to a page by id.
 */
function navigateTo(pageId) {
  if (!PAGE_RENDERERS[pageId]) {
    pageId = 'dashboard';
  }

  currentPage = pageId;

  // Update URL hash (without triggering hashchange re-render)
  const newHash = `#${pageId}`;
  if (window.location.hash !== newHash) {
    history.replaceState(null, '', newHash);
  }

  // Clear main content
  const main = document.getElementById('main-content');
  if (main) {
    main.innerHTML = '';
    PAGE_RENDERERS[pageId](main);
  }

  // Update sidebar active state
  updateSidebarActive(pageId);

  // Initialize any lucide icons in the new page content
  if (window.lucide && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }
}

/**
 * Updates the active class on sidebar nav items.
 */
function updateSidebarActive(activeId) {
  if (!sidebarEl) return;

  const items = sidebarEl.querySelectorAll('.sidebar-nav-item');
  items.forEach((item) => {
    const btn = item.querySelector('.sidebar-nav-btn');
    if (btn && btn.getAttribute('data-page') === activeId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

/**
 * Get page id from the current URL hash.
 */
function getPageFromHash() {
  const hash = window.location.hash.replace('#', '').trim();
  return PAGE_RENDERERS[hash] ? hash : 'dashboard';
}

/**
 * Bootstrap the application.
 */
function bootstrap() {
  const app = document.getElementById('app');
  if (!app) return;

  // Build app structure
  app.innerHTML = '';
  app.className = 'app-layout';

  // Create sidebar
  const initialPage = getPageFromHash();
  sidebarEl = createSidebar(navigateTo, initialPage);
  app.appendChild(sidebarEl);

  // Create main content area
  const main = document.createElement('main');
  main.id = 'main-content';
  main.className = 'main-content';
  app.appendChild(main);

  // Init toast container
  initToastContainer();

  // Listen for hash changes (back/forward navigation)
  window.addEventListener('hashchange', () => {
    const page = getPageFromHash();
    if (page !== currentPage) {
      navigateTo(page);
    }
  });

  // Initial render
  navigateTo(initialPage);

  // Initialize the iOS install prompt if applicable
  initIosInstallPrompt();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.error('Service Worker failed:', err));
  });
}
