import { getIconSvg } from '../services/icons.js';

/**
 * Format a number into a compact string (1K, 1.2M, etc.)
 */
function formatCount(num) {
  const n = Number(num) || 0;
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

/**
 * Format duration in seconds to M:SS
 */
function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Creates a video card element for a trending short.
 * @param {{ id, title, channelTitle, thumbnail, viewCount, likeCount, commentCount, publishedAt, duration }} video
 * @param {function} onGenerateIdea - Called with the video object
 * @returns {HTMLElement}
 */
export function createVideoCard(video, onGenerateIdea) {
  const card = document.createElement('div');
  card.className = 'video-card animate-fadeInUp';

  // ── Thumbnail Section ─────────────────────────────────────
  const thumbWrapper = document.createElement('div');
  thumbWrapper.className = 'video-thumbnail-wrapper';

  const img = document.createElement('img');
  img.className = 'video-thumbnail';
  img.src = video.thumbnail;
  img.alt = video.title;
  img.loading = 'lazy';

  const overlay = document.createElement('div');
  overlay.className = 'video-overlay';

  const overlayTop = document.createElement('div');
  overlayTop.className = 'video-overlay-top';

  const durationBadge = document.createElement('span');
  durationBadge.className = 'video-duration';
  durationBadge.textContent = formatDuration(video.duration);

  const platformBadge = document.createElement('span');
  platformBadge.className = 'video-platform-badge video-platform-badge--youtube';
  platformBadge.textContent = 'Shorts';

  overlayTop.appendChild(durationBadge);
  overlayTop.appendChild(platformBadge);

  const playBtn = document.createElement('div');
  playBtn.className = 'video-play-btn';
  playBtn.innerHTML = getIconSvg('play', { class: 'play-icon' });

  thumbWrapper.appendChild(img);
  thumbWrapper.appendChild(overlay);
  thumbWrapper.appendChild(overlayTop);
  thumbWrapper.appendChild(playBtn);

  thumbWrapper.addEventListener('click', () => {
    window.open(`https://youtube.com/shorts/${video.id}`, '_blank');
  });
  thumbWrapper.style.cursor = 'pointer';

  card.appendChild(thumbWrapper);

  // ── Info Section ──────────────────────────────────────────
  const info = document.createElement('div');
  info.className = 'video-info';

  const title = document.createElement('h3');
  title.className = 'video-title';
  title.textContent = video.title;

  const channel = document.createElement('div');
  channel.className = 'video-channel';

  const channelAvatar = document.createElement('div');
  channelAvatar.className = 'video-channel-avatar';
  channelAvatar.innerHTML = `<span style="font-size:10px;display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);">👤</span>`;

  const channelName = document.createElement('span');
  channelName.textContent = video.channelTitle;

  channel.appendChild(channelAvatar);
  channel.appendChild(channelName);

  // Stats row
  const stats = document.createElement('div');
  stats.className = 'video-stats';

  const views = document.createElement('span');
  views.className = 'video-stat';
  views.innerHTML = createStatIcon('eye') + ' ' + formatCount(video.viewCount);

  const likes = document.createElement('span');
  likes.className = 'video-stat';
  likes.innerHTML = createStatIcon('heart') + ' ' + formatCount(video.likeCount);

  stats.appendChild(views);
  stats.appendChild(likes);

  info.appendChild(title);
  info.appendChild(channel);
  info.appendChild(stats);
  card.appendChild(info);

  // ── Actions Row ───────────────────────────────────────────
  const actions = document.createElement('div');
  actions.className = 'video-actions';

  const generateBtn = document.createElement('button');
  generateBtn.className = 'generate-btn';
  generateBtn.innerHTML = `✨ Generate Idea`;
  generateBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onGenerateIdea(video);
  });

  actions.appendChild(generateBtn);
  card.appendChild(actions);

  return card;
}

/**
 * Creates a tiny inline SVG icon string for stats.
 */
function createStatIcon(name) {
  return getIconSvg(name, { width: 14, height: 14, class: 'stat-icon' });
}

