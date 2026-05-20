import { getApiUrl } from './api.js';

/**
 * Strips markdown code fences and parses JSON from AI responses.
 */
function parseAIResponse(text) {
  let cleaned = text.trim();

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
  cleaned = cleaned.trim();

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to find JSON array or object in the text
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch { /* fall through */ }
    }

    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[0]);
      } catch { /* fall through */ }
    }

    throw new Error('Failed to parse AI response as JSON. Raw response: ' + text.slice(0, 200));
  }
}

/**
 * Sends a chat completion request through the proxy.
 */
async function callAI(apiKey, messages, endpoint = '/api/ai/generate') {
  const response = await fetch(getApiUrl(endpoint), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey,
      messages,
      model: 'llama-3.3-70b-versatile',
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `AI API error (${response.status})`);
  }

  const json = await response.json();

  // Handle various response shapes from proxy
  const content =
    json.choices?.[0]?.message?.content ||
    json.content ||
    json.text ||
    (typeof json === 'string' ? json : JSON.stringify(json));

  return content;
}

/**
 * Generate 5 viral short-form video ideas for a niche.
 */
export async function generateIdeas(niche, trendingTopics, apiKey) {
  if (!apiKey) throw new Error('Groq API key is required. Add it in Settings.');

  const topicsStr = Array.isArray(trendingTopics)
    ? trendingTopics.join(', ')
    : String(trendingTopics || '');

  const messages = [
    {
      role: 'system',
      content:
        'You are a viral short-form video content strategist. Generate exactly 5 unique video ideas. Respond ONLY with a JSON array.',
    },
    {
      role: 'user',
      content: `Niche: ${niche}. Current trending topics: ${topicsStr}. Generate 5 viral short-form video ideas. Each idea must have: title (catchy, under 60 chars), hook (first 3 seconds, compelling opening line), concept (2-3 sentence description), estimatedVirality (1-10 score), hashtags (array of 5 relevant tags). Return ONLY valid JSON array, no markdown.`,
    },
  ];

  const raw = await callAI(apiKey, messages);
  return parseAIResponse(raw);
}

/**
 * Generate a script for a video idea.
 */
export async function generateScript(idea, apiKey) {
  if (!apiKey) throw new Error('Groq API key is required. Add it in Settings.');

  const messages = [
    {
      role: 'system',
      content:
        'You are an expert short-form video scriptwriter. Write engaging scripts for 30-60 second videos.',
    },
    {
      role: 'user',
      content: `Write a script for this video idea: Title: ${idea.title}, Concept: ${idea.concept}. Structure the script with: hook (attention-grabbing first 3 seconds), body (main content, 20-40 seconds), cta (call to action, last 5 seconds). Also provide the fullScript (complete script as one block). Return ONLY valid JSON with keys: hook, body, cta, fullScript. No markdown.`,
    },
  ];

  const raw = await callAI(apiKey, messages, '/api/ai/script');
  return parseAIResponse(raw);
}

/**
 * Remix a trending meme for a specific niche.
 */
export async function remixMeme(meme, niche, apiKey) {
  if (!apiKey) throw new Error('Groq API key is required. Add it in Settings.');

  const messages = [
    {
      role: 'system',
      content:
        'You are a meme content creator who specializes in remixing trending memes for different niches.',
    },
    {
      role: 'user',
      content: `Trending meme/format: ${meme}. My niche: ${niche}. Create 3 unique twists on this meme for my niche. Each twist should have: twist (name of the twist), concept (2-3 sentences), script (30 second script). Return ONLY valid JSON array. No markdown.`,
    },
  ];

  const raw = await callAI(apiKey, messages);
  return parseAIResponse(raw);
}
