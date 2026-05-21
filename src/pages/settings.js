import '../styles/settings.css';
import { storage } from '../services/storage.js';
import { fetchTrendingShorts } from '../services/youtube.js';
import { showToast } from '../components/toast.js';
import { getIconSvg } from '../services/icons.js';

const REGIONS = [
  { code: 'US', flag: '🇺🇸', label: 'US' },
  { code: 'GB', flag: '🇬🇧', label: 'UK' },
  { code: 'IN', flag: '🇮🇳', label: 'IN' },
  { code: 'BR', flag: '🇧🇷', label: 'BR' },
  { code: 'DE', flag: '🇩🇪', label: 'DE' },
  { code: 'FR', flag: '🇫🇷', label: 'FR' },
  { code: 'JP', flag: '🇯🇵', label: 'JP' },
  { code: 'KR', flag: '🇰🇷', label: 'KR' },
  { code: 'CA', flag: '🇨🇦', label: 'CA' },
  { code: 'AU', flag: '🇦🇺', label: 'AU' },
];

const NICHES = [
  { id: 'comedy', emoji: '😂', label: 'Comedy' },
  { id: 'gaming', emoji: '🎮', label: 'Gaming' },
  { id: 'motivation', emoji: '💪', label: 'Motivation' },
  { id: 'tech', emoji: '💻', label: 'Tech' },
  { id: 'cooking', emoji: '🍳', label: 'Cooking' },
  { id: 'education', emoji: '📚', label: 'Education' },
  { id: 'music', emoji: '🎵', label: 'Music' },
  { id: 'fitness', emoji: '🏋️', label: 'Fitness' },
  { id: 'finance', emoji: '💰', label: 'Finance' },
  { id: 'travel', emoji: '✈️', label: 'Travel' },
  { id: 'art', emoji: '🎨', label: 'Art' },
  { id: 'horror', emoji: '😱', label: 'Horror' },
  { id: 'ai-automation', emoji: '🤖', label: 'AI Automation' },
  { id: 'asmr', emoji: '🎧', label: 'ASMR' },
  { id: 'side-hustles', emoji: '💸', label: 'Side Hustles' },
  { id: 'storytelling', emoji: '📖', label: 'Storytelling' },
  { id: 'lifehacks', emoji: '💡', label: 'Life Hacks' },
  { id: 'selfcare', emoji: '🌸', label: 'Self Care' },
];

