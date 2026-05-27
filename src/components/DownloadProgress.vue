<script setup lang="ts">
import type { DownloadState } from '@/types'

defineProps<{
  state: DownloadState
  text: string
  compact?: boolean
}>()
</script>

<template>
  <div
    v-if="state.status"
    :class="[compact ? 'row-progress' : 'download-progress', `state-${state.status}`]"
  >
    <div v-if="!compact">
      <span :style="{ width: `${state.progress || 0}%` }"></span>
    </div>
    <span v-else :style="{ width: `${state.progress || 0}%` }"></span>
    <p v-if="!compact">{{ text }}</p>
    <small v-else>{{ text }}</small>
  </div>
</template>
