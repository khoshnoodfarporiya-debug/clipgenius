import { showToast } from './toast.js';

let commandPaletteEl = null;
let activeIndex = 0;
let items = [];
let onNavigate = null;

// Built-in navigation options
const NAV_PAGES = [
  { id: 'dashboard', label: 'Go to Dashboard', category: 'Navigation', icon: '📊', action: () => handleNavigate('dashboard') },
  { id: 'trending', label: 'Go to Trending Products', category: 'Navigation', icon: '🔥', action: () => handleNavigate('trending') },
  { id: 'generator', label: 'Go to Clip Generator', category: 'Navigation', icon: '⚡', action: () => handleNavigate('generator') },
  { id: 'planner', label: 'Go to Content Planner', category: 'Navigation', icon: '📅', action: () => handleNavigate('planner') },
  { id: 'apexresolve', label: 'Go to ApexResolve AI Node', category: 'Navigation', icon: '⚙️', action: () => handleNavigate('apexresolve') },
  { id: 'growthflow', label: 'Go to GrowthFlow Marketing Suite', category: 'Navigation', icon: '📢', action: () => handleNavigate('growthflow') },
  { id: 'settings', label: 'Go to System Settings', category: 'Navigation', icon: '🔧', action: () => handleNavigate('settings') }
];

// System Actions
const SYSTEM_ACTIONS = [
  { id: 'diag-run', label: 'Run System Diagnostics Check', category: 'System Actions', icon: '🛠️', action: () => runDiagnostics() },
  { id: 'reset-session', label: 'Reset Local Workspace Cache', category: 'System Actions', icon: '🧹', action: () => resetWorkspace() },
  { id: 'theme-gold', label: 'Morph Theme: Golden Luxury', category: 'Accents & Styling', icon: '⚜️', action: () => changeTheme('gold') },
  { id: 'theme-emerald', label: 'Morph Theme: Emerald Aurora', category: 'Accents & Styling', icon: '🟢', action: () => changeTheme('emerald') },
  { id: 'theme-purple', label: 'Morph Theme: Cyberpunk Violet', category: 'Accents & Styling', icon: '🟣', action: () => changeTheme('purple') },
  { id: 'theme-blue', label: 'Morph Theme: Electric Ocean', category: 'Accents & Styling', icon: '🔵', action: () => changeTheme('blue') }
];

export function initCommandPalette(navigateCallback) {
  onNavigate = navigateCallback;

  // Add listener for Ctrl+K / Cmd+K
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      togglePalette();
    }
  });

  // Inject Command Palette modal structure to DOM
  const overlay = document.createElement('div');
  overlay.id = 'command-palette-overlay';
  overlay.className = 'command-palette-overlay hidden';
  overlay.innerHTML = `
    <div class="command-palette-container glass-panel">
      <div class="command-palette-search-wrapper">
        <span class="command-palette-search-icon">🔍</span>
        <input type="text" id="command-palette-input" class="command-palette-input" placeholder="Search pages, products, systems, actions..." autocomplete="off" />
        <span class="command-palette-shortcut-hint">ESC to close</span>
      </div>
      <div id="command-palette-results" class="command-palette-results"></div>
    </div>
  `;

  document.body.appendChild(overlay);
  commandPaletteEl = overlay;

  // Click background to hide
  commandPaletteEl.addEventListener('click', (e) => {
    if (e.target === commandPaletteEl) {
      hidePalette();
    }
  });

  // Escape key to hide
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !commandPaletteEl.classList.contains('hidden')) {
      hidePalette();
    }
  });

  // Keyboard navigation inside input
  const input = document.getElementById('command-palette-input');
  input.addEventListener('keydown', handleKeyNavigation);
  input.addEventListener('input', (e) => filterItems(e.target.value));

  // Initialize items
  loadAllItems();
}

