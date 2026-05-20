import '../styles/trending.css';
import { storage } from '../services/storage.js';
import { fetchTrendingShorts } from '../services/youtube.js';
import { createVideoCard } from '../components/videoCard.js';
import { showToast } from '../components/toast.js';
import { getIconSvg } from '../services/icons.js';

function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

const REGIONS = [
  { code: 'US', label: '🇺🇸 United States' },
  { code: 'GB', label: '🇬🇧 United Kingdom' },
  { code: 'IN', label: '🇮🇳 India' },
  { code: 'BR', label: '🇧🇷 Brazil' },
  { code: 'DE', label: '🇩🇪 Germany' },
  { code: 'FR', label: '🇫🇷 France' },
  { code: 'JP', label: '🇯🇵 Japan' },
  { code: 'KR', label: '🇰🇷 South Korea' },
];

export function render(container) {
  const refreshIcon = getIconSvg('refresh-cw', { width: 16, height: 16 });
  const globeIcon = getIconSvg('globe', { width: 18, height: 18 });
  const settings = storage.getSettings();
  const defaultRegion = settings.region || 'US';

  container.innerHTML = `
    <div class="trending-header">
      <h1 class="gradient-text">Trending Shorts</h1>
      <div class="trending-controls">
        <div class="region-select-wrapper">
          ${globeIcon}
          <select class="region-select" id="region-select">
            ${REGIONS.map(r => `<option value="${r.code}" ${r.code === defaultRegion ? 'selected' : ''}>${r.label}</option>`).join('')}
          </select>
          <span class="select-chevron">${getIconSvg('chevron-down', { width: 14, height: 14 })}</span>
        </div>
        <button class="btn-icon" id="refresh-trending" title="Refresh">${refreshIcon}</button>
      </div>
    </div>
    <div class="video-grid" id="video-grid">
      ${buildSkeletons(12)}
    </div>
  `;

  const gridEl = document.getElementById('video-grid');
  const regionSelect = document.getElementById('region-select');

  async function loadVideos() {
    const apiKey = storage.getApiKey('youtube');
    const region = regionSelect.value;

    gridEl.innerHTML = buildSkeletons(12);

    if (!apiKey) {
      gridEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${getIconSvg('settings', { width: 48, height: 48 })}</div>
          <p>Add your YouTube API key in <a href="#settings">Settings</a> to see trending content.</p>
        </div>
      `;
      return;
    }

    try {
      const videos = await fetchTrendingShorts(region, apiKey);
      if (!videos.length) {
        gridEl.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">${getIconSvg('search', { width: 48, height: 48 })}</div>
            <p>No shorts found for this region.</p>
          </div>
        `;
        return;
      }
      gridEl.innerHTML = '';
      videos.forEach((video, i) => {
        const card = createVideoCard(video, (v) => {
          window.location.hash = '#generator?topic=' + encodeURIComponent(v.title);
        });
        card.style.animationDelay = `${i * 0.05}s`;
        card.classList.add('fadeInUp');
        gridEl.appendChild(card);
      });
    } catch (err) {
      gridEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${getIconSvg('x', { width: 48, height: 48 })}</div>
          <p>Failed to load trending videos. Check your API key.</p>
        </div>
      `;
      showToast('Failed to load videos', 'error');
    }
  }

  regionSelect.addEventListener('change', loadVideos);
  document.getElementById('refresh-trending').addEventListener('click', loadVideos);

  loadVideos();
}

function buildSkeletons(count) {
  return Array(count).fill(0).map(() => `
    <div class="video-card skeleton">
      <div class="skeleton" style="width:100%;aspect-ratio:9/16;border-radius:12px;"></div>
      <div style="padding:12px;">
        <div class="skeleton" style="width:85%;height:14px;border-radius:6px;margin-bottom:8px;"></div>
        <div class="skeleton" style="width:55%;height:12px;border-radius:6px;margin-bottom:6px;"></div>
        <div class="skeleton" style="width:40%;height:12px;border-radius:6px;"></div>
      </div>
    </div>
  `).join('');
}
