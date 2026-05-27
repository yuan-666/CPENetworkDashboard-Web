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
const downloadStates = ref({});

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

function downloadButtonText(download) {
  const state = getDownloadState(download.id);
  if (state.status === 'downloading') return `正在下载 ${state.progress || 0}%`;
  if (state.status === 'assembling') return '正在合并';
  if (state.status === 'done') return '已开始保存';
  if (state.status === 'error') return '重试下载';
  return download.chunks?.length ? '下载并自动合并' : '下载';
}

function readChunkBlob(url) {
  if (typeof window.fetch === 'function') {
    return window.fetch(url).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.blob();
    });
  }

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'blob';
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
  setDownloadState(download.id, { status: 'downloading', progress: 0 });

  try {
    const blobs = [];
    for (let index = 0; index < download.chunks.length; index += 1) {
      blobs.push(await readChunkBlob(download.chunks[index]));
      setDownloadState(download.id, {
        status: 'downloading',
        progress: Math.round(((index + 1) / download.chunks.length) * 100),
      });
    }

    setDownloadState(download.id, { status: 'assembling', progress: 100 });
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
        setDownloadState(download.id, { status: 'idle', progress: 0 });
      }
    }, 2200);
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
            <span>CPE 网速不对，</span>
            <span>先别急着重启。</span>
          </h1>
          <p>
            先看看它连在哪个小区、信号质量怎么样、测速和 Ping 走的是哪条链路。
            CPE 网络看板做的事很简单：把这些原本分散在后台里的信息，放到你能直接判断的地方。
          </p>
          <div class="hero-actions">
            <a class="primary-action" href="#downloads">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4v10m0 0 3.5-3.5M12 14l-3.5-3.5M5 20h14" />
              </svg>
              下载 Android 3.1
            </a>
            <a class="secondary-action" href="#scene">看看它能帮你省哪一步</a>
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
          <h2>多数时候，你缺的不是按钮，是依据。</h2>
          <p>
            设备后台能做的事很多，但现场排查真正需要的是顺序。先确认状态，再决定要不要锁频、锁小区，最后用测速和 Ping 验证。
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
          <h2>电脑端适合慢慢看。</h2>
          <p>
            坐在电脑前排查时，信息越集中越好。连接、锁频、测速和日志铺在同一个横向界面里，来回切后台的次数会少很多。
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
          <h2>手机端适合现场动手。</h2>
          <p>
            CPE 放在窗边、弱电箱、机柜里时，手机更顺手。看一眼信号，扫一下邻区，必要时直接改锁定策略。
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
          <h2>手机和电脑，各做各的事。</h2>
          <p>
            手机负责快，电脑负责看得全。你在哪个场景里处理 CPE，就用哪个版本。
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
          <h2>不同设备，别当成一个后台来处理。</h2>
          <p>
            华为、烽火、鲲鹏、中兴的字段和接口都不太一样。看板按设备族处理显示、锁定和回读，少用一套通用说法糊弄过去。
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
          <h2>选你现在手边的设备。</h2>
          <p>
            Android 包直接下载；桌面安装包比较大，会自动分片取回再合成原文件。你不用手动拼接。
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
                <button
                  type="button"
                  :disabled="['downloading', 'assembling'].includes(getDownloadState(download.id).status)"
                  @click="downloadChunkedFile(download)"
                >
                  {{ downloadButtonText(download) }}
                </button>
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
          <h2>这几版主要是把常见坑填掉。</h2>
          <p>
            完整记录放在仓库里。这里说人话：哪些设备更稳了，哪些显示更准了，哪些场景少闪退少误判。
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
