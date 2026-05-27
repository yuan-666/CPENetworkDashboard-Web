<script setup lang="ts">
import ScrollImageSwitcher from '@/components/ScrollImageSwitcher.vue'
import {
  desktopScreenLabels,
  desktopScreens,
  mobileScreenLabels,
  mobileScreens,
  platformCards,
  productMoments,
  supportedDevices,
} from '@/content'

const desktopFeatures = [
  ['01', '连接看板', '小区、射频、功率和链路状态集中呈现。'],
  ['02', '锁定回读', '锁频、锁 ARFCN 和锁 PCI 都按结果验证。'],
  ['03', '链路测试', '测速、Ping、路由测试分开看，不混在一起。'],
]

const mobileFeatures = [
  ['01', '现场查看', '站在设备旁边也能看清关键指标。'],
  ['02', '快速锁定', '频段、ARFCN、PCI 的入口更短。'],
  ['03', '随手验证', '测完马上知道刚才的调整有没有效果。'],
]
</script>

<template>
  <section class="page-view product-page">
    <header class="page-heading">
      <p>产品介绍</p>
      <h1>
        <span>先看清楚，</span>
        <span>再动手，</span>
        <span>再验证。</span>
      </h1>
      <span>
        面向 4G/5G CPE
        的日常排障、现场调试和设备巡检。我们把原本分散在后台里的信息，整理成调试时真的会用到的顺序。
      </span>
    </header>

    <div class="flow-grid">
      <article v-for="(moment, index) in productMoments" :key="moment.title" class="flow-item">
        <span>{{ String(index + 1).padStart(2, '0') }} / {{ moment.label }}</span>
        <h2>{{ moment.title }}</h2>
        <p>{{ moment.copy }}</p>
        <div>
          <small v-for="point in moment.points" :key="point">{{ point }}</small>
        </div>
      </article>
    </div>

    <section
      class="showcase-section showcase-pin desktop-showcase"
      data-scroll-sequence
      :style="{ '--showcase-steps': desktopScreens.length }"
    >
      <div class="showcase-pin-stage">
        <div class="section-copy">
          <p>电脑端</p>
          <h2>坐下来排查，信息要铺开。</h2>
          <span
            >横向界面适合长时间看连接状态、锁定回读、测速和日志，不用在几个后台之间来回切。</span
          >
          <div class="feature-list">
            <div v-for="[index, title, copy] in desktopFeatures" :key="title" class="feature-item">
              <span class="feature-index">{{ index }}</span>
              <div>
                <strong>{{ title }}</strong>
                <p>{{ copy }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="showcase-image-area">
          <div class="desktop-window glass-card">
            <div class="window-bar">
              <span></span>
              <span></span>
              <span></span>
              <strong>macOS / Windows</strong>
            </div>
            <div class="desktop-screen-frame">
              <ScrollImageSwitcher
                :images="desktopScreens"
                :labels="desktopScreenLabels"
                alt="CPE 网络看板电脑端截图"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      class="showcase-section showcase-pin mobile-showcase"
      data-scroll-sequence
      :style="{ '--showcase-steps': mobileScreens.length }"
    >
      <div class="showcase-pin-stage">
        <div class="showcase-image-area mobile-image-area">
          <div class="phone-shell phone-main glass-card">
            <ScrollImageSwitcher
              :images="mobileScreens"
              :labels="mobileScreenLabels"
              alt="CPE 网络看板 Android 手机截图"
            />
          </div>
        </div>
        <div class="section-copy">
          <p>手机端</p>
          <h2>在设备旁边，手机更专业。</h2>
          <span>弱电箱、窗边、机柜旁边，拿起手机看状态和改锁定更方便。</span>
          <div class="feature-list">
            <div v-for="[index, title, copy] in mobileFeatures" :key="title" class="feature-item">
              <span class="feature-index">{{ index }}</span>
              <div>
                <strong>{{ title }}</strong>
                <p>{{ copy }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="platform-section">
      <div class="section-copy">
        <p>平台</p>
        <h2>不同场景，用不同版本。</h2>
      </div>
      <div class="platform-list">
        <article
          v-for="platform in platformCards"
          :key="platform.name"
          class="platform-row glass-card"
        >
          <span>{{ platform.name }} / {{ platform.version }}</span>
          <h3>{{ platform.title }}</h3>
          <p>{{ platform.copy }}</p>
        </article>
      </div>
    </section>

    <section class="device-section">
      <div class="section-copy">
        <p>设备覆盖</p>
        <h2>按设备族分别适配。</h2>
        <span>华为、烽火通信、鲲鹏无限会按各自接口处理；当前中兴通讯覆盖 G5 Pro / U60 Pro。</span>
      </div>
      <div class="device-table glass-card">
        <div v-for="[brand, models] in supportedDevices" :key="brand" class="device-row">
          <strong>{{ brand }}</strong>
          <span>{{ models }}</span>
        </div>
      </div>
    </section>
  </section>
</template>
