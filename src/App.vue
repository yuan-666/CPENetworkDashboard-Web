<script setup>
import { computed, onMounted, ref } from 'vue';
import {
  appIcon,
  desktopScreens,
  downloads,
  heroDesktopImage,
  phoneScreens,
  platformCards,
  releaseNotes,
  scenePages,
  supportedDevices,
} from './content';
import { fetchSummary, trackDownload, trackVisit } from './api';

const summary = ref(null);
const analyticsState = ref('loading');
const activeDesktop = ref(desktopScreens[0]);
const copiedChecksum = ref('');

const downloadTotals = computed(() => summary.value?.downloadsByFile || {});
const totalDownloads = computed(() => summary.value?.downloadsTotal ?? null);
const totalVisits = computed(() => summary.value?.visits?.total ?? null);

function valueOrPreview(value) {
  return Number.isFinite(value) ? value.toLocaleString('zh-CN') : '部署后统计';
}

function statForDownload(id) {
  const item = downloadTotals.value[id];
  if (!item) return analyticsState.value === 'ready' ? '0 次' : '待统计';
  return `${Number(item.total || 0).toLocaleString('zh-CN')} 次`;
}

function handleDownload(fileId) {
  trackDownload(fileId);
}

async function copyChecksum(download) {
  try {
    await navigator.clipboard.writeText(download.checksum);
    copiedChecksum.value = download.id;
    window.setTimeout(() => {
      if (copiedChecksum.value === download.id) copiedChecksum.value = '';
    }, 1800);
  } catch {
    copiedChecksum.value = '';
  }
}

async function loadSummary() {
  try {
    summary.value = await fetchSummary();
    analyticsState.value = 'ready';
  } catch {
    analyticsState.value = 'offline';
  }
}

onMounted(async () => {
  await Promise.allSettled([trackVisit(), loadSummary()]);
  window.setTimeout(loadSummary, 1200);
});
</script>

