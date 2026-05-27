<script setup lang="ts">
import { useAnalytics } from '@/composables/useAnalytics'

const { totalDownloads, totalVisits, valueOrPreview } = useAnalytics()
</script>

<template>
  <footer class="footer">
    <div class="footer-main">
      <span>CPE 网络看板 / CPE Network Dashboard</span>
      <small>Copyright © 2026 yuan-666 and contributors. Released under GPL-3.0-or-later.</small>
    </div>
    <div class="footer-stats" aria-label="官网统计">
      <span>访问量 {{ valueOrPreview(totalVisits) }}</span>
      <span>下载量 {{ valueOrPreview(totalDownloads) }}</span>
    </div>
  </footer>
</template>
