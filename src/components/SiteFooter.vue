<script setup lang="ts">
import { useAnalytics } from '@/composables/useAnalytics'

const { totalDownloads, totalVisits, valueOrPreview } = useAnalytics()
</script>

<template>
  <footer class="footer">
    <div class="footer-main">
      <span>CPE加加 / CPE++</span>
      <small>Copyright © 2026 yuan-666, chazime and contributors. All rights reserved.</small>
    </div>
    <div class="footer-stats" aria-label="官网统计">
      <span>总访问量 {{ valueOrPreview(totalVisits) }}</span>
      <span>总下载量 {{ valueOrPreview(totalDownloads) }}</span>
    </div>
  </footer>
</template>
