import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── Google Trends RSS → JSON ────────────────────────────────────────────
app.get('/api/trends', async (req, res, next) => {
  try {
    const geo = req.query.geo || 'US';
    const rssUrl = `https://trends.google.com/trending/rss?geo=${encodeURIComponent(geo)}`;

    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ClipGenius/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Trends responded with status ${response.status}`);
    }

    const xml = await response.text();

    // Parse <item> blocks with regex (no xml2js dependency)
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];

      const getTag = (tag) => {
        const m = block.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`));
        if (m) return m[1].trim();
        const m2 = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
        return m2 ? m2[1].trim() : '';
      };

      const getHtTag = (tag) => {
        const m = block.match(new RegExp(`<ht:${tag}>([\\s\\S]*?)<\\/ht:${tag}>`));
        return m ? m[1].trim() : '';
      };

      const title = getTag('title');
      const traffic = getHtTag('approx_traffic') || getHtTag('traffic');
      const newsUrl = getTag('link');

      // Related queries from ht:news_item titles or description
      const relatedQueries = [];
      const relatedRegex = /<ht:news_item_title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/ht:news_item_title>/g;
      let rMatch;
      while ((rMatch = relatedRegex.exec(block)) !== null) {
        relatedQueries.push(rMatch[1].trim());
      }

      // Image from ht:picture or ht:news_item_picture
      let image = '';
      const imgMatch = block.match(/<ht:picture>([^<]+)<\/ht:picture>/);
      if (imgMatch) {
        image = imgMatch[1].trim();
      } else {
        const newsImgMatch = block.match(/<ht:news_item_picture>([^<]+)<\/ht:news_item_picture>/);
        if (newsImgMatch) image = newsImgMatch[1].trim();
      }

      if (title) {
        items.push({ title, traffic, relatedQueries, newsUrl, image });
      }
    }

    res.json(items);
  } catch (err) {
    next(err);
  }
});

// ── AI Generate (Groq Proxy) ───────────────────────────────────────────
app.post('/api/ai/generate', async (req, res, next) => {
  try {
    const { apiKey, messages, model } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ── AI Script (Groq Proxy — separate endpoint for organization) ─────────
app.post('/api/ai/script', async (req, res, next) => {
  try {
    const { apiKey, messages, model } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Serve static frontend files in production
app.use(express.static(path.join(__dirname, '../dist')));

// Fallback all other routes to index.html (SPA routing support)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// ── Error Handling ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ClipGenius API Error]', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`✦ ClipGenius API proxy running on http://localhost:${PORT}`);
});
