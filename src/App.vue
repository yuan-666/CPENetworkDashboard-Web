<script setup>
import { computed, onMounted, ref } from 'vue';
import {
  changelog,
  desktopScreens,
  downloads,
  features,
  heroDesktopImage,
  phoneScreens,
  platformCards,
  productStats,
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
const todayVisits = computed(() => summary.value?.visits?.today ?? null);
const recentEvents = computed(() => summary.value?.recent || []);

function valueOrPreview(value) {
  return Number.isFinite(value) ? value.toLocaleString('zh-CN') : '本地预览';
}

function statForDownload(id) {
  const item = downloadTotals.value[id];
  if (!item) return '待统计';
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
        <span class="brand-mark">CPE</span>
        <span>
          <strong>CPE 网络看板</strong>
          <small>Network Dashboard</small>
        </span>
      </a>
      <nav class="nav-links" aria-label="主导航">
        <a href="#platforms">平台</a>
        <a href="#features">能力</a>
        <a href="#downloads">下载</a>
        <a href="#changelog">更新</a>
        <a href="#privacy">隐私</a>
      </nav>
    </header>

    <main id="top">
      <section class="hero" :style="{ '--hero-image': `url(${heroDesktopImage})` }">
        <div class="hero-shade"></div>
        <div class="hero-content">
          <p class="eyebrow">Android 3.1 / macOS 3.0.0 / Windows 3.0.0</p>
          <h1>CPE 网络看板</h1>
          <p class="hero-copy">
            面向 4G/5G CPE 的跨平台管理工具。实时信号、频段与小区控制、邻区扫描、测速、Ping
            和路由测试，收进一个能在现场直接工作的看板里。
          </p>
          <div class="hero-actions" aria-label="主要操作">
            <a class="primary-action" href="#downloads">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 20h14" />
              </svg>
              下载最新版
            </a>
            <a class="secondary-action" href="#changelog">查看更新日志</a>
          </div>
          <dl class="hero-facts" aria-label="产品状态">
            <div v-for="item in productStats" :key="item.label">
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
              <span>{{ item.detail }}</span>
            </div>
          </dl>
        </div>
      </section>

      <section class="release-rail" aria-label="实时发布统计">
        <div class="release-stat">
          <span>访问</span>
          <strong>{{ valueOrPreview(totalVisits) }}</strong>
          <small>今日 {{ valueOrPreview(todayVisits) }}</small>
        </div>
        <div class="release-stat">
          <span>下载</span>
          <strong>{{ valueOrPreview(totalDownloads) }}</strong>
          <small>{{ analyticsState === 'ready' ? 'ESA EdgeKV 聚合' : '部署后自动记录' }}</small>
        </div>
        <div class="release-stat wide">
          <span>当前公开包</span>
          <strong>Android 3.1 + Desktop 3.0.0</strong>
          <small>静态安装包由 ESA 直接分发，统计走轻量边缘函数</small>
        </div>
      </section>

      <section id="platforms" class="section band-soft">
        <div class="section-heading split-heading">
          <div>
            <p class="eyebrow">Platform matrix</p>
            <h2>每个平台都按自己的手感做</h2>
          </div>
          <p>
            Android 负责移动端主线，macOS 和 Windows 已提供桌面安装包；iOS
            基线保留在跨平台工程里，等真机回归稳定后再进入公开分发。
          </p>
        </div>
        <div class="platform-grid">
          <article v-for="platform in platformCards" :key="platform.name" class="platform-card">
            <div class="platform-head">
              <span>{{ platform.name }}</span>
              <small>{{ platform.version }}</small>
            </div>
            <p class="platform-posture">{{ platform.posture }}</p>
            <p>{{ platform.copy }}</p>
            <ul>
              <li v-for="item in platform.bullets" :key="item">{{ item }}</li>
            </ul>
          </article>
        </div>
      </section>

      <section class="media-section">
        <div class="desktop-stage">
          <img :src="activeDesktop" alt="CPE 网络看板桌面端界面截图" />
        </div>
        <div class="desktop-thumbs" aria-label="桌面端截图切换">
          <button
            v-for="screen in desktopScreens"
            :key="screen"
            type="button"
            :class="{ active: activeDesktop === screen }"
            @click="activeDesktop = screen"
          >
            <img :src="screen" alt="" />
          </button>
        </div>
        <div class="phone-strip" aria-label="Android 端界面截图">
          <img v-for="screen in phoneScreens.slice(0, 7)" :key="screen" :src="screen" alt="CPE 网络看板 Android 界面截图" />
        </div>
      </section>

      <section id="features" class="section">
        <div class="section-heading">
          <p class="eyebrow">Product depth</p>
          <h2>不是一张状态页，是一套 CPE 工作台</h2>
        </div>
        <div class="feature-grid">
          <article v-for="feature in features" :key="feature.title" class="feature-tile">
            <p>{{ feature.eyebrow }}</p>
            <h3>{{ feature.title }}</h3>
            <span>{{ feature.copy }}</span>
          </article>
        </div>
      </section>

      <section class="section support-band">
        <div class="section-heading split-heading">
          <div>
            <p class="eyebrow">Device coverage</p>
            <h2>围绕真实设备族整理接口</h2>
          </div>
          <p>
            不同固件字段和锁定能力可能不同，锁频、锁小区、网络模式切换建议在真实设备上执行回读验证。
          </p>
        </div>
        <div class="device-table">
          <div v-for="[brand, models] in supportedDevices" :key="brand" class="device-row">
            <strong>{{ brand }}</strong>
            <span>{{ models }}</span>
          </div>
        </div>
      </section>

      <section id="downloads" class="section download-section">
        <div class="section-heading split-heading">
          <div>
            <p class="eyebrow">Direct release files</p>
            <h2>安装包直接放在前端分发</h2>
          </div>
          <p>
            下载链接指向静态文件，ESA 负责边缘分发；点击统计通过单文件边缘函数写入 EdgeKV，
            即使统计接口离线也不影响下载。
          </p>
        </div>
        <div class="download-grid">
          <article v-for="download in downloads" :key="download.id" class="download-card">
            <div class="download-topline">
              <span>{{ download.platform }}</span>
              <small>{{ download.version }}</small>
            </div>
            <h3>{{ download.title }}</h3>
            <p class="file-name">{{ download.fileName }}</p>
            <ul>
              <li v-for="note in download.notes" :key="note">{{ note }}</li>
            </ul>
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
                {{ copiedChecksum === download.id ? '已复制 SHA-256' : '复制 SHA-256' }}
              </button>
            </div>
          </article>
        </div>
      </section>

      <section id="changelog" class="section changelog-section">
        <div class="section-heading split-heading">
          <div>
            <p class="eyebrow">Changelog</p>
            <h2>更新日志已经按公开发布口径整理</h2>
          </div>
          <p>
            Android 3.1 使用你提供的最新更新记录；桌面和跨平台条目来自当前项目 README、VERSION
            与 release notes。
          </p>
        </div>
        <div class="timeline">
          <article v-for="entry in changelog" :key="entry.version" class="timeline-item">
            <div class="timeline-pin"></div>
            <div class="timeline-body">
              <p class="timeline-meta">{{ entry.date }} / {{ entry.version }}</p>
              <h3>{{ entry.title }}</h3>
              <ul>
                <li v-for="item in entry.items" :key="item">{{ item }}</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section id="privacy" class="section privacy-section">
        <div class="privacy-copy">
          <p class="eyebrow">Public repository safety</p>
          <h2>公共仓库只放官网、公开安装包和聚合统计逻辑</h2>
          <p>
            边缘函数不会返回完整 IP、原始 User-Agent 或任何设备登录信息；统计页面只读取访问总量、今日访问、
            下载次数、设备类型和来源域名等聚合结果。CPE 登录、锁频和测速仍发生在用户本机与局域网设备之间。
          </p>
        </div>
        <div class="privacy-panel">
          <span>Edge Function</span>
          <strong>single js</strong>
          <p>/api/track / /api/download / /api/analytics/summary</p>
        </div>
      </section>

      <section class="section analytics-strip" v-if="recentEvents.length">
        <div class="section-heading">
          <p class="eyebrow">Recent public events</p>
          <h2>最近聚合事件</h2>
        </div>
        <div class="event-list">
          <div v-for="event in recentEvents.slice(0, 6)" :key="`${event.time}-${event.kind}-${event.file || event.page}`">
            <span>{{ event.kind === 'download' ? '下载' : '访问' }}</span>
            <strong>{{ event.fileLabel || event.page || '/' }}</strong>
            <small>{{ event.device || 'Unknown device' }}</small>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <span>CPE 网络看板 / CPE Network Dashboard</span>
      <a href="https://github.com/yuan-666/CPENetworkDashboard-Web" rel="noreferrer">GitHub</a>
    </footer>
  </div>
</template>
