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

function numberOrZero(value: unknown): number {
  const next = Number(value)
  return Number.isFinite(next) ? next : 0
}

function arrayOrEmpty<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function normalizeSummary(value: Partial<AnalyticsSummary> | null | undefined): AnalyticsSummary {
  const downloadsByFile =
    value?.downloadsByFile && typeof value.downloadsByFile === 'object'
      ? value.downloadsByFile
      : {}
  const downloadsTotal = Object.values(downloadsByFile).reduce(
    (sum, item) => sum + numberOrZero(item?.total),
    0
  )

  return {
    visits: {
      total: numberOrZero(value?.visits?.total),
      today: numberOrZero(value?.visits?.today),
    },
    downloadsTotal: Math.max(numberOrZero(value?.downloadsTotal), downloadsTotal),
    downloadsByFile,
    pages: arrayOrEmpty(value?.pages),
    referrers: arrayOrEmpty(value?.referrers),
    devices: arrayOrEmpty(value?.devices),
    recent: arrayOrEmpty(value?.recent),
    geo: {
      countries: arrayOrEmpty(value?.geo?.countries),
      cities: arrayOrEmpty(value?.geo?.cities),
    },
    hourly: value?.hourly
      ? {
          bars: arrayOrEmpty(value.hourly.bars),
          total: numberOrZero(value.hourly.total),
          max: numberOrZero(value.hourly.max),
          currentHour: numberOrZero(value.hourly.currentHour),
        }
      : undefined,
  }
}

export async function fetchSummary(): Promise<AnalyticsSummary> {
  const response = await fetch(apiUrl('/analytics/summary'), {
    headers: { Accept: 'application/json' },
  })
  return normalizeSummary(await readJson<Partial<AnalyticsSummary>>(response))
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
