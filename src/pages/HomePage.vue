<script setup lang="ts">
import { RouterLink } from 'vue-router'
import LazyImage from '@/components/LazyImage.vue'
import FlowAnimation from '@/components/FlowAnimation.vue'
import { appIcon, heroDesktopImage, heroFacts, mobileScreens, telemetryWords } from '@/content'

const marqueeGroups = [telemetryWords, telemetryWords, telemetryWords, telemetryWords]
</script>

<template>
  <section class="page-view home-page">
    <div class="hero-copy">
      <div class="app-mark">
        <img :src="appIcon" alt="" loading="eager" decoding="async" fetchpriority="high" />
        <span>Android 3.6.5 · macOS / Windows 3.5.3</span>
      </div>
      <h1 class="hero-title">
        <span class="hero-title-main">CPE加加</span>
        <span class="hero-title-sub">CPE++</span>
      </h1>
      <p>
        Android 3.6.5 已单独发布，软件名暂时改回 CPE网络看板；macOS 和 Windows 当前仍为 3.5.3。
        它把 CPE 当前状态、锁定结果和链路测试放到同一个工作界面。
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
      <FlowAnimation />
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
        <div class="desktop-screen-frame">
          <LazyImage :src="heroDesktopImage" alt="CPE加加电脑端截图" eager />
        </div>
      </div>
      <div class="phone-shell hero-phone">
        <LazyImage :src="mobileScreens[0]" alt="CPE加加 Android 截图" eager />
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
        <div v-for="(group, groupIndex) in marqueeGroups" :key="groupIndex" class="marquee-group">
          <span v-for="word in group" :key="`${groupIndex}-${word}`">{{ word }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
