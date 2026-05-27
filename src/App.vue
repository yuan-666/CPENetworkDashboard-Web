<script setup>
import { computed, onMounted, ref } from 'vue';
import {
  appIcon,
  desktopScreens,
  downloads,
  heroDesktopImage,
  mobileScreens,
  platformCards,
  releaseNotes,
  storyCards,
  supportedDevices,
} from './content';
import { fetchSummary, trackDownload, trackVisit } from './api';

const summary = ref(null);
const analyticsState = ref('loading');
const activeDesktop = ref(heroDesktopImage);
const activeMobile = ref(mobileScreens[0]);
const copiedChecksum = ref('');

const primaryDownload = computed(() => downloads[0]);
const desktopDownloads = computed(() => downloads.slice(1));
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
        <a href="#desktop">电脑端</a>
        <a href="#mobile">手机端</a>
        <a href="#downloads">下载</a>
        <a href="#release">更新</a>
      </nav>
    </header>

    <main id="top">
      <section class="hero page">
        <div class="hero-copy">
          <p class="eyebrow">For 4G / 5G CPE</p>
          <h1>
            <span>先看清 CPE，</span>
            <span>再调好网络。</span>
          </h1>
          <p>
            CPE 网络看板把信号、小区、锁频、测速和路由测试放到一个清楚的界面里。
            网速变慢、信号飘、设备切小区时，你先看到原因，再决定怎么调。
          </p>
          <div class="hero-actions">
            <a class="primary-action" href="#downloads">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4v10m0 0 3.5-3.5M12 14l-3.5-3.5M5 20h14" />
              </svg>
              下载最新版
            </a>
            <a class="secondary-action" href="#scene">先看看适不适合你</a>
          </div>
          <div class="hero-points" aria-label="核心能力">
            <span>信号质量</span>
            <span>锁频锁小区</span>
            <span>测速与 Ping</span>
          </div>
        </div>

        <div class="hero-media" aria-label="电脑端界面预览">
          <div class="desktop-frame hero-frame">
            <div class="frame-bar">
              <span></span>
              <span></span>
              <span></span>
              <strong>电脑端界面</strong>
            </div>
            <img :src="heroDesktopImage" alt="CPE 网络看板电脑端截图" />
          </div>
          <div class="product-tag">
            <img :src="appIcon" alt="" />
            <span>Android 3.1</span>
            <strong>macOS / Windows 3.0.0</strong>
          </div>
        </div>
      </section>

      <section id="scene" class="page story-page">
        <div class="section-copy story-intro">
          <p class="eyebrow">When to use it</p>
          <h2>当 CPE 表现不稳定时，你需要的是判断顺序。</h2>
          <p>
            这个工具不是把后台字段搬出来给你看，而是按真实排障过程组织信息：
            先看状态，再调参数，最后验证结果。
          </p>
        </div>
        <div class="story-grid">
          <article v-for="card in storyCards" :key="card.title" class="story-card">
            <span>{{ card.label }}</span>
            <h3>{{ card.title }}</h3>
            <p>{{ card.copy }}</p>
          </article>
        </div>
      </section>

      <section id="desktop" class="page desktop-page">
        <div class="section-copy">
          <p class="eyebrow">Computer screenshots</p>
          <h2>电脑端：把信息摊开看。</h2>
          <p>
            横向界面留给 macOS 和 Windows。大屏上可以同时看连接、锁频、测速和日志，
            适合坐下来做一轮完整排查。
          </p>
        </div>
        <div class="desktop-showcase">
          <div class="desktop-frame">
            <div class="frame-bar">
              <span></span>
              <span></span>
              <span></span>
              <strong>Desktop / macOS / Windows</strong>
            </div>
            <img :src="activeDesktop" alt="CPE 网络看板电脑端截图" />
          </div>
          <div class="desktop-thumbs" aria-label="切换电脑端截图">
            <button
              v-for="(screen, index) in desktopScreens"
              :key="screen"
              type="button"
              :class="{ active: activeDesktop === screen }"
              @click="activeDesktop = screen"
            >
              <img :src="screen" alt="" />
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
            </button>
          </div>
        </div>
      </section>

      <section id="mobile" class="page mobile-page">
        <div class="mobile-gallery">
          <div class="phone-frame phone-main">
            <img :src="activeMobile" alt="CPE 网络看板 Android 手机截图" />
          </div>
          <div class="phone-strip" aria-label="切换 Android 手机截图">
            <button
              v-for="(screen, index) in mobileScreens.slice(0, 7)"
              :key="screen"
              type="button"
              :class="{ active: activeMobile === screen }"
              @click="activeMobile = screen"
            >
              <img :src="screen" alt="" />
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
            </button>
          </div>
        </div>
        <div class="section-copy mobile-copy">
          <p class="eyebrow">Phone screenshots</p>
          <h2>手机端：站在设备旁边也能操作。</h2>
          <p>
            Android 的长屏界面适合站在设备旁边快速看信号、锁频、测速，
            不需要打开电脑，也不用在路由器后台来回翻。
          </p>
          <div class="mobile-notes">
            <span>现场调试</span>
            <span>深色移动界面</span>
            <span>Android 3.1 最新版</span>
          </div>
        </div>
      </section>

      <section id="platforms" class="page platforms-page">
        <div class="section-copy">
          <p class="eyebrow">Three ways to use</p>
          <h2>不是同一个界面硬套三端。</h2>
          <p>
            手机负责现场速度，电脑负责展开信息。不同平台都围绕同一件事：
            让 CPE 的状态更容易被看懂。
          </p>
        </div>
        <div class="platform-list">
          <article v-for="platform in platformCards" :key="platform.name" class="platform-row">
            <span>{{ platform.name }} / {{ platform.version }}</span>
            <h3>{{ platform.title }}</h3>
            <p>{{ platform.copy }}</p>
          </article>
        </div>
      </section>

      <section class="page device-page">
        <div class="section-copy">
          <p class="eyebrow">Device coverage</p>
          <h2>按真实设备族适配，不写空泛兼容。</h2>
          <p>
            不同 CPE 固件的字段和能力会有差异。看板会按设备族处理显示、锁定和回读能力，
            能读到什么、能下发什么，尽量让你在界面里看清楚。
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
        <div class="section-copy download-copy">
          <p class="eyebrow">Downloads</p>
          <h2>现在要在哪台设备上用，就下哪一个包。</h2>
          <p>
            安装包直接分发。官网只记录聚合访问和下载次数，统计离线也不影响你拿到文件。
          </p>
        </div>
        <div class="download-layout">
          <article class="download-feature">
            <div class="download-topline">
              <span>{{ primaryDownload.label }}</span>
              <small>{{ primaryDownload.platform }} {{ primaryDownload.version }}</small>
            </div>
            <h3>{{ primaryDownload.title }}</h3>
            <p>{{ primaryDownload.copy }}</p>
            <div class="download-meta">
              <span>{{ primaryDownload.size }}</span>
              <span>{{ statForDownload(primaryDownload.id) }}</span>
            </div>
            <div class="download-actions">
              <a class="download-button" :href="primaryDownload.href" download @click="handleDownload(primaryDownload.id)">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 4v10m0 0 3.5-3.5M12 14l-3.5-3.5M5 20h14" />
                </svg>
                下载 APK
              </a>
              <button type="button" class="checksum-button" @click="copyChecksum(primaryDownload)">
                {{ copiedChecksum === primaryDownload.id ? '已复制' : 'SHA-256' }}
              </button>
            </div>
          </article>

          <div class="desktop-downloads">
            <article v-for="download in desktopDownloads" :key="download.id" class="download-row">
              <div>
                <span>{{ download.label }}</span>
                <h3>{{ download.title }}</h3>
                <p>{{ download.copy }}</p>
              </div>
              <div class="download-row-actions">
                <small>{{ download.size }} / {{ statForDownload(download.id) }}</small>
                <a :href="download.href" download @click="handleDownload(download.id)">下载</a>
                <button type="button" @click="copyChecksum(download)">
                  {{ copiedChecksum === download.id ? '已复制' : 'SHA-256' }}
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="release" class="page release-page">
        <div class="section-copy">
          <p class="eyebrow">Recent improvements</p>
          <h2>最近值得更新的原因。</h2>
          <p>
            这里不堆完整条目，只挑会影响使用体验的变化：哪里更稳、哪里更准、哪些设备少出问题。
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
        <div class="section-copy">
          <p class="eyebrow">Privacy</p>
          <h2>应用和 CPE 的通信，留在你的局域网里。</h2>
          <p>
            CPE 登录、锁频、测速发生在你的设备和局域网 CPE 之间。官网只记录聚合访问量、下载量、
            来源和设备类型，不公开完整 IP 或原始 User-Agent。
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
