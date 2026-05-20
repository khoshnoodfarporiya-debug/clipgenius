import { storage } from './storage.js';

/**
 * Resolves an API endpoint path dynamically.
 * If a custom remote API server is set in Settings, it is prepended.
 * Otherwise, relative paths are kept for standard web deployment.
 * 
 * @param {string} path - The endpoint path (e.g. '/api/trends')
 * @returns {string} The fully resolved URL
 */
export function getApiUrl(path) {
  const settings = storage.getSettings();
  const customUrl = settings.apiUrl ? settings.apiUrl.trim().replace(/\/$/, '') : '';
  
  if (customUrl) {
    return `${customUrl}${path}`;
  }
  
  return path;
}
