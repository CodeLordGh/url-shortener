// Backend API URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Base URL for shortened links (without /api prefix)
export const SHORTENER_BASE_URL = import.meta.env.VITE_SHORTENER_BASE_URL || 'http://localhost:3000';

// Ensure URLs don't end with trailing slash
export const normalizeUrl = (url: string) => url.replace(/\/$/, '');
