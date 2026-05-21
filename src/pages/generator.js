import '../styles/generator.css';
import { storage } from '../services/storage.js';
import { fetchDailyTrends } from '../services/trends.js';
import { generateIdeas, generateScript, remixMeme, generateHooks, optimizeSEO } from '../services/ai.js';
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
  { id: 'ai-automation', emoji: '🤖', label: 'AI Automation' },
  { id: 'asmr', emoji: '🎧', label: 'ASMR' },
  { id: 'side-hustles', emoji: '💸', label: 'Side Hustles' },
  { id: 'storytelling', emoji: '📖', label: 'Storytelling' },
  { id: 'lifehacks', emoji: '💡', label: 'Life Hacks' },
  { id: 'selfcare', emoji: '🌸', label: 'Self Care' },
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

  // Pre-generate niches HTML for all panels to avoid nested backslashes issue
  const nichesHtml = NICHES.map(n => `
    <button class="chip niche-chip ${savedNiches.includes(n.id) ? 'selected' : ''}" data-niche="${n.id}">
      <span class="niche-chip-emoji">${n.emoji}</span> ${n.label}
    </button>
  `).join('');

  container.innerHTML = `
    <div class="generator-layout animate-fadeInUp">
      <!-- Left Panel: Controls with Segmented Switcher -->
      <div class="generator-controls">
        <!-- Glass Segmented Tab Switcher -->
        <div class="glass-card generator-tabs-card">
          <div class="generator-tabs">
            <button class="gen-tab-btn active" data-tab="ideas">💡 Ideas</button>
            <button class="gen-tab-btn" data-tab="memes">🎭 Memes</button>
            <button class="gen-tab-btn" data-tab="hooks">🎣 Hooks</button>
            <button class="gen-tab-btn" data-tab="seo">🔍 SEO</button>
          </div>
        </div>

        <!-- Tab 1: Ideas Controls -->
        <div class="control-pane active" id="pane-ideas">
          <div class="glass-card generator-control-section">
            <h3 class="generator-control-title">${sparklesIcon} Select Your Niches</h3>
            <div class="niche-selector">
              ${nichesHtml}
            </div>
          </div>

          <div class="glass-card generator-control-section">
            <h3 class="generator-control-title">${getIconSvg('trending-up', { width: 20, height: 20 })} Trending Topic</h3>
            <div class="trend-picker">
              <div class="trend-picker-list" id="trend-picker-list">
                <div class="skeleton" style="width:100%;height:120px;border-radius:8px;"></div>
              </div>
              <div class="custom-topic-row">
                <span>Or type your own:</span>
                <input type="text" class="custom-topic-input" id="custom-topic" placeholder="Enter a topic..." value="${preselectedTopic}" />
              </div>
            </div>
          </div>

          <div class="glass-card generator-control-section">
            <h3 class="generator-control-title">${getIconSvg('clock', { width: 20, height: 20 })} Dynamic Idea Count</h3>
            <div class="segmented-pill count-selector">
              <button class="count-btn active" data-count="5">5</button>
              <button class="count-btn" data-count="10">10</button>
              <button class="count-btn" data-count="15">15</button>
            </div>
          </div>

          <button class="btn-primary generate-cta" id="generate-btn" ${!groqKey ? 'disabled' : ''}>
            ✨ Generate 5 Ideas
          </button>
          ${!groqKey ? '<p class="key-notice">⚠️ Add your <a href="#settings">Groq API key</a> in Settings to generate.</p>' : ''}
        </div>

        <!-- Tab 2: Memes Controls -->
        <div class="control-pane" id="pane-memes">
          <div class="glass-card generator-control-section">
            <h3 class="generator-control-title">${sparklesIcon} Select Your Niches</h3>
            <div class="niche-selector">
              ${nichesHtml}
            </div>
          </div>

          <div class="glass-card generator-control-section">
            <h3 class="generator-control-title">${shuffleIcon} Meme Remixer</h3>
            <div class="custom-topic-row" style="margin-top: 0;">
              <input type="text" class="meme-input custom-topic-input" id="meme-input" placeholder="Enter a trending meme format..." style="margin-bottom: 12px;" />
            </div>
            <button class="btn-secondary remix-btn" id="remix-btn" style="width: 100%;">${wandIcon} Remix It</button>
          </div>
        </div>

        <!-- Tab 3: Hooks Controls -->
        <div class="control-pane" id="pane-hooks">
          <div class="glass-card generator-control-section">
            <h3 class="generator-control-title">${getIconSvg('edit', { width: 20, height: 20 })} Video Concept</h3>
            <div class="custom-topic-row" style="margin-top: 0;">
              <textarea class="custom-topic-input concept-textarea" id="hook-concept-input" placeholder="Describe your video... (e.g. '3 secret AI tools to grow your brand')" rows="3" style="width:100%; resize:none;"></textarea>
            </div>
          </div>

          <div class="glass-card generator-control-section">
            <h3 class="generator-control-title">${sparklesIcon} Select Your Niches</h3>
            <div class="niche-selector">
              ${nichesHtml}
            </div>
          </div>

          <div class="glass-card generator-control-section">
            <h3 class="generator-control-title">${getIconSvg('zap', { width: 20, height: 20 })} Hook Vibe</h3>
            <div class="vibe-selector-grid">
              <button class="vibe-btn active" data-vibe="Mystery">🔮 Mystery</button>
              <button class="vibe-btn" data-vibe="Story">📖 Story</button>
              <button class="vibe-btn" data-vibe="Shock">⚡ Shock</button>
              <button class="vibe-btn" data-vibe="Comedy">😂 Comedy</button>
            </div>
          </div>

          <button class="btn-primary generate-cta" id="architect-hooks-btn" ${!groqKey ? 'disabled' : ''}>
            ✨ Architect Hooks
          </button>
          ${!groqKey ? '<p class="key-notice">⚠️ Add your <a href="#settings">Groq API key</a> in Settings to generate.</p>' : ''}
        </div>

        <!-- Tab 4: SEO Controls -->
        <div class="control-pane" id="pane-seo">
          <div class="glass-card generator-control-section">
            <h3 class="generator-control-title">${getIconSvg('edit', { width: 20, height: 20 })} Video Concept</h3>
            <div class="custom-topic-row" style="margin-top: 0;">
              <textarea class="custom-topic-input concept-textarea" id="seo-concept-input" placeholder="What is your video about? (e.g. 'how to scale a side hustle with zero budget')" rows="3" style="width:100%; resize:none;"></textarea>
            </div>
          </div>

          <div class="glass-card generator-control-section">
            <h3 class="generator-control-title">${sparklesIcon} Select Your Niches</h3>
            <div class="niche-selector">
              ${nichesHtml}
            </div>
          </div>

          <button class="btn-primary generate-cta" id="optimize-seo-btn" ${!groqKey ? 'disabled' : ''}>
            ✨ Optimize SEO
          </button>
          ${!groqKey ? '<p class="key-notice">⚠️ Add your <a href="#settings">Groq API key</a> in Settings to generate.</p>' : ''}
        </div>
      </div>

      <!-- Right Panel: Results with responsive switching -->
      <div class="generator-results">
        <!-- Tab 1 Results: Ideas -->
        <div class="results-pane active" id="results-ideas">
          <div class="ideas-grid" id="ideas-grid">
            <div class="generator-empty">
              <div class="generator-empty-icon">${sparklesIcon}</div>
              <h4 class="generator-empty-title">Generate Video Ideas</h4>
              <p class="generator-empty-desc">Select your niches, choose a trending topic or type a custom one, then click Generate to create fresh, highly viral ideas.</p>
            </div>
          </div>
          <div class="script-editor" id="script-editor" style="display:none;">
            <div class="glass-card script-card">
              <div class="script-editor-header">
                <h3 class="script-editor-title">${brainIcon} Generated Script</h3>
                <div class="script-actions">
                  <button class="btn-secondary" id="copy-script-btn">${copyIcon} Copy</button>
                  <button class="btn-primary" id="save-script-btn">${saveIcon} Save Script</button>
                  <button class="btn-secondary" id="download-script-btn">${downloadIcon} Download .txt</button>
                </div>
              </div>
              <div class="script-sections" id="script-sections"></div>
              <div class="script-full">
                <label class="script-label">Full Script (editable)</label>
                <textarea class="script-textarea" id="script-textarea" rows="10"></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2 Results: Memes -->
        <div class="results-pane" id="results-memes">
          <div id="remix-results">
            <div class="generator-empty">
              <div class="generator-empty-icon">${shuffleIcon}</div>
              <h4 class="generator-empty-title">Remix Trending Memes</h4>
              <p class="generator-empty-desc">Enter a popular meme format (e.g. 'Distracted Boyfriend') to see it spun up into viral hooks customized for your niches.</p>
            </div>
          </div>
        </div>

        <!-- Tab 3 Results: Hooks -->
        <div class="results-pane" id="results-hooks">
          <div id="hooks-results">
            <div class="generator-empty">
              <div class="generator-empty-icon">${getIconSvg('zap', { width: 32, height: 32 })}</div>
              <h4 class="generator-empty-title">Viral Hook Architect</h4>
              <p class="generator-empty-desc">Type your video concept, choose a visual hook vibe, and click Architect Hooks to generate exactly 3 scroll-stopping variations.</p>
            </div>
          </div>
        </div>

        <!-- Tab 4 Results: SEO -->
        <div class="results-pane" id="results-seo">
          <div id="seo-results">
            <div class="generator-empty">
              <div class="generator-empty-icon">${getIconSvg('search', { width: 32, height: 32 })}</div>
              <h4 class="generator-empty-title">Title & Tag Optimizer</h4>
              <p class="generator-empty-desc">Input your concept to optimize click-through rate (CTR) with high-converting titles and copyable trending tag chips.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // --- Niche selector logic (Synchronized across all tabs) ---
  const selectedNiches = new Set(savedNiches);
  function syncNichesUI() {
    container.querySelectorAll('.niche-chip').forEach(chip => {
      const niche = chip.dataset.niche;
      if (selectedNiches.has(niche)) {
        chip.classList.add('selected');
      } else {
        chip.classList.remove('selected');
      }
    });
  }

  container.querySelectorAll('.niche-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const niche = chip.dataset.niche;
      if (selectedNiches.has(niche)) {
        selectedNiches.delete(niche);
      } else {
        selectedNiches.add(niche);
      }
      syncNichesUI();
    });
  });

  // --- Segmented Sidebar Tab Switcher ---
  const tabButtons = container.querySelectorAll('.gen-tab-btn');
  const controlPanes = container.querySelectorAll('.control-pane');
  const resultsPanes = container.querySelectorAll('.results-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      controlPanes.forEach(pane => {
        if (pane.id === `pane-${tab}`) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });

      resultsPanes.forEach(pane => {
        if (pane.id === `results-${tab}`) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });

  // --- Load trending topics for picker ---
  let selectedTrend = preselectedTopic;
  async function loadTrendPicker() {
    const listEl = container.querySelector('#trend-picker-list');
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
          container.querySelector('#custom-topic').value = '';
        });
        listEl.appendChild(chip);
      });
    } catch {
      listEl.innerHTML = '<p class="empty-msg">Could not load trends.</p>';
    }
  }
  loadTrendPicker();

  // Custom topic input clears trend selection
  container.querySelector('#custom-topic').addEventListener('input', (e) => {
    if (e.target.value) {
      container.querySelectorAll('.trend-pick-chip').forEach(c => c.classList.remove('selected'));
      selectedTrend = e.target.value;
    }
  });

  // --- Dynamic Idea Count Selector ---
  let activeCount = 5;
  const countButtons = container.querySelectorAll('.count-btn');
  const mainGenBtn = container.querySelector('#generate-btn');

  countButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      countButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCount = parseInt(btn.dataset.count, 10);
      mainGenBtn.innerHTML = `✨ Generate ${activeCount} Ideas`;
    });
  });

  // --- Hook Vibe Selector ---
  let activeVibe = 'Mystery';
  const vibeButtons = container.querySelectorAll('.vibe-btn');

  vibeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      vibeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeVibe = btn.dataset.vibe;
    });
  });

  // --- Generate Ideas ---
  let currentIdeas = [];
  let currentScriptIdea = null;

  mainGenBtn.addEventListener('click', async () => {
    if (!groqKey) {
      showToast('Add your Groq API key in Settings first', 'error');
      return;
    }
    const niches = [...selectedNiches];
    if (!niches.length) {
      showToast('Select at least one niche', 'error');
      return;
    }

    const topic = container.querySelector('#custom-topic').value || selectedTrend || '';
    const trendingTopics = topic ? [topic] : ['trending'];

    mainGenBtn.disabled = true;
    mainGenBtn.innerHTML = '<span class="spinner"></span> Generating...';
    const ideasGrid = container.querySelector('#ideas-grid');
    ideasGrid.innerHTML = Array(activeCount).fill(0).map(() =>
      `<div class="skeleton" style="width:100%;height:180px;border-radius:16px;margin-bottom:16px;"></div>`
    ).join('');

    if (window.innerWidth <= 1024) {
      ideasGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    try {
      const niche = niches.join(', ');
      const ideas = await generateIdeas(niche, trendingTopics, groqKey, activeCount);
      currentIdeas = ideas;
      ideasGrid.innerHTML = '';

      ideas.forEach((idea, i) => {
        const card = createIdeaCard(idea, {
          onSave: () => {
            storage.saveIdea({ ...idea, createdAt: new Date().toISOString(), status: 'saved' });
            showToast('Idea saved!', 'success');
          },
          onGenerateScript: () => handleGenerateScript(idea),
          onDelete: () => {
            card.remove();
          }
        });
        card.style.animationDelay = `${i * 0.05}s`;
        card.classList.add('fadeInUp');
        ideasGrid.appendChild(card);
      });
    } catch (err) {
      ideasGrid.innerHTML = '<p class="empty-msg">Failed to generate ideas. Please try again.</p>';
      showToast('Generation failed', 'error');
    } finally {
      mainGenBtn.disabled = false;
      mainGenBtn.innerHTML = `✨ Generate ${activeCount} Ideas`;
    }
  });

  // --- Generate Script ---
  async function handleGenerateScript(idea) {
    if (!groqKey) {
      showToast('Add your Groq API key in Settings first', 'error');
      return;
    }
    currentScriptIdea = idea;
    const editorEl = container.querySelector('#script-editor');
    editorEl.style.display = 'block';
    const sectionsEl = container.querySelector('#script-sections');
    const textareaEl = container.querySelector('#script-textarea');

    sectionsEl.innerHTML = `
      <div class="skeleton" style="width:100%;height:60px;border-radius:8px;margin-bottom:8px;"></div>
      <div class="skeleton" style="width:100%;height:100px;border-radius:8px;margin-bottom:8px;"></div>
      <div class="skeleton" style="width:100%;height:60px;border-radius:8px;"></div>
    `;
    textareaEl.value = '';

    try {
      const script = await generateScript(idea, groqKey);
      sectionsEl.innerHTML = `
        <div class="script-section script-section--hook">
          <label class="script-section-label">🎣 Hook</label>
          <p class="script-section-content">${escapeHtml(script.hook)}</p>
        </div>
        <div class="script-section script-section--body">
          <label class="script-section-label">📝 Body</label>
          <p class="script-section-content">${escapeHtml(script.body)}</p>
        </div>
        <div class="script-section script-section--cta">
          <label class="script-section-label">📢 CTA</label>
          <p class="script-section-content">${escapeHtml(script.cta)}</p>
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
  container.querySelector('#copy-script-btn').addEventListener('click', () => {
    const text = container.querySelector('#script-textarea').value;
    navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!', 'success'));
  });

  container.querySelector('#save-script-btn').addEventListener('click', () => {
    const text = container.querySelector('#script-textarea').value;
    if (!text) return;
    storage.saveScript({
      ideaTitle: currentScriptIdea?.title || 'Untitled',
      fullScript: text,
      createdAt: new Date().toISOString()
    });
    showToast('Script saved!', 'success');
  });

  container.querySelector('#download-script-btn').addEventListener('click', () => {
    const text = container.querySelector('#script-textarea').value;
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
  const remixBtn = container.querySelector('#remix-btn');
  remixBtn.addEventListener('click', async () => {
    const memeInput = container.querySelector('#meme-input').value.trim();
    if (!memeInput) {
      showToast('Enter a meme or format to remix', 'error');
      return;
    }
    if (!groqKey) {
      showToast('Add your Groq API key in Settings first', 'error');
      return;
    }
    const resultsEl = container.querySelector('#remix-results');
    remixBtn.disabled = true;
    remixBtn.innerHTML = '<span class="spinner"></span> Remixing...';
    resultsEl.innerHTML = '<div class="skeleton" style="width:100%;height:100px;border-radius:8px;"></div>';

    if (window.innerWidth <= 1024) {
      resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    try {
      const niches = [...selectedNiches];
      const niche = niches.length ? niches.join(', ') : 'general';
      const remixes = await remixMeme(memeInput, niche, groqKey);
      resultsEl.innerHTML = `
        <div class="remix-results-grid">
          ${remixes.map(r => `
            <div class="glass-card remix-card fadeInUp">
              <h4 class="remix-twist">🔀 ${escapeHtml(r.twist)}</h4>
              <p class="remix-concept">${escapeHtml(r.concept)}</p>
              <p class="remix-script">${escapeHtml(r.script)}</p>
            </div>
          `).join('')}
        </div>
      `;
    } catch {
      resultsEl.innerHTML = '<p class="empty-msg">Failed to remix. Try again.</p>';
      showToast('Remix failed', 'error');
    } finally {
      remixBtn.disabled = false;
      remixBtn.innerHTML = `${wandIcon} Remix It`;
    }
  });

  // --- Viral Hook Architect Tool ---
  const archBtn = container.querySelector('#architect-hooks-btn');
  archBtn.addEventListener('click', async () => {
    const concept = container.querySelector('#hook-concept-input').value.trim();
    if (!concept) {
      showToast('Please enter a video concept', 'error');
      return;
    }
    const niches = [...selectedNiches];
    if (!niches.length) {
      showToast('Select at least one niche', 'error');
      return;
    }
    if (!groqKey) {
      showToast('Add your Groq API key in Settings first', 'error');
      return;
    }

    archBtn.disabled = true;
    archBtn.innerHTML = '<span class="spinner"></span> Architecting...';
    const hookResults = container.querySelector('#hooks-results');
    hookResults.innerHTML = Array(3).fill(0).map(() =>
      `<div class="skeleton" style="width:100%;height:140px;border-radius:16px;margin-bottom:16px;"></div>`
    ).join('');

    if (window.innerWidth <= 1024) {
      hookResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    try {
      const niche = niches.map(n => NICHES.find(item => item.id === n)?.label || n).join(', ');
      const hooks = await generateHooks(concept, niche, activeVibe, groqKey);
      hookResults.innerHTML = `
        <div class="hooks-grid">
          ${hooks.map((h, i) => `
            <div class="glass-card hook-card fadeInUp" style="animation-delay: ${i * 0.05}s">
              <div class="hook-card-badge">
                <span>🎣 ${escapeHtml(h.type)}</span>
              </div>
              <div class="hook-card-text">"${escapeHtml(h.hookText)}"</div>
              <div class="hook-card-divider"></div>
              <div class="hook-card-explanation">
                <strong>Psychology:</strong> ${escapeHtml(h.explanation)}
              </div>
              <button class="btn-icon copy-hook-btn" data-hook="${escapeHtml(h.hookText)}">
                ${copyIcon}
              </button>
            </div>
          `).join('')}
        </div>
      `;

      // Bind copy buttons
      hookResults.querySelectorAll('.copy-hook-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const txt = btn.dataset.hook;
          navigator.clipboard.writeText(txt).then(() => {
            showToast('Hook copied to clipboard!', 'success');
            btn.innerHTML = getIconSvg('check', { width: 14, height: 14 });
            setTimeout(() => {
              btn.innerHTML = copyIcon;
            }, 2000);
          });
        });
      });
    } catch (err) {
      hookResults.innerHTML = '<p class="empty-msg">Failed to architect hooks. Please try again.</p>';
      showToast('Hooks generation failed', 'error');
    } finally {
      archBtn.disabled = false;
      archBtn.innerHTML = '✨ Architect Hooks';
    }
  });

  // --- Title & Tag SEO Optimizer ---
  const seoBtn = container.querySelector('#optimize-seo-btn');
  seoBtn.addEventListener('click', async () => {
    const concept = container.querySelector('#seo-concept-input').value.trim();
    if (!concept) {
      showToast('Please enter a video concept', 'error');
      return;
    }
    const niches = [...selectedNiches];
    if (!niches.length) {
      showToast('Select at least one niche', 'error');
      return;
    }
    if (!groqKey) {
      showToast('Add your Groq API key in Settings first', 'error');
      return;
    }

    seoBtn.disabled = true;
    seoBtn.innerHTML = '<span class="spinner"></span> Optimizing...';
    const seoResults = container.querySelector('#seo-results');
    seoResults.innerHTML = `
      <div class="skeleton" style="width:100%;height:180px;border-radius:16px;margin-bottom:16px;"></div>
      <div class="skeleton" style="width:100%;height:100px;border-radius:16px;"></div>
    `;

    if (window.innerWidth <= 1024) {
      seoResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    try {
      const niche = niches.map(n => NICHES.find(item => item.id === n)?.label || n).join(', ');
      const seo = await optimizeSEO(concept, niche, groqKey);

      const titles = seo.titles || [];
      const tags = seo.tags || [];

      const tagChipsHtml = tags.map(tag => `
        <span class="chip tag-chip">#${escapeHtml(tag)}</span>
      `).join('');

      seoResults.innerHTML = `
        <div class="seo-results-wrapper">
          <div class="glass-card seo-section fadeInUp" style="animation-delay: 0s;">
            <div class="seo-section-header">
              <h4 class="seo-section-title">📈 High-CTR Titles</h4>
            </div>
            <div class="seo-titles-list">
              ${titles.map((t, idx) => `
                <div class="seo-title-item">
                  <span class="seo-title-num">${idx + 1}</span>
                  <span class="seo-title-text">${escapeHtml(t)}</span>
                  <button class="btn-icon copy-title-btn" data-title="${escapeHtml(t)}">
                    ${copyIcon}
                  </button>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="glass-card seo-section fadeInUp" style="animation-delay: 0.05s; margin-top: 16px;">
            <div class="seo-section-header">
              <h4 class="seo-section-title">🏷️ Viral Hashtags</h4>
              <button class="btn-secondary btn-sm" id="copy-all-tags-btn" style="padding: 6px 12px; font-size: 11px;">
                ${copyIcon} Copy All Tags
              </button>
            </div>
            <div class="seo-tags-grid">
              ${tagChipsHtml}
            </div>
          </div>
        </div>
      `;

      // Bind copy title buttons
      seoResults.querySelectorAll('.copy-title-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const txt = btn.dataset.title;
          navigator.clipboard.writeText(txt).then(() => {
            showToast('Title copied to clipboard!', 'success');
            btn.innerHTML = getIconSvg('check', { width: 14, height: 14 });
            setTimeout(() => {
              btn.innerHTML = copyIcon;
            }, 2000);
          });
        });
      });

      // Bind Copy All Tags button
      const copyAllBtn = seoResults.querySelector('#copy-all-tags-btn');
      if (copyAllBtn) {
        copyAllBtn.addEventListener('click', () => {
          const formattedTags = tags.map(t => `#${t}`).join(' ');
          navigator.clipboard.writeText(formattedTags).then(() => {
            showToast('All hashtags copied!', 'success');
            copyAllBtn.innerHTML = `${getIconSvg('check', { width: 12, height: 12 })} Copied!`;
            setTimeout(() => {
              copyAllBtn.innerHTML = `${copyIcon} Copy All Tags`;
            }, 2000);
          });
        });
      }

    } catch (err) {
      seoResults.innerHTML = '<p class="empty-msg">Failed to optimize SEO. Please try again.</p>';
      showToast('SEO optimization failed', 'error');
    } finally {
      seoBtn.disabled = false;
      seoBtn.innerHTML = '✨ Optimize SEO';
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
