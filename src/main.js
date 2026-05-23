import { createSidebar } from './components/sidebar.js';
import { createMobileTabBar, updateMobileTabBarActive } from './components/mobileTabBar.js';
import { initToastContainer, showToast } from './components/toast.js';
import { initIosInstallPrompt } from './components/iosPrompt.js';
import { render as renderDashboard } from './pages/dashboard.js';
import { render as renderTrending } from './pages/trending.js';
import { render as renderGenerator } from './pages/generator.js';
import { render as renderPlanner } from './pages/planner.js';
import { render as renderSettings } from './pages/settings.js';
import { render as renderApexResolve } from './pages/apexresolve.js';
import { render as renderGrowthFlow } from './pages/growthflow.js';
import { render as renderDigitalProduct } from './pages/digitalproduct.js';
import { initCommandPalette } from './components/commandPalette.js';
import './styles/commandPalette.css';

// ── Theme Mapping System ──
const THEME_MAP = {
  gold: {
    '--accent-purple': '#c5a880',
    '--accent-pink': '#dfba73',
    '--accent-orange': '#f2cb78',
    '--gradient-accent': 'linear-gradient(135deg, #a38244, #dfba73, #eed39c)',
    '--shadow-glow': '0 0 20px rgba(223, 186, 115, 0.14)',
  },
  emerald: {
    '--accent-purple': '#10b981',
    '--accent-pink': '#34d399',
    '--accent-orange': '#6ee7b7',
    '--gradient-accent': 'linear-gradient(135deg, #047857, #10b981, #6ee7b7)',
    '--shadow-glow': '0 0 20px rgba(16, 185, 129, 0.14)',
  },
  purple: {
    '--accent-purple': '#8b5cf6',
    '--accent-pink': '#a78bfa',
    '--accent-orange': '#c4b5fd',
    '--gradient-accent': 'linear-gradient(135deg, #6d28d9, #8b5cf6, #c4b5fd)',
    '--shadow-glow': '0 0 20px rgba(139, 92, 246, 0.14)',
  },
  blue: {
    '--accent-purple': '#00e5ff',
    '--accent-pink': '#38bdf8',
    '--accent-orange': '#7dd3fc',
    '--gradient-accent': 'linear-gradient(135deg, #0369a1, #00e5ff, #7dd3fc)',
    '--shadow-glow': '0 0 20px rgba(0, 229, 255, 0.14)',
  }
};

function applyTheme(themeName) {
  const vars = THEME_MAP[themeName] || THEME_MAP.gold;
  Object.keys(vars).forEach((key) => {
    document.documentElement.style.setProperty(key, vars[key]);
  });
}

// Bootstrap active theme
applyTheme(localStorage.getItem('clipgenius_theme') || 'gold');

// Listen for global theme changes from settings page
window.addEventListener('clipgenius_theme_changed', (e) => {
  const newTheme = e.detail;
  applyTheme(newTheme);
  
  // Broadcast to all active iframes
  document.querySelectorAll('iframe').forEach(iframe => {
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'CLIPGENIUS_THEME_CHANGE',
          theme: newTheme
        }, '*');
      }
    } catch (err) {
      console.warn('[Theme Broadcast] Failed to notify child iframe:', err);
    }
  });
});

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

  // Initialize the global Cmd+K Command Palette
  initCommandPalette(navigateTo);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

// ── SSO & Dynamic Sourcing Sync: Global postMessage listener for child iframe agents ──
window.addEventListener('message', (event) => {
  if (!event.data || typeof event.data !== 'object') return;

  switch (event.data.type) {
    case 'AGENT_AUTH_REQUEST': {
      // Child agent is requesting auth context
      const requestingIframe = document.querySelector(
        `iframe[title*="${event.data.agent}"]`
      );
      if (requestingIframe && requestingIframe.contentWindow) {
        const authContext = {
          type: 'CLIPGENIUS_SSO',
          payload: {
            user: JSON.parse(localStorage.getItem('clipgenius_user') || 'null'),
            settings: JSON.parse(localStorage.getItem('clipgenius_settings') || '{}'),
            apiKeys: {
              groq: localStorage.getItem('clipgenius_groq_key') || '',
              youtube: localStorage.getItem('clipgenius_youtube_key') || '',
            },
            theme: localStorage.getItem('clipgenius_theme') || 'gold',
            launchedProducts: JSON.parse(localStorage.getItem('clipgenius_launched_products') || '[]'),
            parentOrigin: window.location.origin,
            timestamp: Date.now(),
          },
        };
        requestingIframe.contentWindow.postMessage(authContext, '*');
      }
      break;
    }

    case 'AGENT_HEARTBEAT':
      console.log(`[SSO] ${event.data.agent} heartbeat: ${event.data.status}`);
      break;

    case 'AGENT_NAVIGATE':
      // Child agent requests parent navigation
      if (event.data.hash) {
        window.location.hash = event.data.hash;
      }
      break;

    case 'AGENT_PRODUCT_LAUNCHED': {
      // Sourcing Agent (or dashboard) launched a winning product!
      const product = event.data.product;
      if (!product || !product.title) return;

      console.log('[Product Launch] Received sync request for:', product.title);

      // Save product to ClipGenius LocalStorage
      const currentList = JSON.parse(localStorage.getItem('clipgenius_launched_products') || '[]');
      
      // Prevent duplicates
      if (!currentList.some(p => p.title === product.title)) {
        currentList.push(product);
        localStorage.setItem('clipgenius_launched_products', JSON.stringify(currentList));
      }

      // Propagate launch to other running child agents immediately
      document.querySelectorAll('iframe').forEach(iframe => {
        try {
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'AGENT_PRODUCT_LAUNCHED',
              product: product
            }, '*');
          }
        } catch (err) {
          console.warn('[Product Launch] Broadcast to iframe failed:', err);
        }
      });

      // Dispatch internal event in parent window (for activity feed/telemetry)
      window.dispatchEvent(new CustomEvent('clipgenius_product_launched', { detail: product }));

      // Show beautiful toast notification
      showToast(`⚡ ${product.title} synced to GrowthFlow & ApexResolve!`, 'success');
      break;
    }
  }
});

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.error('Service Worker failed:', err));
  });
}
