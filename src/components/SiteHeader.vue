<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { appIcon, routes } from '@/content'
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
  </header>
</template>
