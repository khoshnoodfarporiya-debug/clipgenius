import { createSidebar } from './components/sidebar.js';
import { createMobileTabBar, updateMobileTabBarActive } from './components/mobileTabBar.js';
import { initToastContainer } from './components/toast.js';
import { initIosInstallPrompt } from './components/iosPrompt.js';
import { render as renderDashboard } from './pages/dashboard.js';
import { render as renderTrending } from './pages/trending.js';
import { render as renderGenerator } from './pages/generator.js';
import { render as renderPlanner } from './pages/planner.js';
import { render as renderSettings } from './pages/settings.js';
import { render as renderApexResolve } from './pages/apexresolve.js';
import { render as renderGrowthFlow } from './pages/growthflow.js';
import { render as renderDigitalProduct } from './pages/digitalproduct.js';

const PAGE_RENDERERS = {
  dashboard: renderDashboard,
  trending: renderTrending,
  generator: renderGenerator,
  planner: renderPlanner,
  apexresolve: renderApexResolve,
  growthflow: renderGrowthFlow,
  digitalproduct: renderDigitalProduct,
  settings: renderSettings,
};

let currentPage = 'dashboard';
let sidebarEl = null;

/**
 * Navigate to a page by id.
 * Supports query parameters by extracting and preserving them in window.location.hash.
 */
function navigateTo(pageId) {
  // Extract clean page ID and potential query params
  const hashPart = pageId.startsWith('#') ? pageId : `#${pageId}`;
  const cleanPageId = hashPart.split('?')[0].replace('#', '').trim();
  
  let targetPageId = cleanPageId;
  if (!PAGE_RENDERERS[cleanPageId]) {
    targetPageId = 'dashboard';
  }

  currentPage = targetPageId;

  // Update URL hash with full original path (including query parameters)
  if (window.location.hash !== hashPart) {
    history.replaceState(null, '', hashPart);
  }

  // Clear main content
  const main = document.getElementById('main-content');
  if (main) {
    main.innerHTML = '';
    PAGE_RENDERERS[targetPageId](main);
  }

  // Update active state in both side navigation systems
  updateSidebarActive(targetPageId);
  updateMobileTabBarActive(targetPageId);

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
 * Safely strips query parameters to prevent routing validation failure.
 */
function getPageFromHash() {
  const hash = window.location.hash.replace('#', '').split('?')[0].trim();
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

  // 1. Create fixed top mobile brand header (looks incredibly native & premium)
  const mobileHeader = document.createElement('header');
  mobileHeader.className = 'mobile-header';
  
  const logoWrap = document.createElement('div');
  logoWrap.className = 'mobile-header-logo';
  logoWrap.innerHTML = `<span class="mobile-header-logo-icon">⚡</span><span class="mobile-header-logo-text gradient-text">ClipGenius</span>`;
  
  const settingsBtn = document.createElement('a');
  settingsBtn.href = '#settings';
  settingsBtn.className = 'mobile-header-settings';
  settingsBtn.setAttribute('aria-label', 'Settings');
  settingsBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`;
  
  mobileHeader.appendChild(logoWrap);
  mobileHeader.appendChild(settingsBtn);
  app.appendChild(mobileHeader);

  // 2. Create sidebar (Desktop view navigation)
  const initialPageFull = window.location.hash || '#dashboard';
  const initialPageClean = getPageFromHash();
  
  sidebarEl = createSidebar(navigateTo, initialPageClean);
  app.appendChild(sidebarEl);

  // 3. Create main content area
  const main = document.createElement('main');
  main.id = 'main-content';
  main.className = 'main-content';
  app.appendChild(main);

  // 4. Create mobile bottom tab bar navigation (iOS style)
  const mobileTabBarEl = createMobileTabBar(navigateTo, initialPageClean);
  app.appendChild(mobileTabBarEl);

  // Init toast container
  initToastContainer();

  // Listen for hash changes (back/forward navigation and link clicks)
  window.addEventListener('hashchange', () => {
    const pageFull = window.location.hash || '#dashboard';
    const pageClean = getPageFromHash();
    if (pageClean !== currentPage) {
      navigateTo(pageFull);
    }
  });

  // Initial render with full hash path to capture incoming query parameters
  navigateTo(initialPageFull);

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
