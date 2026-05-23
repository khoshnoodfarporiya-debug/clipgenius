import '../styles/dashboard.css';
import { storage } from '../services/storage.js';
import { fetchTrendingShorts } from '../services/youtube.js';
import { fetchDailyTrends } from '../services/trends.js';
import { generateIdeas } from '../services/ai.js';
import { createIdeaCard } from '../components/ideaCard.js';
import { createTrendChip } from '../components/trendChip.js';
import { showToast } from '../components/toast.js';
import { getIconSvg } from '../services/icons.js';

function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function skeletonLine(width = '100%', height = '14px') {
  return `<div class="skeleton" style="width:${width};height:${height};border-radius:6px;margin-bottom:6px;"></div>`;
}

export function render(container) {
  const settings = storage.getSettings();
  const ytKey = storage.getApiKey('youtube');
  const groqKey = storage.getApiKey('groq');
  const keysMissing = !ytKey || !groqKey;

  const flameIcon = getIconSvg('flame', { width: 20, height: 20 });
  const trendIcon = getIconSvg('trending-up', { width: 20, height: 20 });
  const zapIcon = getIconSvg('zap', { width: 20, height: 20 });
  const starIcon = getIconSvg('star', { width: 20, height: 20 });
  const refreshIcon = getIconSvg('refresh-cw', { width: 16, height: 16 });
  const externalIcon = getIconSvg('external-link', { width: 14, height: 14 });

  // Build stats
  const ideas = storage.getIdeas();
  const scripts = storage.getScripts();
  const avgVirality = ideas.length
    ? (ideas.reduce((s, i) => s + (i.estimatedVirality || 0), 0) / ideas.length).toFixed(1)
    : 'N/A';
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = ideas.filter(i => new Date(i.createdAt || i.savedAt || 0).getTime() > oneWeekAgo).length;

  container.innerHTML = `
    ${keysMissing ? `
    <div class="welcome-onboarding-card">
      <h2>✨ Get Started with ClipGenius</h2>
      <p class="welcome-onboarding-card-desc">
        ClipGenius is fueled by high-performance social APIs and ultra-fast LLMs. Set up your free API keys below to unlock content brainstorming, script generation, and real-time trending dashboard metrics.
      </p>
      <div class="welcome-steps-container">
        <!-- Step 1: Groq Key -->
        <div class="welcome-step-card ${groqKey ? 'connected' : ''}">
          <div class="welcome-step-header">
            <div class="welcome-step-title-wrap">
              <span class="welcome-step-title">🧠 Groq Cloud AI <span style="font-size:12px;color:var(--text-muted);font-weight:normal;">(For Ideas & Scripts)</span></span>
              <p class="welcome-step-desc">Brainstorms viral concepts and writes engaging 30-60 second short-form video scripts instantly.</p>
            </div>
            <span class="welcome-step-badge ${groqKey ? 'connected' : 'pending'}">
              ${groqKey ? `${getIconSvg('check', { width: 12, height: 12 })} Connected` : '⏳ Pending'}
            </span>
          </div>
          <a href="https://console.groq.com/keys" target="_blank" rel="noopener" class="welcome-step-link">
            Get free Groq key ↗
          </a>
        </div>

        <!-- Step 2: YouTube Key -->
        <div class="welcome-step-card ${ytKey ? 'connected' : ''}">
          <div class="welcome-step-header">
            <div class="welcome-step-title-wrap">
              <span class="welcome-step-title">📺 YouTube Data API <span style="font-size:12px;color:var(--text-muted);font-weight:normal;">(For Trending Shorts)</span></span>
              <p class="welcome-step-desc">Scrapes and indexes the most popular daily YouTube Shorts in your target region to spark concepts.</p>
            </div>
            <span class="welcome-step-badge ${ytKey ? 'connected' : 'pending'}">
              ${ytKey ? `${getIconSvg('check', { width: 12, height: 12 })} Connected` : '⏳ Pending'}
            </span>
          </div>
          <a href="https://console.cloud.google.com/" target="_blank" rel="noopener" class="welcome-step-link">
            Get free YouTube key ↗
          </a>
        </div>
      </div>
      <a href="#settings" class="onboarding-cta-btn btn-primary">
        ${getIconSvg('settings', { width: 16, height: 16 })} Connect API Keys in Settings
      </a>
    </div>
    ` : ''}
    <div class="dashboard-grid">
      <!-- Hot Right Now -->
      <div class="widget-card hot-right-now" style="animation-delay:0s">
        <div class="widget-header">
          <span class="widget-title">${flameIcon} Hot Right Now</span>
          <button class="btn-icon" id="refresh-hot">${refreshIcon}</button>
        </div>
        <div class="hot-now-list" id="hot-now-list">
          ${Array(5).fill(0).map(() => `
            <div class="hot-now-item">
              ${skeletonLine('48px', '48px')}
              <div style="flex:1">${skeletonLine('70%')}${skeletonLine('40%', '12px')}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Trending Topics -->
      <div class="widget-card" style="animation-delay:0.08s">
        <div class="widget-header">
          <span class="widget-title">${trendIcon} Trending Topics</span>
        </div>
        <div class="trend-chips-container" id="trend-chips-container">
          ${Array(8).fill(0).map(() => skeletonLine('90px', '32px')).join('')}
        </div>
      </div>

      <!-- Quick Idea Generator -->
      <div class="widget-card" style="animation-delay:0.16s">
        <div class="widget-header">
          <span class="widget-title">${zapIcon} Quick Idea</span>
        </div>
        <div class="quick-idea-body">
          <button class="btn-primary generate-random-btn" id="generate-random-btn">⚡ Generate Random Idea</button>
          <div id="quick-idea-result"></div>
        </div>
      </div>

      <!-- Your Stats -->
      <div class="widget-card" style="animation-delay:0.24s">
        <div class="widget-header">
          <span class="widget-title">${starIcon} Your Stats</span>
        </div>
        <div class="stats-grid">
          <div class="stat-box">
            <span class="stat-emoji">💡</span>
            <span class="stat-value">${ideas.length}</span>
            <span class="stat-label">Ideas Saved</span>
          </div>
          <div class="stat-box">
            <span class="stat-emoji">✍️</span>
            <span class="stat-value">${scripts.length}</span>
            <span class="stat-label">Scripts Written</span>
          </div>
          <div class="stat-box">
            <span class="stat-emoji">🔥</span>
            <span class="stat-value">${avgVirality}</span>
            <span class="stat-label">Avg Virality</span>
          </div>
          <div class="stat-box">
            <span class="stat-emoji">📅</span>
            <span class="stat-value">${thisWeek}</span>
            <span class="stat-label">This Week</span>
          </div>
        </div>
      </div>

      <!-- Product Intelligence Hub -->
      <div class="widget-card product-intelligence-card" style="animation-delay:0.32s">
        <div class="widget-header">
          <span class="widget-title">${getIconSvg('brain', { width: 20, height: 20 })} Product Intelligence</span>
          <button class="btn-icon" id="refresh-product-intel">${refreshIcon}</button>
        </div>
        <div class="product-intel-grid" id="product-intel-grid">
          <div class="product-intel-stat">
            <span class="product-intel-value" id="pi-total-products">—</span>
            <span class="product-intel-label">Products Sourced</span>
          </div>
          <div class="product-intel-stat">
            <span class="product-intel-value" id="pi-platforms">—</span>
            <span class="product-intel-label">Active Platforms</span>
          </div>
          <div class="product-intel-stat">
            <span class="product-intel-value" id="pi-profitability">—</span>
            <span class="product-intel-label">Avg Profit Score</span>
          </div>
          <div class="product-intel-stat">
            <span class="product-intel-value" id="pi-sweeps">—</span>
            <span class="product-intel-label">Total Sweeps</span>
          </div>
        </div>
        <div class="product-intel-platforms" id="pi-top-platforms"></div>
      </div>
    </div>
  `;

  // --- Data loading ---
  let trendingTopics = [];

  // Load Hot Right Now
  async function loadHotNow() {
    const listEl = document.getElementById('hot-now-list');
    if (!ytKey) {
      listEl.innerHTML = `<p class="empty-msg">Set up your YouTube API key in <a href="#settings">Settings</a></p>`;
      return;
    }
    listEl.innerHTML = Array(5).fill(0).map(() => `
      <div class="hot-now-item">
        ${skeletonLine('48px', '48px')}
        <div style="flex:1">${skeletonLine('70%')}${skeletonLine('40%', '12px')}</div>
      </div>
    `).join('');

    try {
      const videos = await fetchTrendingShorts(settings.region || 'US', ytKey);
      const top5 = videos.slice(0, 5);
      if (!top5.length) {
        listEl.innerHTML = `<p class="empty-msg">No shorts found for this region.</p>`;
        return;
      }
      listEl.innerHTML = top5.map(v => `
        <div class="hot-now-item">
          <img class="hot-now-thumb" src="${v.thumbnail}" alt="${v.title}" />
          <div class="hot-now-info">
            <span class="hot-now-title" title="${v.title}">${v.title}</span>
            <span class="hot-now-views">${getIconSvg('eye', { width: 12, height: 12 })} ${formatNumber(Number(v.viewCount))}</span>
          </div>
          <a href="https://youtube.com/shorts/${v.id}" target="_blank" rel="noopener" class="hot-now-link">${externalIcon}</a>
        </div>
      `).join('');
    } catch (err) {
      listEl.innerHTML = `<p class="empty-msg">Failed to load trending videos. Check your API key.</p>`;
    }
  }

  // Load Trending Topics
  async function loadTrends() {
    const chipsEl = document.getElementById('trend-chips-container');
    chipsEl.innerHTML = Array(8).fill(0).map(() => skeletonLine('90px', '32px')).join('');
    try {
      const trends = await fetchDailyTrends(settings.region || 'US');
      trendingTopics = trends;
      chipsEl.innerHTML = '';
      trends.slice(0, 12).forEach(t => {
        const chip = createTrendChip(t, () => {
          window.location.hash = '#generator?topic=' + encodeURIComponent(t.title);
        });
        chipsEl.appendChild(chip);
      });
    } catch (err) {
      chipsEl.innerHTML = `<p class="empty-msg">Failed to load trends.</p>`;
    }
  }

  // Quick Idea Generator
  const genBtn = document.getElementById('generate-random-btn');
  genBtn.addEventListener('click', async () => {
    if (!groqKey) {
      showToast('Set up your Groq API key in Settings first', 'error');
      return;
    }
    genBtn.disabled = true;
    genBtn.textContent = '⏳ Generating...';
    const resultEl = document.getElementById('quick-idea-result');
    resultEl.innerHTML = `<div class="skeleton" style="width:100%;height:140px;border-radius:12px;"></div>`;

    try {
      const topicPool = trendingTopics.length
        ? trendingTopics.map(t => t.title)
        : ['funny fails', 'life hacks', 'motivation', 'tech tips'];
      const randomTopic = topicPool[Math.floor(Math.random() * topicPool.length)];
      const ideas = await generateIdeas(randomTopic, topicPool.slice(0, 5), groqKey);
      const idea = ideas[Math.floor(Math.random() * ideas.length)];
      resultEl.innerHTML = '';
      const card = createIdeaCard(idea, {
        onSave: () => { storage.saveIdea({ ...idea, createdAt: new Date().toISOString() }); showToast('Idea saved!', 'success'); },
        onGenerateScript: () => { window.location.hash = '#generator'; },
        onDelete: () => { resultEl.innerHTML = ''; }
      });
      resultEl.appendChild(card);
    } catch (err) {
      resultEl.innerHTML = `<p class="empty-msg">Failed to generate idea. Please try again.</p>`;
      showToast('Generation failed', 'error');
    } finally {
      genBtn.disabled = false;
      genBtn.textContent = '⚡ Generate Random Idea';
    }
  });

  // Refresh button
  document.getElementById('refresh-hot').addEventListener('click', loadHotNow);

  // ── Product Intelligence Hub ──
  async function loadProductIntel() {
    try {
      const resp = await fetch('http://localhost:3001/api/products/stats');
      const data = await resp.json();

      const el = (id) => document.getElementById(id);

      // Animate value updates
      const animateValue = (element, target) => {
        if (element) {
          element.style.opacity = '0';
          element.style.transform = 'translateY(4px)';
          setTimeout(() => {
            element.textContent = target;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
          }, 150);
        }
      };

      animateValue(el('pi-total-products'), formatNumber(data.totalProducts || 0));
      animateValue(el('pi-platforms'), String(data.totalPlatforms || 0));
      animateValue(el('pi-profitability'), data.avgProfitability ? data.avgProfitability.toFixed(1) : '0');
      animateValue(el('pi-sweeps'), String(data.totalSweeps || 0));

      // Render top platforms as mini badges
      const platformsEl = el('pi-top-platforms');
      if (platformsEl && data.topPlatforms && data.topPlatforms.length > 0) {
        platformsEl.innerHTML = data.topPlatforms
          .map(p => `<span class="pi-platform-badge">${p.platform} <strong>${p.count}</strong></span>`)
          .join('');
      } else if (platformsEl) {
        platformsEl.innerHTML = '<span class="pi-no-data">No product data yet — run a sweep to populate</span>';
      }
    } catch (err) {
      // Silently fail if proxy is not running
      const piGrid = document.getElementById('pi-top-platforms');
      if (piGrid) {
        piGrid.innerHTML = '<span class="pi-no-data">Product Agent offline — start the proxy server</span>';
      }
    }
  }

  document.getElementById('refresh-product-intel').addEventListener('click', loadProductIntel);

  // Kick off data loading
  loadHotNow();
  loadTrends();
  loadProductIntel();
}
