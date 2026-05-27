<script setup lang="ts">
import { ref } from 'vue'
import LazyImage from '@/components/LazyImage.vue'
import {
  desktopScreens,
  heroDesktopImage,
  mobileScreens,
  platformCards,
  productMoments,
  supportedDevices,
} from '@/content'

const activeDesktop = ref(heroDesktopImage)
const activeMobile = ref(mobileScreens[0])
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

    <section class="showcase-section desktop-showcase">
      <div class="section-copy">
        <p>电脑端</p>
        <h2>坐下来排查时，信息要铺开。</h2>
        <span>横向界面适合长时间看连接状态、锁定回读、测速和日志，少在几个后台之间来回切。</span>
      </div>
      <div class="desktop-workbench">
        <div class="desktop-window">
          <div class="window-bar">
            <span></span>
            <span></span>
            <span></span>
            <strong>macOS / Windows</strong>
          </div>
          <div class="desktop-screen-frame">
            <LazyImage :src="activeDesktop" alt="CPE 网络看板电脑端截图" />
          </div>
        </div>
        <div class="thumb-row desktop-thumbs" aria-label="切换电脑端截图">
          <button
            v-for="(screen, index) in desktopScreens"
            :key="screen"
            type="button"
            :class="{ active: activeDesktop === screen }"
            @click="activeDesktop = screen"
          >
            <LazyImage :src="screen" alt="" />
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
          </button>
        </div>
      </div>
    </section>

    <section class="showcase-section mobile-showcase">
      <div class="mobile-wall">
        <div class="phone-shell phone-main">
          <LazyImage :src="activeMobile" alt="CPE 网络看板 Android 手机截图" />
        </div>
        <div class="thumb-row phone-thumbs" aria-label="切换 Android 手机截图">
          <button
            v-for="(screen, index) in mobileScreens.slice(0, 9)"
            :key="screen"
            type="button"
            :class="{ active: activeMobile === screen }"
            @click="activeMobile = screen"
          >
            <LazyImage :src="screen" alt="" />
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
          </button>
        </div>
      </div>
      <div class="section-copy">
        <p>手机端</p>
        <h2>人在设备旁边，手机反而更专业。</h2>
        <span>弱电箱、窗边、机柜旁边，拿起手机看状态和改锁定会更顺手。</span>
      </div>
    </section>

    <section class="platform-section">
      <div class="section-copy">
        <p>平台</p>
        <h2>不同场景，用不同版本。</h2>
      </div>
      <div class="platform-list">
        <article v-for="platform in platformCards" :key="platform.name" class="platform-row">
          <span>{{ platform.name }} / {{ platform.version }}</span>
          <h3>{{ platform.title }}</h3>
          <p>{{ platform.copy }}</p>
        </article>
      </div>
    </section>

    <section class="device-section">
      <div class="section-copy">
        <p>设备覆盖</p>
        <h2>写到哪台，就按哪台来。</h2>
        <span>
          华为、烽火、鲲鹏这些设备族会按各自接口处理。中兴目前只放 G5 Pro 和 U60
          Pro，不把没有做过的机型写成全系支持。
        </span>
      </div>
      <div class="device-table">
        <div v-for="[brand, models] in supportedDevices" :key="brand" class="device-row">
          <strong>{{ brand }}</strong>
          <span>{{ models }}</span>
        </div>
      </div>
    </section>
  </section>
</template>
