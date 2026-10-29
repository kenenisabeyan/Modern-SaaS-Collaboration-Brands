/** Resolve REST API base (e.g. https://host/api or same-origin /api). */
export function resolveApiBase() {
  const v = import.meta.env.VITE_API_URL;
  let resolved;
  
  if (typeof v === 'string' && v.startsWith('http')) {
    resolved = v;
  } else if (typeof v === 'string' && v.startsWith('/') && typeof window !== 'undefined') {
    resolved = `${window.location.origin}${v}`;
  } else if (import.meta.env.DEV) {
    resolved = 'http://localhost:5000/api';
  } else if (typeof window !== 'undefined') {
    // If on Vercel and no VITE_API_URL set, default to production Render backend
    if (window.location.hostname.endsWith('vercel.app')) {
      resolved = 'https://wabiskills-seminar.onrender.com/api';
    } else {
      resolved = `${window.location.origin}/api`;
    }
  } else {
    resolved = 'http://localhost:5000/api';
  }
  
  console.log('[API] Resolved API base:', resolved, '(VITE_API_URL:', v, ')');
  return resolved;
}

/** Socket.IO connects to HTTP origin without /api. */
export function resolveSocketOrigin() {
  const v = import.meta.env.VITE_API_URL;
  let resolved;
  
  if (typeof v === 'string' && v.startsWith('http')) {
    resolved = v.replace(/\/?api\/?$/, '') || v;
  } else if (typeof v === 'string' && v.startsWith('/') && typeof window !== 'undefined') {
    resolved = window.location.origin;
  } else if (import.meta.env.DEV) {
    resolved = 'http://localhost:5000';
  } else if (typeof window !== 'undefined') {
    // If on Vercel and no VITE_API_URL set, default to production Render backend
    if (window.location.hostname.endsWith('vercel.app')) {
      resolved = 'https://wabiskills-seminar.onrender.com';
    } else {
      resolved = window.location.origin;
    }
  } else {
    resolved = 'http://localhost:5000';
  }
  
  console.log('[Socket] Resolved socket origin:', resolved, '(VITE_API_URL:', v, ')');
  return resolved;
}