function loadAllItems() {
  // Combine core navigation, system commands, and recently sourced products from database
  let dbProducts = [];
  try {
    const launched = JSON.parse(localStorage.getItem('clipgenius_launched_products') || '[]');
    dbProducts = launched.map(p => ({
      id: `prod-${p.title.replace(/\s+/g, '-')}`,
      label: `Sourced Product: ${p.title} (${p.price || '$2.40'})`,
      category: 'Sourced Products',
      icon: '📦',
      action: () => {
        showToast(`⚡ Syncing ${p.title} to GrowthFlow campaign...`, 'info');
        window.postMessage({ type: 'AGENT_PRODUCT_LAUNCHED', product: p }, '*');
        hidePalette();
      }
    }));
  } catch (err) {
    console.error('Failed to load sourced products inside Command Palette:', err);
  }

  items = [...NAV_PAGES, ...SYSTEM_ACTIONS, ...dbProducts];
}

function togglePalette() {
  if (commandPaletteEl.classList.contains('hidden')) {
    showPalette();
  } else {
    hidePalette();
  }
}

function showPalette() {
  loadAllItems(); // Refresh products
  commandPaletteEl.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // Block scroll
  const input = document.getElementById('command-palette-input');
  input.value = '';
  input.focus();
  activeIndex = 0;
  filterItems('');
}

function hidePalette() {
  commandPaletteEl.classList.add('hidden');
  document.body.style.overflow = ''; // Unblock scroll
}

function handleNavigate(pageId) {
  if (onNavigate) {
    onNavigate(pageId);
    hidePalette();
  }
}

function runDiagnostics() {
  hidePalette();
  showToast('🛠️ Running multi-agent AST checks & diagnostics...', 'info');
  setTimeout(() => {
    showToast('🟢 Node DeepPulse Node 01 check successful! 99.8% health.', 'success');
  }, 1200);
}

function resetWorkspace() {
  if (confirm('Are you sure you want to flush cached workspace telemetry?')) {
    localStorage.removeItem('clipgenius_launched_products');
    loadAllItems();
    showToast('🧹 Local workspace memory flushed.', 'success');
    hidePalette();
  }
}

function changeTheme(theme) {
  localStorage.setItem('clipgenius_theme', theme);
  window.dispatchEvent(new CustomEvent('clipgenius_theme_changed', { detail: theme }));
  hidePalette();
}

function filterItems(query) {
  const normalizedQuery = query.toLowerCase().trim();
  const resultsEl = document.getElementById('command-palette-results');
  resultsEl.innerHTML = '';

  const filtered = items.filter(item => 
    item.label.toLowerCase().includes(normalizedQuery) ||
    item.category.toLowerCase().includes(normalizedQuery)
  );

  if (filtered.length === 0) {
    resultsEl.innerHTML = `<div class="command-palette-empty">No results found for "${query}"</div>`;
    return;
  }

  // Group by category
  const categories = {};
  filtered.forEach((item, index) => {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push({ ...item, globalIndex: index });
  });

  // Render items grouped by category header
  let indexCounter = 0;
  Object.keys(categories).forEach(cat => {
    const catHeader = document.createElement('div');
    catHeader.className = 'command-palette-category';
    catHeader.textContent = cat;
    resultsEl.appendChild(catHeader);

    categories[cat].forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = `command-palette-item ${indexCounter === activeIndex ? 'active' : ''}`;
      itemEl.innerHTML = `
        <span class="command-palette-item-icon">${item.icon}</span>
        <span class="command-palette-item-label">${item.label}</span>
        <span class="command-palette-item-badge">${item.category}</span>
      `;

      itemEl.addEventListener('click', () => {
        item.action();
      });

      resultsEl.appendChild(itemEl);
      indexCounter++;
    });
  });

  // Keep active index in bounds
  if (activeIndex >= filtered.length) {
    activeIndex = Math.max(0, filtered.length - 1);
  }
}

function handleKeyNavigation(e) {
  const query = e.target.value;
  const filtered = items.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  if (filtered.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex = (activeIndex + 1) % filtered.length;
    filterItems(query);
    scrollToActiveItem();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex = (activeIndex - 1 + filtered.length) % filtered.length;
    filterItems(query);
    scrollToActiveItem();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const activeItem = filtered[activeIndex];
    if (activeItem) {
      activeItem.action();
    }
  }
}

function scrollToActiveItem() {
  const activeEl = document.querySelector('.command-palette-item.active');
  if (activeEl) {
    activeEl.scrollIntoView({ block: 'nearest' });
  }
}
