import { computed, ref } from 'vue'
import { downloads } from '@/content'
import { trackDownload } from '@/api'
import type { Download, DownloadState, Platform } from '@/types'
import { useAnalytics } from '@/composables/useAnalytics'
import { detectPlatform, platformAdviceMap } from '@/utils/platform'
import { formatBytes } from '@/utils/format'

const downloadStates = ref<Record<string, DownloadState>>({})
const copiedChecksum = ref('')
const detectedPlatform = ref<Platform>('unknown')
const selectedDownloadId = ref('')

function setDownloadState(fileId: string, nextState: DownloadState): void {
  downloadStates.value = {
    ...downloadStates.value,
    [fileId]: {
      ...(downloadStates.value[fileId] || { status: '' }),
      ...nextState,
    },
  }
}

function getDownloadState(fileId: string): DownloadState {
  return downloadStates.value[fileId] || { status: '' }
}

function readChunkBlob(
  url: string,
  onProgress?: (event: { loaded: number; total: number }) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.responseType = 'blob'
    request.onprogress = (event) => {
      onProgress?.({
        loaded: event.loaded,
        total: event.lengthComputable ? event.total : 0,
      })
    }
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve(request.response)
      } else {
        reject(new Error(`HTTP ${request.status}`))
      }
    }
    request.onerror = () => reject(new Error('Network error'))
    request.send()
  })
}

function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 8000)
}

export function useDownloads() {
  const { loadSummary } = useAnalytics()

  const platformAdvice = computed(() => platformAdviceMap[detectedPlatform.value])

  const recommendedDownload = computed(() => {
    const selected = downloads.find((download) => download.id === selectedDownloadId.value)
    if (selected) return selected
    return (
      downloads.find((download) => download.id === platformAdvice.value.primaryId) || downloads[0]
    )
  })

  const otherDownloads = computed(() =>
    downloads.filter((download) => download.id !== recommendedDownload.value.id)
  )

  function initDownloadRecommendation(): void {
    detectedPlatform.value = detectPlatform()
    if (!selectedDownloadId.value) selectedDownloadId.value = platformAdvice.value.primaryId
  }

  function selectDownload(downloadId: string): void {
    selectedDownloadId.value = downloadId
  }

  function isDownloadBusy(fileId: string): boolean {
    return ['downloading', 'assembling'].includes(getDownloadState(fileId).status)
  }

  function downloadButtonText(download: Download): string {
    const state = getDownloadState(download.id)
    if (state.status === 'downloading') return `正在下载 ${state.progress || 0}%`
    if (state.status === 'assembling') return '正在合并'
    if (state.status === 'done') return '已开始保存'
    if (state.status === 'error') return '重试下载'
    return download.chunks?.length ? '下载并自动合并' : '下载'
  }

  function downloadStatusText(download: Download): string {
    const state = getDownloadState(download.id)
    if (state.status === 'downloading') {
      const chunk = state.chunkCount
        ? `分片 ${state.currentChunk || 1}/${state.chunkCount}`
        : '正在下载'
      const bytes =
        state.loadedBytes && state.totalBytes
          ? `，${formatBytes(state.loadedBytes)} / ${formatBytes(state.totalBytes)}`
          : ''
      return `${chunk}${bytes}`
    }
    if (state.status === 'assembling') return '分片已下载完成，正在合并成原始安装包。'
    if (state.status === 'done') return '浏览器已经开始保存文件。'
    if (state.status === 'error') return '下载中断了，可以重新点击下载。'
    return ''
  }

  function handleDownload(fileId: string): void {
    trackDownload(fileId)
    window.setTimeout(loadSummary, 800)
  }

  async function downloadChunkedFile(download: Download): Promise<void> {
    if (!download.chunks?.length) return

    trackDownload(download.id)
    const totalBytes = (download.chunkBytes || []).reduce((sum, value) => sum + value, 0)
    let loadedBefore = 0
    setDownloadState(download.id, {
      status: 'downloading',
      progress: 0,
      loadedBytes: 0,
      totalBytes,
      currentChunk: 1,
      chunkCount: download.chunks.length,
    })

    try {
      const blobs: Blob[] = []
      for (let index = 0; index < download.chunks.length; index += 1) {
        const expectedChunkBytes = download.chunkBytes?.[index] || 0
        const blob = await readChunkBlob(download.chunks[index], ({ loaded, total }) => {
          const safeTotal =
            totalBytes || download.chunks!.length * (total || expectedChunkBytes || 1)
          const safeLoaded = loadedBefore + loaded
          const progress = safeTotal
            ? Math.min(99, Math.round((safeLoaded / safeTotal) * 100))
            : Math.round(((index + 1) / download.chunks!.length) * 100)
          setDownloadState(download.id, {
            status: 'downloading',
            progress,
            loadedBytes: safeLoaded,
            totalBytes: safeTotal,
            currentChunk: index + 1,
            chunkCount: download.chunks!.length,
          })
        })

        blobs.push(blob)
        loadedBefore += expectedChunkBytes || blob.size || 0
        setDownloadState(download.id, {
          status: 'downloading',
          progress: totalBytes
            ? Math.min(99, Math.round((loadedBefore / totalBytes) * 100))
            : Math.round(((index + 1) / download.chunks.length) * 100),
          loadedBytes: loadedBefore,
          totalBytes,
          currentChunk: index + 1,
          chunkCount: download.chunks.length,
        })
      }

      setDownloadState(download.id, {
        status: 'assembling',
        progress: 100,
        loadedBytes: totalBytes || loadedBefore,
        totalBytes: totalBytes || loadedBefore,
        currentChunk: download.chunks.length,
        chunkCount: download.chunks.length,
      })

      saveBlob(new Blob(blobs, { type: 'application/octet-stream' }), download.fileName)
      setDownloadState(download.id, { status: 'done', progress: 100 })
      window.setTimeout(() => {
        if (getDownloadState(download.id).status === 'done') {
          setDownloadState(download.id, { status: '', progress: 0 })
        }
      }, 2200)
      window.setTimeout(loadSummary, 800)
    } catch {
      setDownloadState(download.id, { status: 'error', progress: 0 })
    }
  }

  async function copyChecksum(download: Download): Promise<void> {
    try {
      await navigator.clipboard.writeText(download.checksum)
      copiedChecksum.value = download.id
      window.setTimeout(() => {
        if (copiedChecksum.value === download.id) copiedChecksum.value = ''
      }, 1800)
    } catch {
      copiedChecksum.value = ''
    }
  }

  return {
    copiedChecksum,
    copyChecksum,
    detectedPlatform,
    downloadButtonText,
    downloadChunkedFile,
    downloadStatusText,
    getDownloadState,
    handleDownload,
    initDownloadRecommendation,
    isDownloadBusy,
    otherDownloads,
    platformAdvice,
    recommendedDownload,
    selectDownload,
  }
}
