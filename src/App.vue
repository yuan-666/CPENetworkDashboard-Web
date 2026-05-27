<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed, onMounted, watch } from 'vue'
import SiteFooter from '@/components/SiteFooter.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import { useAnalytics } from '@/composables/useAnalytics'

const route = useRoute()
const { loadSummary, recordVisit } = useAnalytics()

const pageKey = computed(() => route.fullPath)

watch(
  () => route.path,
  async (path) => {
    document.title = `${String(route.meta.title || 'CPE 网络看板')} / CPE Network Dashboard`
    window.scrollTo({ top: 0, behavior: 'smooth' })
    await recordVisit(path)
  }
)

onMounted(async () => {
  document.title = `${String(route.meta.title || 'CPE 网络看板')} / CPE Network Dashboard`
  await Promise.allSettled([recordVisit(route.path), loadSummary()])
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
    <SiteFooter />
  </div>
</template>
