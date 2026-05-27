<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import {
  aboutInfo,
  appIcon,
  changelogEntries,
  desktopScreens,
  downloads,
  heroDesktopImage,
  heroFacts,
  mobileScreens,
  platformCards,
  productMoments,
  routes,
  supportedDevices,
  telemetryWords,
} from './content';
import { fetchSummary, trackDownload, trackVisit } from './api';

const routePath = ref('/');
const summary = ref(null);
const analyticsState = ref('loading');
const activeDesktop = ref(heroDesktopImage);
const activeMobile = ref(mobileScreens[0]);
const copiedChecksum = ref('');
const downloadStates = ref({});
const detectedPlatform = ref('unknown');
const selectedDownloadId = ref('');
const hasStartedTracking = ref(false);

const routeMap = Object.fromEntries(routes.map((route) => [route.path, route]));
const currentRoute = computed(() => routeMap[routePath.value] || routeMap['/']);
const currentTitle = computed(() => `${currentRoute.value.title} / CPE Network Dashboard`);
const downloadTotals = computed(() => summary.value?.downloadsByFile || {});
const totalDownloads = computed(() => summary.value?.downloadsTotal ?? null);
const totalVisits = computed(() => summary.value?.visits?.total ?? null);
const desktopDownloads = computed(() => downloads.filter((download) => download.platform !== 'Android'));

const platformAdvice = computed(() => {
  const advice = {
    android: {
      device: 'Android 手机',
      primaryId: 'android-3.1',
      title: '检测到 Android，直接下载 APK。',
      copy: '现场调试通常就是这个场景：手机在手边，CPE 也在旁边。',
    },
    macos: {
      device: 'macOS 电脑',
      primaryId: 'macos-3.0.0',
      title: '检测到 macOS，推荐下载 DMG。',
      copy: '适合坐下来长时间看信号、测速和 Ping 曲线。',
    },
    windows: {
      device: 'Windows 电脑',
      primaryId: 'windows-exe-3.0.0',
      title: '检测到 Windows，推荐常规 EXE。',
      copy: '如果是固定维护电脑，也可以改选 MSI；临时电脑可选 Portable。',
    },
    ios: {
      device: 'iPhone / iPad',
      primaryId: 'android-3.1',
      title: '检测到 iOS，目前没有公开 iOS 包。',
      copy: 'iOS 方向还在推进。现在可以在电脑上下载桌面版，或换 Android 设备安装 APK。',
    },
    linux: {
      device: 'Linux / 其他桌面',
      primaryId: 'android-3.1',
      title: '暂时没有 Linux 桌面包。',
      copy: '当前公开下载是 Android、macOS 和 Windows；Linux 用户建议先用 Android 或 Windows 便携版。',
    },
    unknown: {
      device: '未知设备',
      primaryId: 'android-3.1',
      title: '没能判断你的设备，先给你 Android 版。',
      copy: '下面也保留了 macOS 和 Windows 的全部安装包，可以手动选择。',
    },
  };

  return advice[detectedPlatform.value] || advice.unknown;
});

const recommendedDownload = computed(() => {
  const selected = downloads.find((download) => download.id === selectedDownloadId.value);
  if (selected) return selected;
  return downloads.find((download) => download.id === platformAdvice.value.primaryId) || downloads[0];
});

const otherDownloads = computed(() => downloads.filter((download) => download.id !== recommendedDownload.value.id));

function routeHref(path) {
  return `#${path}`;
}

function normalizeRoute() {
  const hash = window.location.hash || '#/';
  if (hash.startsWith('#/')) {
    const path = hash.slice(1) || '/';
    return routeMap[path] ? path : '/';
  }

  const path = window.location.pathname || '/';
  return routeMap[path] ? path : '/';
}

function syncRoute() {
  routePath.value = normalizeRoute();
}

function detectPlatform() {
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const hasTouchMac = /Mac/i.test(platform) && navigator.maxTouchPoints > 1;

  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua) || hasTouchMac) return 'ios';
  if (/Windows/i.test(ua) || /Win/i.test(platform)) return 'windows';
  if (/Macintosh|Mac OS X/i.test(ua) || /Mac/i.test(platform)) return 'macos';
  if (/Linux|X11/i.test(ua)) return 'linux';
  return 'unknown';
}

function valueOrPreview(value) {
  return Number.isFinite(value) ? value.toLocaleString('zh-CN') : '部署后统计';
}

