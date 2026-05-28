import { computed, ref } from 'vue'
import { fetchSummary, trackVisit } from '@/api'
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
    pages: [],
    referrers: [],
    devices: [],
    recent: [],
  }
}

function mergeSummary(next: AnalyticsSummary): AnalyticsSummary {
  const current = summary.value
  if (!current) return next

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

  return {
    ...next,
    visits: {
      total: Math.max(next.visits.total, current.visits.total),
      today: Math.max(next.visits.today, current.visits.today),
    },
    downloadsByFile,
    downloadsTotal,
  }
}

async function loadSummary(): Promise<void> {
  try {
    summary.value = mergeSummary(await fetchSummary())
    analyticsState.value = 'ready'
  } catch {
    analyticsState.value = 'offline'
  }
}

async function recordVisit(page: string): Promise<void> {
  await Promise.allSettled([trackVisit(page)])
  await loadSummary()
}

function applyDownloadTrack(result: DownloadTrackResult | null): void {
  if (!result?.ok || !result.file) return

  const download = downloads.find((item) => item.id === result.file)
  if (!download) return

  const previousSummary = summary.value || emptyAnalyticsSummary()
  const previousFile = previousSummary.downloadsByFile[result.file]
  const previousTotal = previousFile?.total || 0

  summary.value = {
    ...previousSummary,
    downloadsTotal:
      previousSummary.downloadsTotal + Math.max(0, (result.total || 0) - previousTotal),
    downloadsByFile: {
      ...previousSummary.downloadsByFile,
      [result.file]: {
        total: result.total || 0,
        today: result.today || 0,
        label: previousFile?.label || download.title,
        href: previousFile?.href || download.href || '/#/download',
      },
    },
  }
  analyticsState.value = 'ready'
}

export function useAnalytics() {
  const downloadTotals = computed(() => summary.value?.downloadsByFile || {})
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

  return {
    analyticsState,
    applyDownloadTrack,
    downloadTotals,
    loadSummary,
    recordVisit,
    statForDownload,
    summary,
    totalDownloads,
    totalVisits,
    valueOrPreview,
  }
}
