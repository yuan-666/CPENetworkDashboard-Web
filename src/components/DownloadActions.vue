<script setup lang="ts">
import DownloadProgress from '@/components/DownloadProgress.vue'
import type { Download, DownloadState } from '@/types'

defineProps<{
  download: Download
  buttonText: string
  copied: boolean
  busy: boolean
  state: DownloadState
  progressText: string
  compact?: boolean
  meta?: string
}>()

const emit = defineEmits<{
  direct: [fileId: string]
  chunked: [download: Download]
  checksum: [download: Download]
}>()
</script>

<template>
  <div :class="compact ? 'download-row-actions' : 'download-actions'">
    <small v-if="compact">{{ meta || download.size }}</small>
    <a
      v-if="!download.chunks"
      :class="compact ? undefined : 'action primary'"
      :href="download.href"
      :download="download.fileName"
      @click="emit('direct', download.id)"
    >
      {{ compact ? '下载' : buttonText }}
    </a>
    <button
      v-else
      type="button"
      :class="compact ? undefined : 'action primary'"
      :disabled="busy"
      @click="emit('chunked', download)"
    >
      {{ buttonText }}
    </button>
    <button
      type="button"
      :class="compact ? undefined : 'action secondary'"
      @click="emit('checksum', download)"
    >
      {{ copied ? (compact ? '已复制' : '已复制校验值') : compact ? 'SHA-256' : '复制校验值' }}
    </button>
    <DownloadProgress :state="state" :text="progressText" :compact="compact" />
  </div>
</template>
