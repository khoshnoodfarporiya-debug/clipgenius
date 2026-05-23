import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Shared database path — single source of truth for all agents
const SHARED_DB_PATH = 'C:/Users/khosh/.gemini/antigravity/scratch/shared-database/dev.db';

app.use(cors());
app.use(express.json());

// ── Product Intelligence Metrics (Shared SQLite) ────────────────────────
app.get('/api/products/stats', (req, res, next) => {
  try {
    const db = new Database(SHARED_DB_PATH, { readonly: true, fileMustExist: true });

    // Total products across all sweeps
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM SourcedProduct').get();

    // Unique platforms
    const platforms = db.prepare('SELECT DISTINCT platform FROM SourcedProduct').all();

    // Average profitability score
    const avgProfit = db.prepare('SELECT AVG(profitabilityScore) as avg FROM SourcedProduct').get();

    // Top 5 platforms by product count
    const topPlatforms = db.prepare(
      'SELECT platform, COUNT(*) as count FROM SourcedProduct GROUP BY platform ORDER BY count DESC LIMIT 5'
    ).all();

    // Recent sweeps (last 10)
    const recentSweeps = db.prepare(
      'SELECT id, query, platforms, status, createdAt FROM ScrapeSweep ORDER BY createdAt DESC LIMIT 10'
    ).all();

    // Total sweeps count
    const totalSweeps = db.prepare('SELECT COUNT(*) as count FROM ScrapeSweep').get();

    // Products sourced in the last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentProducts = db.prepare(
      'SELECT COUNT(*) as count FROM SourcedProduct WHERE crawledAt > ?'
    ).get(weekAgo);

    db.close();

    res.json({
      totalProducts: totalProducts.count,
      totalPlatforms: platforms.length,
      avgProfitability: avgProfit.avg ? parseFloat(avgProfit.avg.toFixed(2)) : 0,
      totalSweeps: totalSweeps.count,
      recentProductsThisWeek: recentProducts.count,
      topPlatforms,
      recentSweeps,
    });
  } catch (err) {
    // Graceful fallback if database doesn't exist yet
    if (err.code === 'SQLITE_CANTOPEN' || err.message.includes('not exist')) {
      return res.json({
        totalProducts: 0,
        totalPlatforms: 0,
        avgProfitability: 0,
        totalSweeps: 0,
        recentProductsThisWeek: 0,
        topPlatforms: [],
        recentSweeps: [],
      });
    }
    next(err);
  }
});

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
