const PREFIX = 'clipgenius_';

function getItem(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setItem(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export const storage = {
  // ── API Keys ──────────────────────────────────────────────
  getApiKey(provider) {
    return getItem(`apikey_${provider}`) || null;
  },

  setApiKey(provider, key) {
    setItem(`apikey_${provider}`, key);
  },

  // ── Ideas ─────────────────────────────────────────────────
  getIdeas() {
    return getItem('ideas') || [];
  },

  saveIdea(idea) {
    const ideas = this.getIdeas();
    const newIdea = {
      ...idea,
      id: idea.id || crypto.randomUUID(),
      createdAt: idea.createdAt || new Date().toISOString(),
      status: idea.status || 'idea',
    };
    ideas.push(newIdea);
    setItem('ideas', ideas);
    return newIdea;
  },

  updateIdea(id, updates) {
    const ideas = this.getIdeas();
    const index = ideas.findIndex((i) => i.id === id);
    if (index === -1) return null;
    ideas[index] = { ...ideas[index], ...updates };
    setItem('ideas', ideas);
    return ideas[index];
  },

  deleteIdea(id) {
    const ideas = this.getIdeas().filter((i) => i.id !== id);
    setItem('ideas', ideas);
  },

  // ── Scripts ───────────────────────────────────────────────
  getScripts() {
    return getItem('scripts') || [];
  },

  saveScript(script) {
    const scripts = this.getScripts();
    const newScript = {
      ...script,
      id: script.id || crypto.randomUUID(),
      createdAt: script.createdAt || new Date().toISOString(),
    };
    scripts.push(newScript);
    setItem('scripts', scripts);
    return newScript;
  },

  deleteScript(id) {
    const scripts = this.getScripts().filter((s) => s.id !== id);
    setItem('scripts', scripts);
  },

  // ── Settings ──────────────────────────────────────────────
  getSettings() {
    const defaults = {
      region: 'US',
      niches: [],
      theme: 'dark',
      apiUrl: '',
    };
    const settings = getItem('settings');
    return settings ? { ...defaults, ...settings } : defaults;
  },

  updateSettings(partial) {
    const current = this.getSettings();
    const merged = { ...current, ...partial };
    setItem('settings', merged);
    return merged;
  },

  // ── Export / Import ───────────────────────────────────────
  exportAll() {
    return JSON.stringify({
      ideas: this.getIdeas(),
      scripts: this.getScripts(),
      settings: this.getSettings(),
      apiKeys: {
        youtube: this.getApiKey('youtube'),
        groq: this.getApiKey('groq'),
      },
      exportedAt: new Date().toISOString(),
    });
  },

  importAll(jsonString) {
    const data = JSON.parse(jsonString);
    if (data.ideas) setItem('ideas', data.ideas);
    if (data.scripts) setItem('scripts', data.scripts);
    if (data.settings) setItem('settings', data.settings);
    if (data.apiKeys) {
      if (data.apiKeys.youtube) this.setApiKey('youtube', data.apiKeys.youtube);
      if (data.apiKeys.groq) this.setApiKey('groq', data.apiKeys.groq);
    }
  },
};
