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
  card.className = 'video-card';

  // ── Thumbnail Section ─────────────────────────────────────
  const thumbWrap = document.createElement('div');
  thumbWrap.className = 'video-card-thumb';

  const img = document.createElement('img');
  img.src = video.thumbnail;
  img.alt = video.title;
  img.loading = 'lazy';

  const durationBadge = document.createElement('span');
  durationBadge.className = 'video-card-duration';
  durationBadge.textContent = formatDuration(video.duration);

  const gradientOverlay = document.createElement('div');
  gradientOverlay.className = 'video-card-gradient';

  thumbWrap.appendChild(img);
  thumbWrap.appendChild(durationBadge);
  thumbWrap.appendChild(gradientOverlay);

  thumbWrap.addEventListener('click', () => {
    window.open(`https://youtube.com/shorts/${video.id}`, '_blank');
  });
  thumbWrap.style.cursor = 'pointer';

  card.appendChild(thumbWrap);

  // ── Info Section ──────────────────────────────────────────
  const info = document.createElement('div');
  info.className = 'video-card-info';

  const title = document.createElement('h3');
  title.className = 'video-card-title';
  title.textContent = video.title;

  const channel = document.createElement('p');
  channel.className = 'video-card-channel';
  channel.textContent = video.channelTitle;

  // Stats row
  const stats = document.createElement('div');
  stats.className = 'video-card-stats';

  const views = document.createElement('span');
  views.className = 'video-card-stat';
  views.innerHTML = createStatIcon('eye') + ' ' + formatCount(video.viewCount);

  const likes = document.createElement('span');
  likes.className = 'video-card-stat';
  likes.innerHTML = createStatIcon('heart') + ' ' + formatCount(video.likeCount);

  stats.appendChild(views);
  stats.appendChild(likes);

  info.appendChild(title);
  info.appendChild(channel);
  info.appendChild(stats);
  card.appendChild(info);

  // ── Actions Row ───────────────────────────────────────────
  const actions = document.createElement('div');
  actions.className = 'video-card-actions';

  const generateBtn = document.createElement('button');
  generateBtn.className = 'btn btn-primary btn-sm';
  generateBtn.textContent = '✨ Generate Idea';
  generateBtn.addEventListener('click', () => onGenerateIdea(video));

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
