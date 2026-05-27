<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { appIcon, routes } from '@/content'

type ThemeMode = 'light' | 'dark'

const theme = ref<ThemeMode>('light')
const isDark = computed(() => theme.value === 'dark')

function preferredTheme(): ThemeMode {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(nextTheme: ThemeMode): void {
  theme.value = nextTheme
  document.documentElement.dataset.theme = nextTheme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', nextTheme === 'dark' ? '#101311' : '#f5f4ee')
  localStorage.setItem('cpe-theme', nextTheme)
}

function toggleTheme(): void {
  applyTheme(isDark.value ? 'light' : 'dark')
}

onMounted(() => {
  const existing = document.documentElement.dataset.theme
  const saved = localStorage.getItem('cpe-theme')
  const nextTheme =
    existing === 'dark' || existing === 'light'
      ? existing
      : saved === 'dark' || saved === 'light'
        ? saved
        : preferredTheme()
  applyTheme(nextTheme)
})
</script>

<template>
  <header class="topbar">
    <RouterLink class="brand-lockup" to="/" aria-label="CPE 网络看板首页">
      <img :src="appIcon" alt="" loading="eager" decoding="async" fetchpriority="high" />
      <span>
        <strong>CPE 网络看板</strong>
        <small>Network Dashboard</small>
      </span>
    </RouterLink>
    <div class="topbar-actions">
      <nav class="nav-links" aria-label="主导航">
        <RouterLink
          v-for="route in routes"
          :key="route.path"
          :to="route.path"
          :class="{ active: $route.path === route.path }"
        >
          {{ route.label }}
        </RouterLink>
      </nav>
      <button
        class="theme-toggle"
        :class="{ 'is-dark': isDark }"
        type="button"
        :aria-label="isDark ? '切换到亮色模式' : '切换到深色模式'"
        :aria-pressed="isDark"
        @click="toggleTheme"
      >
        <svg class="sun-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2.8v2.4M12 18.8v2.4M4.3 4.3 6 6M18 18l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.3 19.7 6 18M18 6l1.7-1.7"
          />
        </svg>
        <svg class="moon-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.2 14.4A7.6 7.6 0 0 1 9.6 3.8 8.4 8.4 0 1 0 20.2 14.4Z" />
        </svg>
      </button>
    </div>
  </header>
</template>
