import { API_BASE_URL } from '../services/api';

// /images/ = static assets in frontend public folder (served by frontend/Vercel)
// /uploads/ = user uploads on backend (served by backend/Render)
const getBaseForPath = (path) => {
  if (path.startsWith('/uploads/')) return API_BASE_URL.replace(/\/api$/, '') || '';
  return typeof window !== 'undefined' ? window.location.origin : '';
};

// Safe image URL: data: URLs must NOT get encodeURI or query params (causes ERR_INVALID_URL)
export const getImageSrc = (img) => {
  if (!img || typeof img !== 'string') return null;
  if (img.startsWith('data:')) return img;
  let raw = null;
  if (img.startsWith('http://') || img.startsWith('https://')) raw = img;
  else if (img.startsWith('/')) raw = getBaseForPath(img) + img;
  if (!raw) return null; // product IDs like "m3" are invalid - don't use as image src
  return encodeURI(raw);
};

export const isDataUrl = (img) => img && typeof img === 'string' && img.startsWith('data:');
