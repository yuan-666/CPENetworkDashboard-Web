<script setup lang="ts">
import { RouterLink } from 'vue-router'
import LazyImage from '@/components/LazyImage.vue'
import { appIcon, heroDesktopImage, heroFacts, mobileScreens, telemetryWords } from '@/content'

const marqueeWords = [...telemetryWords, ...telemetryWords]
</script>

<template>
  <section class="page-view home-page">
    <div class="hero-copy">
      <div class="app-mark">
        <img :src="appIcon" alt="" loading="eager" decoding="async" fetchpriority="high" />
        <span>Android 3.1 / macOS & Windows 3.0.0</span>
      </div>
      <h1>
        别先重启，<br />
        先看 CPE。
      </h1>
      <p>
        久等了，各位。Android 3.1 已经放出，macOS 和 Windows 也有了 3.0.0
        桌面包。我们想做的不是另一个后台，而是让你看清楚 CPE 现在到底发生了什么。
      </p>
      <p class="hero-note">
        信号、小区、锁定、测速、Ping
        和路由测试放在同一个地方。现场调试时少猜一点，改完以后也能马上验证。
      </p>
      <div class="hero-actions">
        <RouterLink class="action primary" to="/download">下载适合的版本</RouterLink>
        <RouterLink class="action secondary" to="/product">看看它怎么用</RouterLink>
      </div>
      <div class="fact-line" aria-label="核心指标">
        <span v-for="fact in heroFacts" :key="fact.label">
          <small>{{ fact.label }}</small>
          <strong>{{ fact.value }}</strong>
        </span>
      </div>
    </div>

    <div class="hero-stage" aria-label="产品界面预览">
      <div class="scan-line"></div>
      <div class="signal-radar" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="desktop-window hero-desktop">
        <div class="window-bar">
          <span></span>
          <span></span>
          <span></span>
          <strong>Desktop Dashboard</strong>
        </div>
        <LazyImage :src="heroDesktopImage" alt="CPE 网络看板电脑端截图" eager />
      </div>
      <div class="phone-shell hero-phone">
        <LazyImage :src="mobileScreens[0]" alt="CPE 网络看板 Android 截图" eager />
      </div>
      <div class="live-card">
        <span>Local CPE</span>
        <strong>192.168.x.1</strong>
        <small>signal / lock / test</small>
      </div>
      <div class="metric-tape" aria-hidden="true">
        <span>RSRP -86</span>
        <span>SINR 23</span>
        <span>PCI 147</span>
        <span>AMBR 1000M</span>
      </div>
    </div>

    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">
        <span v-for="(word, index) in marqueeWords" :key="`${word}-${index}`">{{ word }}</span>
      </div>
    </div>
  </section>
</template>
