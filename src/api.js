const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/+$/, '');

function apiUrl(path) {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

async function readJson(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

export async function fetchSummary() {
  const response = await fetch(apiUrl('/analytics/summary'), {
    headers: { Accept: 'application/json' },
  });
  return readJson(response);
}

export async function trackVisit(page = window.location.pathname) {
  const response = await fetch(apiUrl('/track'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page,
      referrer: document.referrer || 'direct',
      ua: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    }),
  });
  return readJson(response);
}

export function trackDownload(fileId) {
  const payload = JSON.stringify({
    file: fileId,
    page: window.location.pathname,
    referrer: document.referrer || 'direct',
    ua: navigator.userAgent,
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' });
    return navigator.sendBeacon(apiUrl('/download'), blob);
  }

  fetch(apiUrl('/download'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {});
  return true;
}

export { API_BASE };
