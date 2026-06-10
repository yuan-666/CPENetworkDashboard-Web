import type { AnalyticsSummary, DownloadTrackResult, UpdateCheckResult } from './types'

const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/+$/, '')

function apiUrl(path: string): string {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response.json() as Promise<T>
}

function jsonHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
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
  const downloadsByVersion =
    value?.downloadsByVersion && typeof value.downloadsByVersion === 'object'
      ? value.downloadsByVersion
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
    downloadsByVersion,
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

export async function fetchPublicSummary(): Promise<AnalyticsSummary> {
  try {
    const statsResult = await fetch(apiUrl('/public-stats'), {
      headers: { Accept: 'application/json' },
    }).then((response) =>
      readJson<Partial<AnalyticsSummary> & { total?: number; today?: number }>(response)
    )
    const visits = statsResult?.visits
      ? statsResult.visits
      : {
          total: numberOrZero(statsResult?.total),
          today: numberOrZero(statsResult?.today),
        }
    const downloads = {
      downloadsTotal: statsResult?.downloadsTotal || 0,
      downloadsByFile: statsResult?.downloadsByFile || {},
      downloadsByVersion: statsResult?.downloadsByVersion || {},
    }
    return normalizeSummary({
      visits: {
        total: visits.total || 0,
        today: visits.today || 0,
      },
      downloadsTotal: downloads.downloadsTotal || 0,
      downloadsByFile: downloads.downloadsByFile || {},
      downloadsByVersion: downloads.downloadsByVersion || {},
    })
  } catch {
    const [visitsResult, downloadsResult] = await Promise.allSettled([
      fetch(apiUrl('/counter?skip=1'), { headers: { Accept: 'application/json' } }).then((response) =>
        readJson<{ total?: number; today?: number }>(response)
      ),
      fetch(apiUrl('/downloads'), { headers: { Accept: 'application/json' } }).then((response) =>
        readJson<Partial<AnalyticsSummary>>(response)
      ),
    ])
    if (visitsResult.status === 'rejected' && downloadsResult.status === 'rejected') {
      throw new Error('Public analytics unavailable')
    }
    const visits = visitsResult.status === 'fulfilled' ? visitsResult.value : {}
    const downloads = downloadsResult.status === 'fulfilled' ? downloadsResult.value : {}
    return normalizeSummary({
      visits: {
        total: visits.total || 0,
        today: visits.today || 0,
      },
      downloadsTotal: downloads.downloadsTotal || 0,
      downloadsByFile: downloads.downloadsByFile || {},
      downloadsByVersion: downloads.downloadsByVersion || {},
    })
  }
}

export async function fetchProtectedSummary(token: string): Promise<AnalyticsSummary> {
  const response = await fetch(apiUrl('/analytics/summary'), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
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
    headers: jsonHeaders(),
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
  })

  try {
    const response = await fetch(apiUrl('/download'), {
      method: 'POST',
      headers: jsonHeaders(),
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
    headers: jsonHeaders(),
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
