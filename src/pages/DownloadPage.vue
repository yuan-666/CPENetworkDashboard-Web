<script setup lang="ts">
import { onMounted } from 'vue'
import DownloadActions from '@/components/DownloadActions.vue'
import { downloads } from '@/content'
import { useAnalytics } from '@/composables/useAnalytics'
import { useDownloads } from '@/composables/useDownloads'

const { statForDownload } = useAnalytics()
const {
  copiedChecksum,
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
  copyChecksum,
} = useDownloads()

onMounted(initDownloadRecommendation)
</script>

<template>
  <section class="page-view download-page">
    <header class="page-heading compact-heading">
      <p>下载</p>
      <h1>按当前设备，直接下对版本。</h1>
      <span>
        页面会自动识别 Android、macOS 或
        Windows。桌面大包会按分片取回，下载过程中可以看到实时进度，最后在浏览器里合成原文件。
      </span>
    </header>

    <div class="download-grid">
      <aside class="detect-panel">
        <span>已识别当前设备</span>
        <strong>{{ platformAdvice.device }}</strong>
        <h2>{{ platformAdvice.title }}</h2>
        <p>{{ platformAdvice.copy }}</p>
        <div class="download-switcher" aria-label="手动选择下载项">
          <button
            v-for="download in downloads"
            :key="download.id"
            type="button"
            :class="{ active: recommendedDownload.id === download.id }"
            @click="selectDownload(download.id)"
          >
            {{ download.platform }}
            <small>{{
              download.title.replace(download.platform, '').trim() || download.version
            }}</small>
          </button>
        </div>
      </aside>

      <article class="download-card selected-download">
        <div class="download-card-head">
          <span>{{ recommendedDownload.label }}</span>
          <small>{{ recommendedDownload.platform }} {{ recommendedDownload.version }}</small>
        </div>
        <h2>{{ recommendedDownload.title }}</h2>
        <p>{{ recommendedDownload.copy }}</p>
        <div class="download-meta">
          <span>{{ recommendedDownload.size }}</span>
          <span>{{ statForDownload(recommendedDownload.id) }}</span>
          <span>SHA-256</span>
        </div>
        <DownloadActions
          :download="recommendedDownload"
          :button-text="downloadButtonText(recommendedDownload)"
          :busy="isDownloadBusy(recommendedDownload.id)"
          :copied="copiedChecksum === recommendedDownload.id"
          :state="getDownloadState(recommendedDownload.id)"
          :progress-text="downloadStatusText(recommendedDownload)"
          @direct="handleDownload"
          @chunked="downloadChunkedFile"
          @checksum="copyChecksum"
        />
        <div
          v-if="getDownloadState(recommendedDownload.id).status === 'error'"
          class="download-error"
        >
          分片下载中断了，可以重试；已经下载的临时数据不会保存。
        </div>
      </article>
    </div>

    <div class="download-list">
      <article v-for="download in otherDownloads" :key="download.id" class="download-row">
        <div>
          <span>{{ download.label }}</span>
          <h3>{{ download.title }}</h3>
          <p>{{ download.copy }}</p>
        </div>
        <DownloadActions
          compact
          :download="download"
          :button-text="downloadButtonText(download)"
          :busy="isDownloadBusy(download.id)"
          :copied="copiedChecksum === download.id"
          :meta="`${download.size} / ${statForDownload(download.id)}`"
          :state="getDownloadState(download.id)"
          :progress-text="downloadStatusText(download)"
          @direct="handleDownload"
          @chunked="downloadChunkedFile"
          @checksum="copyChecksum"
        />
      </article>
    </div>
  </section>
</template>
