import { computed, ref } from 'vue'
import { fetchProtectedSummary, fetchPublicSummary, trackVisit } from '@/api'
import { downloads } from '@/content'
import type { AnalyticsSummary, DownloadTrackResult } from '@/types'
import { formatNumber } from '@/utils/format'

const summary = ref<AnalyticsSummary | null>(null)
const analyticsState = ref<'loading' | 'ready' | 'offline'>('loading')

function emptyAnalyticsSummary(): AnalyticsSummary {
  return {
    visits: { total: 0, today: 0 },
    downloadsTotal: 0,
    downloadsByFile: {},
    downloadsByVersion: {},
    pages: [],
    referrers: [],
    devices: [],
    recent: [],
  }
}

function mergeSummary(next: AnalyticsSummary): AnalyticsSummary {
  const current = summary.value
  if (!current) {
    const hasVersionStats = Object.keys(next.downloadsByVersion || {}).length > 0
    return {
      ...next,
      downloadsByVersion: hasVersionStats
        ? next.downloadsByVersion
        : buildDownloadVersions(next.downloadsByFile || {}),
    }
  }

  const downloadsByFile = { ...next.downloadsByFile }
  for (const [file, stats] of Object.entries(current.downloadsByFile)) {
    const incoming = downloadsByFile[file]
    if (!incoming || stats.total > incoming.total) {
      downloadsByFile[file] = stats
    } else if (stats.today > incoming.today) {
      downloadsByFile[file] = { ...incoming, today: stats.today }
    }
  }

  const downloadsTotal = Math.max(
    next.downloadsTotal,
    Object.values(downloadsByFile).reduce((sum, item) => sum + item.total, 0)
  )
  const downloadsByVersion = buildDownloadVersions(downloadsByFile)

  return {
    ...next,
    visits: {
      total: Math.max(next.visits.total, current.visits.total),
      today: Math.max(next.visits.today, current.visits.today),
    },
    downloadsByFile,
    downloadsByVersion,
    downloadsTotal,
  }
}

function versionKey(platform: string, version: string): string {
  return `${platform.toLowerCase()}-${version}`
}

function versionLabel(platform: string, version: string): string {
  const name =
    platform.toLowerCase() === 'android'
      ? 'Android'
      : platform.toLowerCase() === 'macos'
        ? 'macOS'
        : platform.toLowerCase() === 'windows'
          ? 'Windows'
          : platform.toLowerCase() === 'ios'
            ? 'iOS'
            : platform
  return `${name} ${version}`
}

function buildDownloadVersions(downloadsByFile: AnalyticsSummary['downloadsByFile']) {
  const result: AnalyticsSummary['downloadsByVersion'] = {}

  for (const download of downloads) {
    const stats = downloadsByFile[download.id]
    const key = versionKey(download.platform, download.version)
    const current =
      result[key] ||
      ({
        id: key,
        platform: download.platform,
        version: download.version,
        label: versionLabel(download.platform, download.version),
        total: 0,
        today: 0,
        fileIds: [],
      } satisfies AnalyticsSummary['downloadsByVersion'][string])

    current.fileIds.push(download.id)
    current.total += stats?.total || 0
    current.today += stats?.today || 0
    result[key] = current
  }

  return result
}

async function loadSummary(): Promise<void> {
  try {
    summary.value = mergeSummary(await fetchPublicSummary())
    analyticsState.value = 'ready'
  } catch {
    analyticsState.value = 'offline'
  }
}

async function loadProtectedSummary(token: string): Promise<boolean> {
  try {
    summary.value = mergeSummary(await fetchProtectedSummary(token))
    analyticsState.value = 'ready'
    return true
  } catch {
    analyticsState.value = 'offline'
    return false
  }
}

async function recordVisit(page: string): Promise<void> {
  await Promise.allSettled([trackVisit(page)])
  await loadSummary()
}

function applyDownloadTrack(result: DownloadTrackResult | null): void {
  if (!result?.ok || !result.file) return

  const download = downloads.find((item) => item.id === result.file)
  const previousSummary = summary.value || emptyAnalyticsSummary()
  const previousFile = previousSummary.downloadsByFile[result.file]
  const previousTotal = previousFile?.total || 0

  const downloadsByFile = {
    ...previousSummary.downloadsByFile,
    [result.file]: {
      total: result.total || 0,
      today: result.today || 0,
      label: previousFile?.label || download?.title || result.file,
      href: previousFile?.href || download?.href || '/#/download',
    },
  }

  summary.value = {
    ...previousSummary,
    downloadsTotal:
      previousSummary.downloadsTotal + Math.max(0, (result.total || 0) - previousTotal),
    downloadsByFile,
    downloadsByVersion: buildDownloadVersions(downloadsByFile),
  }
  analyticsState.value = 'ready'
}

export function useAnalytics() {
  const downloadTotals = computed(() => summary.value?.downloadsByFile || {})
  const downloadVersionTotals = computed(() => {
    const existing = summary.value?.downloadsByVersion || {}
    if (Object.keys(existing).length > 0) return existing
    return buildDownloadVersions(summary.value?.downloadsByFile || {})
  })
  const totalDownloads = computed(() => summary.value?.downloadsTotal ?? null)
  const totalVisits = computed(() => summary.value?.visits?.total ?? null)

  function valueOrPreview(value: number | null | undefined): string {
    return formatNumber(value)
  }

  function statForDownload(id: string): string {
    const item = downloadTotals.value[id]
    if (!item) {
      if (analyticsState.value === 'ready') return '0 次下载'
      if (analyticsState.value === 'offline') return '部署后统计'
      return '下载统计加载中'
    }
    return `${formatNumber(item.total, '0')} 次下载`
  }

  function statForVersion(platform: string, version: string): string {
    const item = downloadVersionTotals.value[versionKey(platform, version)]
    if (!item) {
      if (analyticsState.value === 'ready') return '0 次下载'
      if (analyticsState.value === 'offline') return '部署后统计'
      return '下载统计加载中'
    }
    return `${formatNumber(item.total, '0')} 次下载`
  }

  return {
    analyticsState,
    applyDownloadTrack,
    downloadTotals,
    downloadVersionTotals,
    loadProtectedSummary,
    loadSummary,
    recordVisit,
    statForDownload,
    statForVersion,
    summary,
    totalDownloads,
    totalVisits,
    valueOrPreview,
  }
}
