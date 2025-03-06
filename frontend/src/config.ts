// set true for local development and false for production
const isDevelopment = process.env.NODE_ENV === 'development';
const isLocalBackend = process.env.REACT_APP_USE_LOCAL_BACKEND === 'true'; 

export const API_BASE_URL = isDevelopment && isLocalBackend
  ? 'http://localhost:8888'
  : 'http://18.118.20.116:8888';

export const REDIRECT_URIS = [
  'http://localhost:8888/callback',
  'http://18.118.20.116:8888/callback'
]; 