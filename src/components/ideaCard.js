/**
 * Creates an idea card element.
 * @param {{ id, title, hook, concept, estimatedVirality, hashtags, niche, status }} idea
 * @param {{ onSave: function, onGenerateScript: function, onDelete: function }} callbacks
 * @returns {HTMLElement}
 */
export function createIdeaCard(idea, { onSave, onGenerateScript, onDelete }) {
  const card = document.createElement('div');
  card.className = 'idea-card';

  // ── Header ────────────────────────────────────────────────
  const header = document.createElement('div');
  header.className = 'idea-card-header';

  const title = document.createElement('h3');
  title.className = 'idea-card-title';
  title.textContent = idea.title;

  const virality = document.createElement('span');
  virality.className = 'idea-card-virality ' + getViralityClass(idea.estimatedVirality);
  virality.textContent = `🔥 ${idea.estimatedVirality}/10`;

  header.appendChild(title);
  header.appendChild(virality);
  card.appendChild(header);

  // ── Hook Preview ──────────────────────────────────────────
  const hookEl = document.createElement('p');
  hookEl.className = 'idea-card-hook';
  hookEl.textContent = `"${idea.hook}"`;
  card.appendChild(hookEl);

  // ── Concept ───────────────────────────────────────────────
  const concept = document.createElement('p');
  concept.className = 'idea-card-concept';
  concept.textContent = idea.concept;
  card.appendChild(concept);

  // ── Hashtags ──────────────────────────────────────────────
  if (idea.hashtags && idea.hashtags.length > 0) {
    const tagsWrap = document.createElement('div');
    tagsWrap.className = 'idea-card-tags';

    idea.hashtags.forEach((tag) => {
      const chip = document.createElement('span');
      chip.className = 'hashtag-chip';
      chip.textContent = tag.startsWith('#') ? tag : `#${tag}`;
      tagsWrap.appendChild(chip);
    });

    card.appendChild(tagsWrap);
  }

  // ── Saved Indicator ───────────────────────────────────────
  if (idea.status === 'saved') {
    const saved = document.createElement('div');
    saved.className = 'idea-card-saved';
    saved.textContent = '✅ Saved';
    card.appendChild(saved);
  }

  // ── Action Buttons ────────────────────────────────────────
  const actions = document.createElement('div');
  actions.className = 'idea-card-actions';

  if (onSave && idea.status !== 'saved') {
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-secondary btn-sm';
    saveBtn.textContent = '💾 Save';
    saveBtn.addEventListener('click', () => onSave(idea));
    actions.appendChild(saveBtn);
  }

  if (onGenerateScript) {
    const scriptBtn = document.createElement('button');
    scriptBtn.className = 'btn btn-primary btn-sm';
    scriptBtn.textContent = '✍️ Write Script';
    scriptBtn.addEventListener('click', () => onGenerateScript(idea));
    actions.appendChild(scriptBtn);
  }

  if (onDelete) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm';
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.addEventListener('click', () => onDelete(idea));
    actions.appendChild(deleteBtn);
  }

  card.appendChild(actions);

  return card;
}

/**
 * Returns a CSS class based on virality score.
 */
function getViralityClass(score) {
  const s = Number(score) || 0;
  if (s >= 8) return 'virality-high';
  if (s >= 5) return 'virality-mid';
  return 'virality-low';
}