function statForDownload(id) {
  const item = downloadTotals.value[id];
  if (!item) return analyticsState.value === 'ready' ? '0 次下载' : '下载统计加载中';
  return `${Number(item.total || 0).toLocaleString('zh-CN')} 次下载`;
}

function setDownloadState(fileId, nextState) {
  downloadStates.value = {
    ...downloadStates.value,
    [fileId]: {
      ...(downloadStates.value[fileId] || {}),
      ...nextState,
    },
  };
}

function getDownloadState(fileId) {
  return downloadStates.value[fileId] || {};
}

function isDownloadBusy(fileId) {
  return ['downloading', 'assembling'].includes(getDownloadState(fileId).status);
}

function downloadButtonText(download) {
  const state = getDownloadState(download.id);
  if (state.status === 'downloading') return `正在下载 ${state.progress || 0}%`;
  if (state.status === 'assembling') return '正在合并';
  if (state.status === 'done') return '已开始保存';
  if (state.status === 'error') return '重试下载';
  return download.chunks?.length ? '下载并自动合并' : '下载';
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  const mib = bytes / 1024 / 1024;
  if (mib >= 1) return `${mib.toFixed(mib >= 100 ? 0 : 1)} MiB`;
  return `${Math.round(bytes / 1024)} KiB`;
}

function downloadStatusText(download) {
  const state = getDownloadState(download.id);
  if (state.status === 'downloading') {
    const chunk = state.chunkCount ? `分片 ${state.currentChunk || 1}/${state.chunkCount}` : '正在下载';
    const bytes = state.loadedBytes && state.totalBytes
      ? `，${formatBytes(state.loadedBytes)} / ${formatBytes(state.totalBytes)}`
      : '';
    return `${chunk}${bytes}`;
  }
  if (state.status === 'assembling') return '分片已下载完成，正在合并成原始安装包。';
  if (state.status === 'done') return '浏览器已经开始保存文件。';
  if (state.status === 'error') return '下载中断了，可以重新点击下载。';
  return '';
}

function handleDownload(fileId) {
  trackDownload(fileId);
  window.setTimeout(loadSummary, 800);
}

function readChunkBlob(url, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'blob';
    request.onprogress = (event) => {
      if (typeof onProgress === 'function') {
        onProgress({
          loaded: event.loaded,
          total: event.lengthComputable ? event.total : 0,
        });
      }
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve(request.response);
      } else {
        reject(new Error(`HTTP ${request.status}`));
      }
    };
    request.onerror = () => reject(new Error('Network error'));
    request.send();
  });
}

