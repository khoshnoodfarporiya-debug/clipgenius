import '../styles/planner.css';
import { storage } from '../services/storage.js';
import { showToast } from '../components/toast.js';
import { getIconSvg } from '../services/icons.js';

const STATUS_CONFIG = {
  idea:     { label: '💡 Idea',     color: '#7c3aed' },
  scripted: { label: '✍️ Scripted', color: '#3b82f6' },
  filmed:   { label: '🎬 Filmed',   color: '#f97316' },
  posted:   { label: '✅ Posted',   color: '#22c55e' },
};

function timeAgo(date) {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function render(container) {
  const filterIcon = getIconSvg('filter', { width: 16, height: 16 });
  const editIcon = getIconSvg('edit', { width: 14, height: 14 });
  const trashIcon = getIconSvg('trash-2', { width: 14, height: 14 });
  const lightbulbIcon = getIconSvg('lightbulb', { width: 48, height: 48 });
  const copyIcon = getIconSvg('copy', { width: 14, height: 14 });
  const chevronIcon = getIconSvg('chevron-down', { width: 14, height: 14 });
  const clockIcon = getIconSvg('clock', { width: 14, height: 14 });

  let currentFilter = 'all';
  let currentSort = 'newest';

  // Helper to get fresh counts
  function getCounts() {
    const ideas = storage.getIdeas();
    return {
      all: ideas.length,
      idea: ideas.filter(i => (i.status || 'idea') === 'idea').length,
      scripted: ideas.filter(i => i.status === 'scripted').length,
      filmed: ideas.filter(i => i.status === 'filmed').length,
      posted: ideas.filter(i => i.status === 'posted').length,
    };
  }

  const counts = getCounts();

  container.innerHTML = `
    <div class="planner-header">
      <h1 class="gradient-text">Content Planner</h1>
      <div class="planner-controls">
        <div class="status-filters" id="filter-chips">
          <button class="status-filter-chip active" data-filter="all" data-status="all">All <span class="status-filter-count">${counts.all}</span></button>
          <button class="status-filter-chip" data-filter="idea" data-status="idea">💡 Idea <span class="status-filter-count">${counts.idea}</span></button>
          <button class="status-filter-chip" data-filter="scripted" data-status="scripted">✍️ Scripted <span class="status-filter-count">${counts.scripted}</span></button>
          <button class="status-filter-chip" data-filter="filmed" data-status="filmed">🎬 Filmed <span class="status-filter-count">${counts.filmed}</span></button>
          <button class="status-filter-chip" data-filter="posted" data-status="posted">✅ Posted <span class="status-filter-count">${counts.posted}</span></button>
        </div>
        <div class="sort-wrapper">
          ${filterIcon}
          <select class="sort-select" id="sort-select">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="virality">Highest virality</option>
          </select>
          <span class="select-chevron">${chevronIcon}</span>
        </div>
      </div>
    </div>

    <div class="planner-list" id="planner-list"></div>

    <div class="scripts-section">
      <h2 class="section-title">${getIconSvg('calendar', { width: 20, height: 20 })} Saved Scripts</h2>
      <div class="scripts-list" id="scripts-list"></div>
    </div>
  `;

  // --- Filter chips click handlers ---
  function bindFilterChips() {
    document.querySelectorAll('.status-filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.status-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.dataset.filter;
        renderIdeas();
      });
    });
  }
  bindFilterChips();

  // --- Dynamic count update helper ---
  function updateFilterCounts() {
    const currentCounts = getCounts();
    document.querySelectorAll('.status-filter-chip').forEach(chip => {
      const filter = chip.dataset.filter;
      const countEl = chip.querySelector('.status-filter-count');
      if (countEl) {
        countEl.textContent = currentCounts[filter] || 0;
      }
    });
  }

  // --- Sort select ---
  document.getElementById('sort-select').addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderIdeas();
  });

  function renderIdeas() {
    const listEl = document.getElementById('planner-list');
    let ideas = storage.getIdeas();

    // Update the dynamic visual filter badges
    updateFilterCounts();

    // Filter
    if (currentFilter !== 'all') {
      ideas = ideas.filter(i => (i.status || 'idea') === currentFilter);
    }

    // Sort
    if (currentSort === 'newest') {
      ideas.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (currentSort === 'oldest') {
      ideas.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (currentSort === 'virality') {
      ideas.sort((a, b) => (b.estimatedVirality || 0) - (a.estimatedVirality || 0));
    }

    if (!ideas.length) {
      listEl.innerHTML = `
        <div class="empty-state animate-fadeInUp">
          <div class="empty-state-icon">${lightbulbIcon}</div>
          <h4 class="empty-state-title">No Ideas Found</h4>
          <p class="empty-state-desc">Generate some viral content and save them to build out your high-performance schedule!</p>
          <a href="#generator" class="btn-primary" style="display:inline-flex;margin-top:12px;text-decoration:none;">Go to Generator</a>
        </div>
      `;
      return;
    }

    listEl.innerHTML = ideas.map((idea, i) => {
      const status = idea.status || 'idea';
      const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idea;
      const virality = idea.estimatedVirality ? `${idea.estimatedVirality}/10` : '–';
      return `
        <div class="planner-item glass-card fadeInUp" data-id="${idea.id}" style="animation-delay:${i * 0.04}s">
          <span class="planner-item-status planner-item-status--${status}" title="${cfg.label}"></span>
          <div class="planner-item-content">
            <h3 class="planner-item-title">${escapeHtml(idea.title)}</h3>
            <p class="planner-item-preview">${escapeHtml((idea.hook || '').slice(0, 120))}${(idea.hook || '').length > 120 ? '…' : ''}</p>
            <div class="planner-item-meta">
              <span class="planner-item-status-badge planner-item-status-badge--${status}">${cfg.label}</span>
              <span class="badge badge--pink">${getIconSvg('zap', { width: 12, height: 12 })} ${virality}</span>
              <span class="planner-item-date">${clockIcon} ${timeAgo(idea.createdAt)}</span>
            </div>
          </div>
          <div class="planner-item-actions">
            <button class="planner-action-btn action-edit" data-id="${idea.id}" title="View Details">${editIcon}</button>
            <div class="status-dropdown-wrapper">
              <select class="status-dropdown" data-id="${idea.id}">
                ${Object.entries(STATUS_CONFIG).map(([key, val]) =>
                  `<option value="${key}" ${key === status ? 'selected' : ''}>${val.label}</option>`
                ).join('')}
              </select>
            </div>
            <button class="planner-action-btn planner-action-btn--delete action-delete" data-id="${idea.id}" title="Delete">${trashIcon}</button>
          </div>
          <div class="planner-item-expanded" id="expanded-${idea.id}" style="display:none; width: 100%; margin-top: 16px; border-top: 1px solid var(--border-color); padding-top: 12px;">
            <div class="expanded-details" style="display:flex; flex-direction:column; gap:8px;">
              <p style="font-size:13px;line-height:1.5;margin:0;"><strong style="color:var(--text-primary);">Hook:</strong> ${escapeHtml(idea.hook || '')}</p>
              <p style="font-size:13px;line-height:1.5;margin:0;"><strong style="color:var(--text-primary);">Concept:</strong> ${escapeHtml(idea.concept || '')}</p>
              ${idea.hashtags ? `<p style="font-size:13px;line-height:1.5;margin:0;"><strong style="color:var(--text-primary);">Hashtags:</strong> <span style="color:var(--accent-pink);">${escapeHtml(Array.isArray(idea.hashtags) ? idea.hashtags.join(' ') : idea.hashtags)}</span></p>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach event listeners
    listEl.querySelectorAll('.status-dropdown').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        const newStatus = e.target.value;
        storage.updateIdea(id, { status: newStatus });
        showToast(`Status changed to ${STATUS_CONFIG[newStatus].label}`, 'success');
        renderIdeas();
      });
    });

    listEl.querySelectorAll('.action-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        if (confirm('Delete this idea?')) {
          storage.deleteIdea(id);
          showToast('Idea deleted', 'info');
          renderIdeas();
        }
      });
    });

    listEl.querySelectorAll('.action-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const expandedEl = document.getElementById(`expanded-${id}`);
        if (expandedEl) {
          expandedEl.style.display = expandedEl.style.display === 'none' ? 'block' : 'none';
        }
      });
    });
  }

  function renderScripts() {
    const scriptsEl = document.getElementById('scripts-list');
    const scripts = storage.getScripts();

    if (!scripts.length) {
      scriptsEl.innerHTML = '<p class="empty-msg">No scripts saved yet.</p>';
      return;
    }

    scriptsEl.innerHTML = scripts.map((script, i) => `
      <div class="glass-card script-item fadeInUp" data-script-idx="${i}" style="animation-delay:${i * 0.04}s">
        <div class="script-item-header">
          <h4 class="script-item-title">${escapeHtml(script.ideaTitle || 'Untitled Script')}</h4>
          <span class="planner-item-date">${clockIcon} ${timeAgo(script.createdAt)}</span>
        </div>
        <p class="script-item-preview">${escapeHtml((script.fullScript || '').slice(0, 150))}…</p>
        <div class="script-item-expanded" id="script-expanded-${i}" style="display:none;">
          <pre class="script-full-text">${escapeHtml(script.fullScript || '')}</pre>
        </div>
        <div class="script-item-actions">
          <button class="btn-secondary btn-sm toggle-script-btn" data-idx="${i}">${chevronIcon} Expand</button>
          <button class="btn-secondary btn-sm copy-script-btn" data-idx="${i}">${copyIcon} Copy</button>
          <button class="btn-icon delete-script-btn" data-idx="${i}">${trashIcon}</button>
        </div>
      </div>
    `).join('');

    // Toggle expand
    scriptsEl.querySelectorAll('.toggle-script-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.dataset.idx;
        const el = document.getElementById(`script-expanded-${idx}`);
        if (el) {
          const isHidden = el.style.display === 'none';
          el.style.display = isHidden ? 'block' : 'none';
          btn.innerHTML = `${chevronIcon} ${isHidden ? 'Collapse' : 'Expand'}`;
        }
      });
    });

    // Copy
    scriptsEl.querySelectorAll('.copy-script-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const script = scripts[idx];
        if (script) {
          navigator.clipboard.writeText(script.fullScript || '').then(() => showToast('Copied!', 'success'));
        }
      });
    });

    // Delete script
    scriptsEl.querySelectorAll('.delete-script-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        if (confirm('Delete this script?')) {
          const allScripts = storage.getScripts();
          allScripts.splice(idx, 1);
          // Re-save all scripts by clearing and re-saving
          // Since we don't have a deleteScript API, we work around it
          localStorage.setItem('clipgenius_scripts', JSON.stringify(allScripts));
          showToast('Script deleted', 'info');
          renderScripts();
        }
      });
    });
  }

  renderIdeas();
  renderScripts();
}
