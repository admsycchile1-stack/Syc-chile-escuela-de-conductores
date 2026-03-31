const rawApiBaseUrl = process.env.REACT_APP_API_URL || '/api';

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '');

const getApiOrigin = () => {
  if (!API_BASE_URL) return '';
  if (API_BASE_URL === '/api') return '';
  if (API_BASE_URL.endsWith('/api')) return API_BASE_URL.slice(0, -4);
  return API_BASE_URL;
};

export const FILES_BASE_URL = getApiOrigin().replace(/\/+$/, '');

export const buildApiUrl = (path = '') => {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const buildFileUrl = (path = '') => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return FILES_BASE_URL ? `${FILES_BASE_URL}${path}` : path;
};
