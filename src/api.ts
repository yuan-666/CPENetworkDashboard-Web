import type { AnalyticsSummary, DownloadTrackResult, UpdateCheckResult } from './types'

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

function normalizeDownloadsByFile(value: unknown): AnalyticsSummary['downloadsByFile'] {
  if (!value || typeof value !== 'object') return {}
  return Object.fromEntries(
    Object.entries(value as Record<string, Partial<AnalyticsSummary['downloadsByFile'][string]>>)
      .filter(([id]) => id)
      .map(([id, item]) => [
        id,
        {
          total: numberOrZero(item?.total),
          today: numberOrZero(item?.today),
          label: typeof item?.label === 'string' ? item.label : undefined,
          href: typeof item?.href === 'string' ? item.href : undefined,
          platform: typeof item?.platform === 'string' ? item.platform : undefined,
          version: typeof item?.version === 'string' ? item.version : undefined,
          channel: typeof item?.channel === 'string' ? item.channel : undefined,
        },
      ])
  )
}

function normalizeHourlyData(value: AnalyticsSummary['hourly'] | null | undefined) {
  if (!value) return undefined
  const bars = arrayOrEmpty<{ hour?: unknown; count?: unknown }>(value.bars).map((bar) => ({
    hour: numberOrZero(bar.hour),
    count: numberOrZero(bar.count),
  }))
  const total = numberOrZero(value.total) || bars.reduce((sum, bar) => sum + bar.count, 0)
  const max = Math.max(numberOrZero(value.max), ...bars.map((bar) => bar.count), 0)
  return {
    bars,
    total,
    max,
    currentHour: numberOrZero(value.currentHour),
  }
}

function normalizeSummary(value: Partial<AnalyticsSummary> | null | undefined): AnalyticsSummary {
  const downloadsByFile = normalizeDownloadsByFile(value?.downloadsByFile)
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
    hourly: normalizeHourlyData(value?.hourly),
    downloadHourly: normalizeHourlyData(value?.downloadHourly),
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

export async function checkAppUpdate(options: {
  platform: 'android' | 'windows' | 'macos' | 'ios'
  version: string
  versionCode?: number
  channel?: string
}): Promise<UpdateCheckResult> {
  const response = await fetch(apiUrl('/updates/check'), {
    method: 'POST',
    headers: writeHeaders(),
    body: JSON.stringify({
      platform: options.platform,
      version: options.version,
      versionCode: options.versionCode,
      channel: options.channel || 'stable',
    }),
  })
  return readJson<UpdateCheckResult>(response)
}

export { API_BASE }
