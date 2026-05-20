const cache = {
  data: null,
  timestamp: 0,
  key: '',
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

function parseDuration(iso) {
  const match = iso.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const minutes = parseInt(match[1] || '0', 10);
  const seconds = parseInt(match[2] || '0', 10);
  return minutes * 60 + seconds;
}

export async function fetchTrendingShorts(regionCode = 'US', apiKey) {
  if (!apiKey) {
    throw new Error('YouTube API key is required. Add it in Settings.');
  }

  const cacheKey = `yt_${regionCode}`;
  const now = Date.now();

  if (cache.data && cache.key === cacheKey && now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  const url =
    `https://www.googleapis.com/youtube/v3/videos` +
    `?part=snippet,statistics,contentDetails` +
    `&chart=mostPopular` +
    `&regionCode=${encodeURIComponent(regionCode)}` +
    `&maxResults=50` +
    `&key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message =
      errorBody?.error?.message || `YouTube API error (${response.status})`;
    throw new Error(message);
  }

  const json = await response.json();

  const shorts = (json.items || [])
    .map((item) => {
      const duration = parseDuration(item.contentDetails?.duration || '');
      return {
        id: item.id,
        title: item.snippet?.title || '',
        channelTitle: item.snippet?.channelTitle || '',
        thumbnail:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          '',
        viewCount: Number(item.statistics?.viewCount || 0),
        likeCount: Number(item.statistics?.likeCount || 0),
        commentCount: Number(item.statistics?.commentCount || 0),
        publishedAt: item.snippet?.publishedAt || '',
        duration,
      };
    })
    .filter((v) => v.duration > 0 && v.duration <= 60);

  cache.data = shorts;
  cache.timestamp = now;
  cache.key = cacheKey;

  return shorts;
}
