import { getApiUrl } from './api.js';

const cache = {
  data: null,
  timestamp: 0,
  key: '',
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function fetchDailyTrends(geo = 'US') {
  const cacheKey = `trends_${geo}`;
  const now = Date.now();

  if (cache.data && cache.key === cacheKey && now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  try {
    const response = await fetch(getApiUrl(`/api/trends?geo=${encodeURIComponent(geo)}`));

    if (!response.ok) {
      throw new Error(`Trends API error (${response.status})`);
    }

    const json = await response.json();

    const trends = (Array.isArray(json) ? json : json.trends || []).map((t) => ({
      title: t.title || '',
      traffic: t.traffic || t.formattedTraffic || '',
      relatedQueries: t.relatedQueries || [],
      newsUrl: t.newsUrl || t.url || '',
      image: t.image || t.imageUrl || '',
    }));

    cache.data = trends;
    cache.timestamp = now;
    cache.key = cacheKey;

    return trends;
  } catch (error) {
    console.error('Failed to fetch daily trends:', error);
    return [];
  }
}