<template>
  <div class="site-shell">
    <header class="topbar">
      <a class="brand-lockup" href="#top" aria-label="CPE 网络看板首页">
        <img :src="appIcon" alt="" />
        <span>
          <strong>CPE 网络看板</strong>
          <small>Network Dashboard</small>
        </span>
      </a>
      <nav class="nav-links" aria-label="主导航">
        <a href="#scene">场景</a>
        <a href="#platforms">平台</a>
        <a href="#gallery">界面</a>
        <a href="#downloads">下载</a>
        <a href="#release">更新</a>
      </nav>
    </header>

    <main id="top">
      <section class="hero page">
        <div class="hero-copy-block">
          <p class="eyebrow">CPE Network Dashboard</p>
          <h1>
            <span>先看清 CPE，</span>
            <span>再调好网络。</span>
          </h1>
          <p>
            给 4G/5G CPE 用户的一张操作台。信号、小区、锁频、测速和出口状态放在一起看，
            少翻几层后台，也少靠感觉判断。
          </p>
          <div class="hero-actions">
            <a class="primary-action" href="#downloads">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4v10m0 0 3.5-3.5M12 14l-3.5-3.5M5 20h14" />
              </svg>
              下载最新版
            </a>
            <a class="secondary-action" href="#scene">看看能做什么</a>
          </div>
        </div>

        <div class="hero-product">
          <div class="hero-icon-card">
            <img :src="appIcon" alt="CPE 网络看板应用图标" />
            <span>Android 3.1</span>
          </div>
          <div class="hero-window">
            <div class="window-bar">
              <span></span>
              <span></span>
              <span></span>
              <strong>正在查看 CPE 连接状态</strong>
            </div>
            <img :src="heroDesktopImage" alt="CPE 网络看板桌面界面" />
          </div>
          <div class="signal-card">
            <span>当前公开下载</span>
            <strong>Android / macOS / Windows</strong>
            <small>安装包由 ESA 静态分发，点击统计不影响下载。</small>
          </div>
        </div>
      </section>

      <section id="scene" class="page scene-page">
        <article v-for="scene in scenePages" :key="scene.title" class="scene-panel">
          <div>
            <p class="eyebrow">{{ scene.kicker }}</p>
            <h2>{{ scene.title }}</h2>
          </div>
          <p>{{ scene.copy }}</p>
          <ul>
            <li v-for="point in scene.points" :key="point">{{ point }}</li>
          </ul>
        </article>
      </section>

      <section id="platforms" class="page platforms-page">
        <div class="page-heading">
          <p class="eyebrow">Platforms</p>
          <h2>手机随身看，电脑展开看。</h2>
          <p>
            同一个产品，不强行套同一种界面。Android 适合现场快速处理，macOS 和 Windows
            适合长时间看状态和做复盘。
          </p>
        </div>
        <div class="platform-strip">
          <article v-for="platform in platformCards" :key="platform.name" class="platform-card">
            <span>{{ platform.name }} / {{ platform.version }}</span>
            <h3>{{ platform.title }}</h3>
            <p>{{ platform.copy }}</p>
          </article>
        </div>
      </section>

      <section id="gallery" class="page gallery-page">
        <div class="gallery-copy">
          <p class="eyebrow">Interface</p>
          <h2>桌面端给信息留空间，手机端给操作留速度。</h2>
          <p>
            大屏上把信号、锁频、测速和日志铺开；手机上保留卡片式节奏。两边都不只是“截图好看”，而是为了现场少点犹豫。
          </p>
          <div class="screen-switcher" aria-label="切换桌面截图">
            <button
              v-for="(screen, index) in desktopScreens"
              :key="screen"
              type="button"
              :class="{ active: activeDesktop === screen }"
              @click="activeDesktop = screen"
            >
              {{ String(index + 1).padStart(2, '0') }}
            </button>
          </div>
        </div>
        <div class="gallery-stage">
          <img class="desktop-shot" :src="activeDesktop" alt="CPE 网络看板桌面截图" />
          <div class="phone-stack" aria-label="Android 界面预览">
            <img v-for="screen in phoneScreens.slice(0, 3)" :key="screen" :src="screen" alt="CPE 网络看板 Android 截图" />
          </div>
        </div>
      </section>

      <section class="page device-page">
        <div class="page-heading compact">
          <p class="eyebrow">Device coverage</p>
          <h2>面向真实设备，不写空泛兼容。</h2>
          <p>
            不同固件的字段会有差异，所以看板把设备族分开处理。能读到什么、能锁什么、有没有回读，都按真实接口来。
          </p>
        </div>
        <div class="device-table">
          <div v-for="[brand, models] in supportedDevices" :key="brand" class="device-row">
            <strong>{{ brand }}</strong>
            <span>{{ models }}</span>
          </div>
        </div>
      </section>

      <section id="downloads" class="page downloads-page">
        <div class="page-heading compact">
          <p class="eyebrow">Downloads</p>
          <h2>选择你现在要用的平台。</h2>
          <p>
            下载文件直接放在前端静态目录里，ESA 可以就近分发。统计接口只做聚合记录，离线也不挡下载。
          </p>
        </div>
        <div class="download-board">
          <article v-for="download in downloads" :key="download.id" class="download-card">
            <div class="download-topline">
              <span>{{ download.label }}</span>
              <small>{{ download.platform }} {{ download.version }}</small>
            </div>
            <h3>{{ download.title }}</h3>
            <p>{{ download.copy }}</p>
            <div class="download-meta">
              <span>{{ download.size }}</span>
              <span>{{ statForDownload(download.id) }}</span>
            </div>
            <div class="download-actions">
              <a class="download-button" :href="download.href" download @click="handleDownload(download.id)">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 4v10m0 0 3.5-3.5M12 14l-3.5-3.5M5 20h14" />
                </svg>
                下载
              </a>
              <button type="button" class="checksum-button" @click="copyChecksum(download)">
                {{ copiedChecksum === download.id ? '已复制' : 'SHA-256' }}
              </button>
            </div>
          </article>
        </div>
      </section>

      <section id="release" class="page release-page">
        <div class="release-intro">
          <p class="eyebrow">Release notes</p>
          <h2>更新不是堆条目，是让现场少踩坑。</h2>
          <p>
            这里只保留用户真正会感知到的变化。校验值放在下载卡片里，更新记录则尽量说清楚这次用起来哪里更稳。
          </p>
        </div>
        <div class="release-list">
          <article v-for="note in releaseNotes" :key="note.version">
            <span>{{ note.date }} / {{ note.version }}</span>
            <h3>{{ note.title }}</h3>
            <p>{{ note.copy }}</p>
          </article>
        </div>
      </section>

      <section class="page privacy-page">
        <div>
          <p class="eyebrow">Privacy</p>
          <h2>官网做统计，应用不替你上传设备信息。</h2>
          <p>
            CPE 登录、锁频、测速都发生在你的设备和局域网 CPE 之间。官网只记录访问量、下载量、来源和设备类型这类聚合信息，不公开完整 IP 或原始 User-Agent。
          </p>
        </div>
        <div class="counter-panel">
          <span>官网访问</span>
          <strong>{{ valueOrPreview(totalVisits) }}</strong>
          <small>{{ analyticsState === 'ready' ? '来自 ESA EdgeKV 聚合' : '本地预览时不会写入线上统计' }}</small>
          <span>累计下载</span>
          <strong>{{ valueOrPreview(totalDownloads) }}</strong>
        </div>
      </section>
    </main>

    <footer class="footer">
      <span>CPE 网络看板 / CPE Network Dashboard</span>
      <a href="https://github.com/yuan-666/CPENetworkDashboard-Web" rel="noreferrer">GitHub</a>
    </footer>
  </div>
</template>
