import { computed, ref } from 'vue'
import { fetchSummary, trackVisit } from '@/api'
import type { AnalyticsSummary } from '@/types'
import { formatNumber } from '@/utils/format'

const summary = ref<AnalyticsSummary | null>(null)
const analyticsState = ref<'loading' | 'ready' | 'offline'>('loading')

async function loadSummary(): Promise<void> {
  try {
    summary.value = await fetchSummary()
    analyticsState.value = 'ready'
  } catch {
    analyticsState.value = 'offline'
  }
}

async function recordVisit(page: string): Promise<void> {
  await Promise.allSettled([trackVisit(page)])
  await loadSummary()
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
