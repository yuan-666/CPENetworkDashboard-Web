<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'
import SiteFooter from '@/components/SiteFooter.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import FooterFlow from '@/components/FooterFlow.vue'
import { useAnalytics } from '@/composables/useAnalytics'

const route = useRoute()
const { loadSummary, recordVisit } = useAnalytics()

const pageKey = computed(() => route.fullPath)
const privacyStorageKey = 'cpe-plus-plus-privacy-notice-v1'
const privacyNoticeVisible = ref(false)
const trackingAllowed = ref(false)

async function refreshPublicStats(): Promise<void> {
  await loadSummary()
}

async function maybeRecordVisit(path: string): Promise<void> {
  if (trackingAllowed.value) {
    await recordVisit(path)
    return
  }
  await refreshPublicStats()
}

async function acceptPrivacyNotice(): Promise<void> {
  localStorage.setItem(privacyStorageKey, 'accepted')
  privacyNoticeVisible.value = false
  trackingAllowed.value = true
  await recordVisit(route.path)
}

watch(
  () => route.path,
  async (path) => {
    document.title = `${String(route.meta.title || 'CPE加加')} / CPE++`
    window.scrollTo({ top: 0, behavior: 'smooth' })
    await maybeRecordVisit(path)
  }
)

onMounted(async () => {
  document.title = `${String(route.meta.title || 'CPE加加')} / CPE++`
  const accepted = localStorage.getItem(privacyStorageKey) === 'accepted'
  trackingAllowed.value = accepted
  privacyNoticeVisible.value = !accepted
  await maybeRecordVisit(route.path)
})
</script>

<template>
  <div class="site-shell">
    <SiteHeader />
    <main>
      <RouterView v-slot="{ Component }">
        <Transition name="page-fade" mode="out-in">
          <component
            :is="Component"
            :key="pageKey"
            v-motion
            :initial="{ opacity: 0, y: 12 }"
            :enter="{ opacity: 1, y: 0 }"
            :duration="320"
          />
        </Transition>
      </RouterView>
    </main>
    <FooterFlow>
      <SiteFooter />
    </FooterFlow>
    <div v-if="privacyNoticeVisible" class="privacy-notice" role="status" aria-live="polite">
      <div>
        <strong>隐私统计说明</strong>
        <p>
          官网会统计访问页面、来源、设备/浏览器/系统、粗略地区和安装包下载点击，用于判断版本下载量和站点运行情况；不公开完整 IP、原始 User-Agent 或设备登录信息。
        </p>
      </div>
      <button type="button" @click="acceptPrivacyNotice">知道了</button>
    </div>
  </div>
</template>
