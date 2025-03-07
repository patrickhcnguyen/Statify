// set true for local development and false for production
const isDevelopment = process.env.NODE_ENV === 'development';
const isLocalBackend = process.env.REACT_APP_USE_LOCAL_BACKEND === 'true'; 

// Add console logs for debugging
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_USE_LOCAL_BACKEND:', process.env.REACT_APP_USE_LOCAL_BACKEND);
console.log('isDevelopment:', isDevelopment);
console.log('isLocalBackend:', isLocalBackend);

export const API_BASE_URL = isDevelopment && isLocalBackend
  ? 'http://localhost:8888'
  : 'https://api.statify.app';

console.log('API_BASE_URL:', API_BASE_URL);

export const REDIRECT_URIS = [
  'http://localhost:8888/callback',
  'https://api.statify.app/callback'
]; 