import type { AnalyticsSummary, DownloadTrackResult } from './types'

const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/+$/, '')
const API_TOKEN = String(import.meta.env.VITE_API_TOKEN || '').trim()

function apiUrl(path: string): string {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response.json() as Promise<T>
}

function writeHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(API_TOKEN ? { 'X-CPE-Stats-Token': API_TOKEN } : {}),
  }
}

export async function fetchSummary(): Promise<AnalyticsSummary> {
  const response = await fetch(apiUrl('/analytics/summary'), {
    headers: { Accept: 'application/json' },
  })
  return readJson<AnalyticsSummary>(response)
}

function currentPagePath(): string {
  const hashPath = window.location.hash?.startsWith('#/') ? window.location.hash.slice(1) : ''
  return hashPath || window.location.pathname || '/'
}

export async function trackVisit(
  page: string = currentPagePath()
): Promise<{ ok: boolean; visits: { total: number; today: number } }> {
  const response = await fetch(apiUrl('/track'), {
    method: 'POST',
    headers: writeHeaders(),
    body: JSON.stringify({
      page,
      referrer: document.referrer || 'direct',
      ua: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    }),
  })
  return readJson(response)
}

export async function trackDownload(fileId: string): Promise<DownloadTrackResult | null> {
  const payload = JSON.stringify({
    file: fileId,
    page: currentPagePath(),
    referrer: document.referrer || 'direct',
    ua: navigator.userAgent,
    token: API_TOKEN || undefined,
  })

  try {
    const response = await fetch(apiUrl('/download'), {
      method: 'POST',
      headers: writeHeaders(),
      body: payload,
      keepalive: true,
    })
    return readJson<DownloadTrackResult>(response)
  } catch {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon(apiUrl('/download'), blob)
    }
    return null
  }
}

export { API_BASE }
