import '../styles/generator.css';
import { storage } from '../services/storage.js';
import { fetchDailyTrends } from '../services/trends.js';
import { generateIdeas, generateScript, remixMeme } from '../services/ai.js';
import { createIdeaCard } from '../components/ideaCard.js';
import { showToast } from '../components/toast.js';
import { getIconSvg } from '../services/icons.js';

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
];

export function render(container) {
  const sparklesIcon = getIconSvg('sparkles', { width: 20, height: 20 });
  const shuffleIcon = getIconSvg('shuffle', { width: 16, height: 16 });
  const copyIcon = getIconSvg('copy', { width: 14, height: 14 });
  const saveIcon = getIconSvg('save', { width: 14, height: 14 });
  const downloadIcon = getIconSvg('download', { width: 14, height: 14 });
  const brainIcon = getIconSvg('brain', { width: 20, height: 20 });
  const wandIcon = getIconSvg('wand-2', { width: 16, height: 16 });

  const settings = storage.getSettings();
  const savedNiches = settings.niches || [];
  const groqKey = storage.getApiKey('groq');

  // Parse URL hash for pre-selected topic
  const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const preselectedTopic = hashParams.get('topic') || '';

  container.innerHTML = `
    <div class="generator-layout">
      <!-- Left Panel: Controls -->
      <div class="generator-controls">
        <div class="glass-card control-section">
          <h3 class="control-title">${sparklesIcon} Select Your Niches</h3>
          <div class="niche-selector" id="niche-selector">
            ${NICHES.map(n => `
              <button class="chip niche-chip ${savedNiches.includes(n.id) ? 'selected' : ''}" data-niche="${n.id}">
                ${n.emoji} ${n.label}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="glass-card control-section">
          <h3 class="control-title">${getIconSvg('trending-up', { width: 20, height: 20 })} Trending Topic</h3>
          <div class="trend-picker" id="trend-picker">
            <div class="trend-picker-list" id="trend-picker-list">
              <div class="skeleton" style="width:100%;height:120px;border-radius:8px;"></div>
            </div>
            <div class="custom-topic-row">
              <span>Or type your own:</span>
              <input type="text" class="custom-topic-input" id="custom-topic" placeholder="Enter a topic..." value="${preselectedTopic}" />
            </div>
          </div>
        </div>

        <button class="btn-primary generate-cta" id="generate-btn" ${!groqKey ? 'disabled' : ''}>
          ✨ Generate 5 Ideas
        </button>
        ${!groqKey ? '<p class="key-notice">⚠️ Add your <a href="#settings">Groq API key</a> to generate ideas.</p>' : ''}

        <div class="glass-card control-section meme-remixer">
          <h3 class="control-title">${shuffleIcon} Meme Remixer</h3>
          <input type="text" class="meme-input" id="meme-input" placeholder="Enter a trending meme or format..." />
          <button class="btn-secondary remix-btn" id="remix-btn">${wandIcon} 🔀 Remix It</button>
          <div id="remix-results"></div>
        </div>
      </div>

      <!-- Right Panel: Results -->
      <div class="generator-results">
        <div class="ideas-grid" id="ideas-grid"></div>
        <div class="script-editor" id="script-editor" style="display:none;">
          <div class="glass-card script-card">
            <h3 class="control-title">${brainIcon} Generated Script</h3>
            <div class="script-sections" id="script-sections"></div>
            <div class="script-full">
              <label class="script-label">Full Script (editable)</label>
              <textarea class="script-textarea" id="script-textarea" rows="10"></textarea>
            </div>
            <div class="script-actions">
              <button class="btn-secondary" id="copy-script-btn">${copyIcon} Copy</button>
              <button class="btn-primary" id="save-script-btn">${saveIcon} Save Script</button>
              <button class="btn-secondary" id="download-script-btn">${downloadIcon} Download .txt</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // --- Niche selector logic ---
  const selectedNiches = new Set(savedNiches);
  document.querySelectorAll('.niche-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const niche = chip.dataset.niche;
      if (selectedNiches.has(niche)) {
        selectedNiches.delete(niche);
        chip.classList.remove('selected');
      } else {
        selectedNiches.add(niche);
        chip.classList.add('selected');
      }
    });
  });

  // --- Load trending topics for picker ---
  let selectedTrend = preselectedTopic;
  async function loadTrendPicker() {
    const listEl = document.getElementById('trend-picker-list');
    try {
      const trends = await fetchDailyTrends(settings.region || 'US');
      listEl.innerHTML = '';
      trends.slice(0, 10).forEach(t => {
        const chip = document.createElement('button');
        chip.className = `chip trend-pick-chip ${t.title === preselectedTopic ? 'selected' : ''}`;
        chip.textContent = t.title;
        chip.addEventListener('click', () => {
          listEl.querySelectorAll('.trend-pick-chip').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          selectedTrend = t.title;
          document.getElementById('custom-topic').value = '';
        });
        listEl.appendChild(chip);
      });
    } catch {
      listEl.innerHTML = '<p class="empty-msg">Could not load trends.</p>';
    }
  }
  loadTrendPicker();

  // Custom topic input clears trend selection
  document.getElementById('custom-topic').addEventListener('input', (e) => {
    if (e.target.value) {
      document.querySelectorAll('.trend-pick-chip').forEach(c => c.classList.remove('selected'));
      selectedTrend = e.target.value;
    }
  });

  // --- Generate Ideas ---
  const genBtn = document.getElementById('generate-btn');
  let currentIdeas = [];
  let currentScriptIdea = null;

  genBtn.addEventListener('click', async () => {
    if (!groqKey) {
      showToast('Add your Groq API key in Settings first', 'error');
      return;
    }
    const niches = [...selectedNiches];
    if (!niches.length) {
      showToast('Select at least one niche', 'error');
      return;
    }

    const topic = document.getElementById('custom-topic').value || selectedTrend || '';
    const trendingTopics = topic ? [topic] : ['trending'];

    genBtn.disabled = true;
    genBtn.innerHTML = '<span class="spinner"></span> Generating...';
    const ideasGrid = document.getElementById('ideas-grid');
    ideasGrid.innerHTML = Array(5).fill(0).map(() =>
      `<div class="skeleton" style="width:100%;height:180px;border-radius:16px;"></div>`
    ).join('');

    try {
      const niche = niches.join(', ');
      const ideas = await generateIdeas(niche, trendingTopics, groqKey);
      currentIdeas = ideas;
      ideasGrid.innerHTML = '';

      ideas.forEach((idea, i) => {
        const card = createIdeaCard(idea, {
          onSave: () => {
            storage.saveIdea({ ...idea, createdAt: new Date().toISOString(), status: 'idea' });
            showToast('Idea saved!', 'success');
          },
          onGenerateScript: () => handleGenerateScript(idea),
          onDelete: () => {
            card.remove();
          }
        });
        card.style.animationDelay = `${i * 0.1}s`;
        card.classList.add('fadeInUp');
        ideasGrid.appendChild(card);
      });
    } catch (err) {
      ideasGrid.innerHTML = '<p class="empty-msg">Failed to generate ideas. Please try again.</p>';
      showToast('Generation failed', 'error');
    } finally {
      genBtn.disabled = false;
      genBtn.innerHTML = '✨ Generate 5 Ideas';
    }
  });

  // --- Generate Script ---
  async function handleGenerateScript(idea) {
    if (!groqKey) {
      showToast('Add your Groq API key in Settings first', 'error');
      return;
    }
    currentScriptIdea = idea;
    const editorEl = document.getElementById('script-editor');
    editorEl.style.display = 'block';
    const sectionsEl = document.getElementById('script-sections');
    const textareaEl = document.getElementById('script-textarea');

    sectionsEl.innerHTML = `
      <div class="skeleton" style="width:100%;height:60px;border-radius:8px;margin-bottom:8px;"></div>
      <div class="skeleton" style="width:100%;height:100px;border-radius:8px;margin-bottom:8px;"></div>
      <div class="skeleton" style="width:100%;height:60px;border-radius:8px;"></div>
    `;
    textareaEl.value = '';

    try {
      const script = await generateScript(idea, groqKey);
      sectionsEl.innerHTML = `
        <div class="script-section">
          <label class="script-label">🎣 Hook</label>
          <p class="script-section-text">${escapeHtml(script.hook)}</p>
        </div>
        <div class="script-section">
          <label class="script-label">📝 Body</label>
          <p class="script-section-text">${escapeHtml(script.body)}</p>
        </div>
        <div class="script-section">
          <label class="script-label">📢 CTA</label>
          <p class="script-section-text">${escapeHtml(script.cta)}</p>
        </div>
      `;

      // Typing animation for full script
      const fullText = script.fullScript;
      textareaEl.value = '';
      let idx = 0;
      const typingInterval = setInterval(() => {
        if (idx < fullText.length) {
          textareaEl.value += fullText[idx];
          idx++;
          textareaEl.scrollTop = textareaEl.scrollHeight;
        } else {
          clearInterval(typingInterval);
        }
      }, 12);

      editorEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      sectionsEl.innerHTML = '<p class="empty-msg">Failed to generate script.</p>';
      showToast('Script generation failed', 'error');
    }
  }

  // Script actions
  document.getElementById('copy-script-btn').addEventListener('click', () => {
    const text = document.getElementById('script-textarea').value;
    navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!', 'success'));
  });

  document.getElementById('save-script-btn').addEventListener('click', () => {
    const text = document.getElementById('script-textarea').value;
    if (!text) return;
    storage.saveScript({
      ideaTitle: currentScriptIdea?.title || 'Untitled',
      fullScript: text,
      createdAt: new Date().toISOString()
    });
    showToast('Script saved!', 'success');
  });

  document.getElementById('download-script-btn').addEventListener('click', () => {
    const text = document.getElementById('script-textarea').value;
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Script downloaded!', 'success');
  });

  // --- Meme Remixer ---
  document.getElementById('remix-btn').addEventListener('click', async () => {
    const memeInput = document.getElementById('meme-input').value.trim();
    if (!memeInput) {
      showToast('Enter a meme or format to remix', 'error');
      return;
    }
    if (!groqKey) {
      showToast('Add your Groq API key in Settings first', 'error');
      return;
    }
    const resultsEl = document.getElementById('remix-results');
    const remixBtn = document.getElementById('remix-btn');
    remixBtn.disabled = true;
    remixBtn.innerHTML = '<span class="spinner"></span> Remixing...';
    resultsEl.innerHTML = '<div class="skeleton" style="width:100%;height:100px;border-radius:8px;"></div>';

    try {
      const niches = [...selectedNiches];
      const niche = niches.length ? niches.join(', ') : 'general';
      const remixes = await remixMeme(memeInput, niche, groqKey);
      resultsEl.innerHTML = remixes.map(r => `
        <div class="glass-card remix-card fadeInUp">
          <h4 class="remix-twist">🔀 ${escapeHtml(r.twist)}</h4>
          <p class="remix-concept">${escapeHtml(r.concept)}</p>
          <p class="remix-script">${escapeHtml(r.script)}</p>
        </div>
      `).join('');
    } catch {
      resultsEl.innerHTML = '<p class="empty-msg">Failed to remix. Try again.</p>';
      showToast('Remix failed', 'error');
    } finally {
      remixBtn.disabled = false;
      remixBtn.innerHTML = `${wandIcon} 🔀 Remix It`;
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