export function render(container) {
  const eyeIcon = getIconSvg('eye', { width: 16, height: 16 });
  const checkIcon = getIconSvg('check', { width: 14, height: 14 });
  const downloadIcon = getIconSvg('download', { width: 16, height: 16 });
  const uploadIcon = getIconSvg('upload', { width: 16, height: 16 });
  const trashIcon = getIconSvg('trash-2', { width: 16, height: 16 });
  const zapIcon = getIconSvg('zap', { width: 16, height: 16 });

  const settings = storage.getSettings();
  const currentRegion = settings.region || 'US';
  const currentNiches = new Set(settings.niches || []);
  const ytKey = storage.getApiKey('youtube') || '';
  const groqKey = storage.getApiKey('groq') || '';
  const ideasCount = storage.getIdeas().length;
  const scriptsCount = storage.getScripts().length;

  container.innerHTML = `
    <div class="settings-layout">
      <h1 class="gradient-text settings-title">Settings</h1>

      <!-- API Keys -->
      <div class="settings-section glass-card">
        <h2 class="settings-section-title">🔑 API Keys</h2>

        <div class="api-key-group">
          <label class="api-key-label">YouTube Data API Key</label>
          <p class="api-key-info">Get your free key at <a href="https://console.cloud.google.com/" target="_blank" rel="noopener">Google Cloud Console</a></p>
          <div class="api-key-input-row">
            <div class="input-wrapper">
              <input type="password" class="api-key-input" id="yt-api-key" value="${ytKey}" placeholder="Enter your YouTube API key" />
              <button class="btn-icon toggle-vis" id="toggle-yt-vis" title="Show/hide key">${eyeIcon}</button>
            </div>
            <button class="btn-secondary test-btn" id="test-yt-btn">${zapIcon} Test</button>
          </div>
          <div class="connection-status" id="yt-status"></div>
        </div>

        <div class="api-key-group">
          <label class="api-key-label">Groq API Key</label>
          <p class="api-key-info">Get your free key at <a href="https://groq.com/" target="_blank" rel="noopener">groq.com</a></p>
          <div class="api-key-input-row">
            <div class="input-wrapper">
              <input type="password" class="api-key-input" id="groq-api-key" value="${groqKey}" placeholder="Enter your Groq API key" />
              <button class="btn-icon toggle-vis" id="toggle-groq-vis" title="Show/hide key">${eyeIcon}</button>
            </div>
            <button class="btn-secondary test-btn" id="test-groq-btn">${zapIcon} Test</button>
          </div>
          <div class="connection-status" id="groq-status"></div>
        </div>
      </div>

      <!-- Default Region -->
      <div class="settings-section glass-card">
        <h2 class="settings-section-title">🌍 Default Region</h2>
        <div class="region-grid" id="region-grid">
          ${REGIONS.map(r => `
            <button class="chip region-chip ${r.code === currentRegion ? 'selected' : ''}" data-region="${r.code}">
              <span class="region-chip-flag">${r.flag}</span> ${r.label}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Content Niches -->
      <div class="settings-section glass-card">
        <h2 class="settings-section-title">🎯 Your Niches</h2>
        <div class="niche-grid" id="niche-grid">
          ${NICHES.map(n => `
            <button class="chip niche-grid-chip ${currentNiches.has(n.id) ? 'selected' : ''}" data-niche="${n.id}">
              <span class="niche-grid-chip-emoji">${n.emoji}</span> ${n.label}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- iPhone & Mobile App Integration -->
      <div class="settings-section glass-card">
        <h2 class="settings-section-title">📱 iPhone & Mobile App</h2>
        <div class="api-key-group">
          <label class="api-key-label">Remote API Server URL</label>
          <p class="api-key-info">Specify your deployed web server URL (e.g., <code>https://clipgenius.onrender.com</code>) to fetch Google Trends and generate scripts when running in a standalone iOS App wrapper. Leave blank to use local relative endpoints.</p>
          <div class="api-key-input-row">
            <div class="input-wrapper">
              <input type="url" class="api-key-input" id="remote-api-url" value="${settings.apiUrl || ''}" placeholder="https://your-app.onrender.com" />
            </div>
            <button class="btn-secondary test-btn" id="test-remote-btn">${zapIcon} Test</button>
          </div>
          <div class="connection-status" id="remote-status"></div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="settings-section glass-card">
        <h2 class="settings-section-title">💾 Data Management</h2>
        <p class="data-stats">${ideasCount} ideas, ${scriptsCount} scripts saved</p>
        <div class="data-actions">
          <button class="btn-secondary" id="export-btn">${downloadIcon} Export All Data</button>
          <button class="btn-secondary" id="import-btn">${uploadIcon} Import Data</button>
          <input type="file" id="import-file-input" accept=".json" style="display:none" />
          <button class="btn-secondary btn-danger" id="clear-btn">${trashIcon} Clear All Data</button>
        </div>
      </div>
    </div>
  `;

  // --- Toggle password visibility ---
  function setupToggle(toggleId, inputId) {
    document.getElementById(toggleId).addEventListener('click', () => {
      const input = document.getElementById(inputId);
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  }
  setupToggle('toggle-yt-vis', 'yt-api-key');
  setupToggle('toggle-groq-vis', 'groq-api-key');

  // --- Auto-save API keys on blur ---
  document.getElementById('yt-api-key').addEventListener('blur', (e) => {
    storage.setApiKey('youtube', e.target.value.trim());
    showToast('YouTube API key saved', 'success');
  });
  document.getElementById('groq-api-key').addEventListener('blur', (e) => {
    storage.setApiKey('groq', e.target.value.trim());
    showToast('Groq API key saved', 'success');
  });
  document.getElementById('remote-api-url').addEventListener('blur', (e) => {
    let val = e.target.value.trim();
    if (val && !/^https?:\/\//i.test(val)) {
      val = 'https://' + val;
      e.target.value = val;
    }
    storage.updateSettings({ apiUrl: val });
    showToast('Remote API Server URL saved', 'success');
  });

  // --- Test Remote API Connection ---
  document.getElementById('test-remote-btn').addEventListener('click', async () => {
    const url = document.getElementById('remote-api-url').value.trim();
    const statusEl = document.getElementById('remote-status');
    if (!url) {
      statusEl.innerHTML = `<span class="status-indicator error"><span class="status-dot-sm error"></span> No server URL provided</span>`;
      return;
    }
    statusEl.innerHTML = `<span class="status-indicator pending"><span class="spinner-sm"></span> Connecting...</span>`;
    try {
      const cleanUrl = url.replace(/\/$/, '');
      const resp = await fetch(`${cleanUrl}/api/trends?geo=US`);
      if (resp.ok) {
        statusEl.innerHTML = `<span class="status-indicator success"><span class="status-dot-sm success"></span> Connected successfully!</span>`;
        showToast('Remote API server connected successfully!', 'success');
      } else {
        throw new Error('API error');
      }
    } catch (err) {
      statusEl.innerHTML = `<span class="status-indicator error"><span class="status-dot-sm error"></span> Error: Connection failed. Ensure server is online and CORS is enabled.</span>`;
      showToast('Remote API connection failed', 'error');
    }
  });

  // --- Test YouTube Connection ---
  document.getElementById('test-yt-btn').addEventListener('click', async () => {
    const key = document.getElementById('yt-api-key').value.trim();
    const statusEl = document.getElementById('yt-status');
    if (!key) {
      statusEl.innerHTML = `<span class="status-indicator error"><span class="status-dot-sm error"></span> No key provided</span>`;
      return;
    }
    storage.setApiKey('youtube', key);
    statusEl.innerHTML = `<span class="status-indicator pending"><span class="spinner-sm"></span> Testing...</span>`;
    try {
      const result = await fetchTrendingShorts('US', key);
      if (result && result.length >= 0) {
        statusEl.innerHTML = `<span class="status-indicator success"><span class="status-dot-sm success"></span> Connected</span>`;
        showToast('YouTube connection successful!', 'success');
      }
    } catch (err) {
      statusEl.innerHTML = `<span class="status-indicator error"><span class="status-dot-sm error"></span> Error: Invalid key or quota exceeded</span>`;
      showToast('YouTube connection failed', 'error');
    }
  });

  // --- Test Groq Connection ---
  document.getElementById('test-groq-btn').addEventListener('click', async () => {
    const key = document.getElementById('groq-api-key').value.trim();
    const statusEl = document.getElementById('groq-status');
    if (!key) {
      statusEl.innerHTML = `<span class="status-indicator error"><span class="status-dot-sm error"></span> No key provided</span>`;
      return;
    }
    storage.setApiKey('groq', key);
    statusEl.innerHTML = `<span class="status-indicator pending"><span class="spinner-sm"></span> Testing...</span>`;
    try {
      const resp = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: key,
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: 'Say "ok"' }],
        }),
      });
      if (resp.ok) {
        statusEl.innerHTML = `<span class="status-indicator success"><span class="status-dot-sm success"></span> Connected</span>`;
        showToast('Groq connection successful!', 'success');
      } else {
        throw new Error('API error');
      }
    } catch (err) {
      statusEl.innerHTML = `<span class="status-indicator error"><span class="status-dot-sm error"></span> Error: Invalid key</span>`;
      showToast('Groq connection failed', 'error');
    }
  });

  // --- Region selection ---
  document.querySelectorAll('.region-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.region-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      storage.updateSettings({ region: chip.dataset.region });
      showToast(`Region set to ${chip.dataset.region}`, 'success');
    });
  });

  // --- Niche selection ---
  const selectedNiches = new Set(currentNiches);
  document.querySelectorAll('#niche-grid .niche-grid-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const niche = chip.dataset.niche;
      if (selectedNiches.has(niche)) {
        selectedNiches.delete(niche);
        chip.classList.remove('selected');
      } else {
        selectedNiches.add(niche);
        chip.classList.add('selected');
      }
      storage.updateSettings({ niches: [...selectedNiches] });
      showToast('Niches updated', 'success');
    });
  });

  // --- Export ---
  document.getElementById('export-btn').addEventListener('click', () => {
    const data = storage.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clipgenius-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported!', 'success');
  });

  // --- Import ---
  const importFileInput = document.getElementById('import-file-input');
  document.getElementById('import-btn').addEventListener('click', () => {
    importFileInput.click();
  });
  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        storage.importAll(ev.target.result);
        showToast('Data imported successfully!', 'success');
        // Re-render to reflect changes
        render(container);
      } catch (err) {
        showToast('Failed to import data. Invalid file format.', 'error');
      }
    };
    reader.readAsText(file);
  });

  // --- Clear All Data ---
  document.getElementById('clear-btn').addEventListener('click', () => {
    if (confirm('⚠️ Are you sure you want to clear ALL data? This action cannot be undone.')) {
      if (confirm('This will delete all ideas, scripts, and settings. Continue?')) {
        localStorage.clear();
        showToast('All data cleared', 'info');
        render(container);
      }
    }
  });
}