async function downloadChunkedFile(download) {
  if (!download.chunks?.length) return;
  trackDownload(download.id);
  const totalBytes = (download.chunkBytes || []).reduce((sum, value) => sum + value, 0);
  let loadedBefore = 0;
  setDownloadState(download.id, {
    status: 'downloading',
    progress: 0,
    loadedBytes: 0,
    totalBytes,
    currentChunk: 1,
    chunkCount: download.chunks.length,
  });

  try {
    const blobs = [];
    for (let index = 0; index < download.chunks.length; index += 1) {
      const expectedChunkBytes = download.chunkBytes?.[index] || 0;
      const blob = await readChunkBlob(download.chunks[index], ({ loaded, total }) => {
        const safeTotal = totalBytes || download.chunks.length * (total || expectedChunkBytes || 1);
        const safeLoaded = loadedBefore + loaded;
        const progress = safeTotal
          ? Math.min(99, Math.round((safeLoaded / safeTotal) * 100))
          : Math.round(((index + 1) / download.chunks.length) * 100);
        setDownloadState(download.id, {
          status: 'downloading',
          progress,
          loadedBytes: safeLoaded,
          totalBytes: safeTotal,
          currentChunk: index + 1,
          chunkCount: download.chunks.length,
        });
      });
      blobs.push(blob);
      loadedBefore += expectedChunkBytes || blob.size || 0;
      setDownloadState(download.id, {
        status: 'downloading',
        progress: totalBytes ? Math.min(99, Math.round((loadedBefore / totalBytes) * 100)) : Math.round(((index + 1) / download.chunks.length) * 100),
        loadedBytes: loadedBefore,
        totalBytes,
        currentChunk: index + 1,
        chunkCount: download.chunks.length,
      });
    }

    setDownloadState(download.id, {
      status: 'assembling',
      progress: 100,
      loadedBytes: totalBytes || loadedBefore,
      totalBytes: totalBytes || loadedBefore,
      currentChunk: download.chunks.length,
      chunkCount: download.chunks.length,
    });
    const blob = new Blob(blobs, { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = download.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 8000);
    setDownloadState(download.id, { status: 'done', progress: 100 });
    window.setTimeout(() => {
      if (getDownloadState(download.id).status === 'done') {
        setDownloadState(download.id, { status: '', progress: 0 });
      }
    }, 2200);
    window.setTimeout(loadSummary, 800);
  } catch {
    setDownloadState(download.id, { status: 'error', progress: 0 });
  }
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

function selectDownload(downloadId) {
  selectedDownloadId.value = downloadId;
}

watch(routePath, async (path) => {
  document.title = currentTitle.value;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (!hasStartedTracking.value) return;
  await Promise.allSettled([trackVisit(path), loadSummary()]);
});

watch(platformAdvice, (advice) => {
  if (!selectedDownloadId.value) selectedDownloadId.value = advice.primaryId;
});

onMounted(async () => {
  detectedPlatform.value = detectPlatform();
  selectedDownloadId.value = platformAdvice.value.primaryId;
  syncRoute();
  window.addEventListener('hashchange', syncRoute);
  window.addEventListener('popstate', syncRoute);
  document.title = currentTitle.value;
  hasStartedTracking.value = true;
  await Promise.allSettled([trackVisit(routePath.value), loadSummary()]);
  window.setTimeout(loadSummary, 1200);
});

onUnmounted(() => {
  window.removeEventListener('hashchange', syncRoute);
  window.removeEventListener('popstate', syncRoute);
});
</script>

<template>
  <div class="site-shell">
    <header class="topbar">
      <a class="brand-lockup" :href="routeHref('/')" aria-label="CPE 网络看板首页">
        <img :src="appIcon" alt="" />
        <span>
          <strong>CPE 网络看板</strong>
          <small>Network Dashboard</small>
        </span>
      </a>
      <nav class="nav-links" aria-label="主导航">
        <a
          v-for="route in routes"
          :key="route.path"
          :href="routeHref(route.path)"
          :class="{ active: routePath === route.path }"
        >
          {{ route.label }}
        </a>
      </nav>
    </header>

    <main>
      <section v-if="routePath === '/'" class="page-view home-page">
        <div class="hero-copy">
          <div class="app-mark">
            <img :src="appIcon" alt="" />
            <span>Android 3.1 / macOS & Windows 3.0.0</span>
          </div>
          <h1>别先重启，先看 CPE。</h1>
          <p>
            久等了，各位。Android 3.1 已经放出，macOS 和 Windows 也有了 3.0.0 桌面包。
            我们想做的不是另一个后台，而是让你看清楚 CPE 现在到底发生了什么。
          </p>
          <p class="hero-note">
            信号、小区、锁定、测速、Ping 和路由测试放在同一个地方。现场调试时少猜一点，改完以后也能马上验证。
          </p>
          <div class="hero-actions">
            <a class="action primary" :href="routeHref('/download')">下载适合的版本</a>
            <a class="action secondary" :href="routeHref('/product')">看看它怎么用</a>
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
            <img :src="heroDesktopImage" alt="CPE 网络看板电脑端截图" />
          </div>
          <div class="phone-shell hero-phone">
            <img :src="mobileScreens[0]" alt="CPE 网络看板 Android 截图" />
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
            <span v-for="(word, index) in [...telemetryWords, ...telemetryWords]" :key="`${word}-${index}`">
              {{ word }}
            </span>
          </div>
        </div>
      </section>

      <section v-else-if="routePath === '/product'" class="page-view product-page">
        <header class="page-heading">
          <p>产品介绍</p>
          <h1>先看清楚，再动手，再验证。</h1>
          <span>
            面向 4G/5G CPE 的日常排障、现场调试和设备巡检。我们把原本分散在后台里的信息，整理成调试时真的会用到的顺序。
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
            <span>
              横向界面适合长时间看连接状态、锁定回读、测速和日志，少在几个后台之间来回切。
            </span>
          </div>
          <div class="desktop-workbench">
            <div class="desktop-window">
              <div class="window-bar">
                <span></span>
                <span></span>
                <span></span>
                <strong>macOS / Windows</strong>
              </div>
              <img :src="activeDesktop" alt="CPE 网络看板电脑端截图" />
            </div>
            <div class="thumb-row desktop-thumbs" aria-label="切换电脑端截图">
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

        <section class="showcase-section mobile-showcase">
          <div class="mobile-wall">
            <div class="phone-shell phone-main">
              <img :src="activeMobile" alt="CPE 网络看板 Android 手机截图" />
            </div>
            <div class="thumb-row phone-thumbs" aria-label="切换 Android 手机截图">
              <button
                v-for="(screen, index) in mobileScreens.slice(0, 9)"
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
          <div class="section-copy">
            <p>手机端</p>
            <h2>人在设备旁边，手机反而更专业。</h2>
            <span>
              弱电箱、窗边、机柜旁边，拿起手机看状态和改锁定会更顺手。
            </span>
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
            <h2>不同设备族，按不同接口认真处理。</h2>
            <span>
              华为、烽火、鲲鹏、中兴的字段和接口都不一样，看板按设备族处理显示、锁定和回读。
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

      <section v-else-if="routePath === '/download'" class="page-view download-page">
        <header class="page-heading compact-heading">
          <p>下载</p>
          <h1>按当前设备，直接下对版本。</h1>
          <span>
            页面会自动识别 Android、macOS 或 Windows。桌面大包会按分片取回，下载过程中可以看到实时进度，最后在浏览器里合成原文件。
          </span>
        </header>

        <div class="download-grid">
          <aside class="detect-panel">
            <span>已识别当前设备</span>
            <strong>{{ platformAdvice.device }}</strong>
            <h2>{{ platformAdvice.title }}</h2>
            <p>{{ platformAdvice.copy }}</p>
            <div class="download-switcher" aria-label="手动选择下载项">
              <button
                v-for="download in downloads"
                :key="download.id"
                type="button"
                :class="{ active: recommendedDownload.id === download.id }"
                @click="selectDownload(download.id)"
              >
                {{ download.platform }}
                <small>{{ download.title.replace(download.platform, '').trim() || download.version }}</small>
              </button>
            </div>
          </aside>

          <article class="download-card selected-download">
            <div class="download-card-head">
              <span>{{ recommendedDownload.label }}</span>
              <small>{{ recommendedDownload.platform }} {{ recommendedDownload.version }}</small>
            </div>
            <h2>{{ recommendedDownload.title }}</h2>
            <p>{{ recommendedDownload.copy }}</p>
            <div class="download-meta">
              <span>{{ recommendedDownload.size }}</span>
              <span>{{ statForDownload(recommendedDownload.id) }}</span>
              <span>SHA-256</span>
            </div>
            <div class="download-actions">
              <a
                v-if="!recommendedDownload.chunks"
                class="action primary"
                :href="recommendedDownload.href"
                :download="recommendedDownload.fileName"
                @click="handleDownload(recommendedDownload.id)"
              >
                {{ downloadButtonText(recommendedDownload) }}
              </a>
              <button
                v-else
                type="button"
                class="action primary"
                :disabled="isDownloadBusy(recommendedDownload.id)"
                @click="downloadChunkedFile(recommendedDownload)"
              >
                {{ downloadButtonText(recommendedDownload) }}
              </button>
              <button type="button" class="action secondary" @click="copyChecksum(recommendedDownload)">
                {{ copiedChecksum === recommendedDownload.id ? '已复制校验值' : '复制校验值' }}
              </button>
            </div>
            <div
              v-if="getDownloadState(recommendedDownload.id).status"
              class="download-progress"
              :class="`state-${getDownloadState(recommendedDownload.id).status}`"
            >
              <div>
                <span :style="{ width: `${getDownloadState(recommendedDownload.id).progress || 0}%` }"></span>
              </div>
              <p>{{ downloadStatusText(recommendedDownload) }}</p>
            </div>
            <div v-if="getDownloadState(recommendedDownload.id).status === 'error'" class="download-error">
              分片下载中断了，可以重试；已经下载的临时数据不会保存。
            </div>
          </article>
        </div>

        <div class="download-list">
          <article v-for="download in otherDownloads" :key="download.id" class="download-row">
            <div>
              <span>{{ download.label }}</span>
              <h3>{{ download.title }}</h3>
              <p>{{ download.copy }}</p>
            </div>
            <div class="download-row-actions">
              <small>{{ download.size }} / {{ statForDownload(download.id) }}</small>
              <a
                v-if="!download.chunks"
                :href="download.href"
                :download="download.fileName"
                @click="handleDownload(download.id)"
              >
                下载
              </a>
              <button
                v-else
                type="button"
                :disabled="isDownloadBusy(download.id)"
                @click="downloadChunkedFile(download)"
              >
                {{ downloadButtonText(download) }}
              </button>
              <button type="button" @click="copyChecksum(download)">
                {{ copiedChecksum === download.id ? '已复制' : 'SHA-256' }}
              </button>
              <div
                v-if="getDownloadState(download.id).status"
                class="row-progress"
                :class="`state-${getDownloadState(download.id).status}`"
              >
                <span :style="{ width: `${getDownloadState(download.id).progress || 0}%` }"></span>
                <small>{{ downloadStatusText(download) }}</small>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section v-else-if="routePath === '/changelog'" class="page-view changelog-page">
        <header class="page-heading">
          <p>更新日志</p>
          <h1>更新日志：哪些地方更稳了。</h1>
          <span>
            Android 3.1 是当前最新公开 Android 包；macOS 和 Windows 当前公开桌面包为 3.0.0。
          </span>
        </header>

        <div class="timeline">
          <article v-for="entry in changelogEntries" :key="entry.version" class="timeline-entry">
            <div class="timeline-date">
              <span>{{ entry.date }}</span>
              <strong>{{ entry.version }}</strong>
              <small>{{ entry.badge }}</small>
            </div>
            <div class="timeline-body">
              <p>{{ entry.lead }}</p>
              <section v-for="section in entry.sections" :key="section.title">
                <h2>{{ section.title }}</h2>
                <ul>
                  <li v-for="item in section.items" :key="item">{{ item }}</li>
                </ul>
              </section>
            </div>
          </article>
        </div>
      </section>

      <section v-else-if="routePath === '/about'" class="page-view about-page">
        <header class="about-hero">
          <img :src="appIcon" alt="" />
          <div>
            <p>关于</p>
            <h1>{{ aboutInfo.chineseName }}</h1>
            <span>{{ aboutInfo.englishName }} / 版本 {{ aboutInfo.versionName }}</span>
          </div>
        </header>

        <section class="about-intro">
          <div>
            <p>{{ aboutInfo.description }}</p>
            <small>{{ aboutInfo.note }}</small>
          </div>
          <div class="about-stats">
            <span>QQ群</span>
            <strong>{{ aboutInfo.userGroup }}</strong>
          </div>
        </section>

        <section class="about-section makers-section">
          <div class="section-copy">
            <p>制作者</p>
            <h2>项目由我们一起维护。</h2>
            <span>当然是小原啦 与叉子么为本项目并列开发者，负责 UI、部分接口以及整体重构等工作。</span>
          </div>
          <div class="person-grid">
            <article v-for="person in aboutInfo.makers" :key="person.name" class="person-card">
              <h3>{{ person.name }}</h3>
              <div class="person-links">
                <a v-for="link in person.links" :key="link.href" :href="link.href" target="_blank" rel="noreferrer">
                  {{ link.label }}
                </a>
              </div>
            </article>
          </div>
        </section>

        <section class="about-section thanks-section">
          <div class="section-copy">
            <p>致谢</p>
            <h2>也感谢这些朋友。</h2>
            <span>测试设备、接口帮助、宣传建议和 UI 开源方案，都实实在在推进了这个版本。</span>
          </div>
          <div class="thanks-list">
            <article v-for="person in aboutInfo.thanks" :key="person.name" class="thanks-card">
              <h3>{{ person.name }}</h3>
              <p>{{ person.contribution }}</p>
              <div v-if="person.links?.length" class="person-links">
                <a v-for="link in person.links" :key="link.href" :href="link.href" target="_blank" rel="noreferrer">
                  {{ link.label }}
                </a>
              </div>
            </article>
          </div>
        </section>
      </section>
    </main>

    <footer class="footer">
      <div class="footer-main">
        <span>CPE 网络看板 / CPE Network Dashboard</span>
        <small>Copyright © 2026 yuan-666 and contributors. Released under GPL-3.0-or-later.</small>
      </div>
      <div class="footer-stats" aria-label="官网统计">
        <span>访问 {{ valueOrPreview(totalVisits) }}</span>
        <span>下载 {{ valueOrPreview(totalDownloads) }}</span>
      </div>
      <div class="footer-links">
        <a href="https://github.com/yuan-666/CPENetworkDashboard-Web" rel="noreferrer">官网仓库</a>
        <a href="https://github.com/yuan-666" rel="noreferrer">作者 GitHub</a>
      </div>
    </footer>
  </div>
</template>
