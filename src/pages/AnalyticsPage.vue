<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useAnalytics } from '@/composables/useAnalytics'
import { downloads } from '@/content'
import type { CityStat, CountryStat, RecentEvent } from '@/types'
import { formatNumber } from '@/utils/format'

const { summary, analyticsState, loadSummary } = useAnalytics()

/* ── KPI cards ───────────────────────────────────────────── */

const todayVisits = computed(() => summary.value?.visits?.today ?? 0)
const totalVisits = computed(() => summary.value?.visits?.total ?? 0)
const totalDownloads = computed(() => summary.value?.downloadsTotal ?? 0)
const countryCount = computed(() => summary.value?.geo?.countries?.length ?? 0)
const cityCount = computed(() => summary.value?.geo?.cities?.length ?? 0)

/* ── 24h bar chart ───────────────────────────────────────── */

interface HourlyBar {
  hour: number
  visits: number
  downloads: number
  visitPct: number
  downloadPct: number
  isCurrent: boolean
}

function completeHourlyBars(data = summary.value?.hourly) {
  const map = new Map<number, number>()
  for (const bar of data?.bars || []) {
    const hour = Math.max(0, Math.min(23, Math.trunc(Number(bar.hour) || 0)))
    map.set(hour, (map.get(hour) || 0) + (Number(bar.count) || 0))
  }
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: map.get(hour) || 0,
  }))
}

const combinedHourlyMax = computed(() => {
  const visitBars = completeHourlyBars(summary.value?.hourly)
  const downloadBars = completeHourlyBars(summary.value?.downloadHourly)
  return Math.max(
    1,
    ...visitBars.map((bar) => bar.count),
    ...downloadBars.map((bar) => bar.count)
  )
})

const hourlyBars = computed<HourlyBar[]>(() => {
  const hourly = summary.value?.hourly
  const downloadHourly = summary.value?.downloadHourly
  const visitBars = completeHourlyBars(hourly)
  const downloadBars = completeHourlyBars(downloadHourly)
  const max = combinedHourlyMax.value
  const currentHour = hourly?.currentHour ?? downloadHourly?.currentHour
  return visitBars.map((bar, index) => ({
    hour: bar.hour,
    visits: bar.count,
    downloads: downloadBars[index]?.count || 0,
    visitPct: Math.round((bar.count / max) * 100),
    downloadPct: Math.round(((downloadBars[index]?.count || 0) / max) * 100),
    isCurrent: bar.hour === currentHour,
  }))
})

const hourlyTotal = computed(() => summary.value?.hourly?.total ?? 0)
const downloadHourlyTotal = computed(() => summary.value?.downloadHourly?.total ?? 0)
const hourlyMax = computed(() => combinedHourlyMax.value)

const scaleLabels = computed(() => {
  const m = hourlyMax.value || 1
  return [m, Math.round(m * 0.75), Math.round(m * 0.5), Math.round(m * 0.25), 0]
})

const downloadDistribution = computed(() =>
  hourlyBars.value
    .filter((bar) => bar.downloads > 0)
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 6)
    .map((bar) => ({
      hour: `${String(bar.hour).padStart(2, '0')}:00`,
      count: bar.downloads,
      pct: Math.max(6, Math.round((bar.downloads / (summary.value?.downloadHourly?.max || 1)) * 100)),
    }))
)

/* ── Tabs ────────────────────────────────────────────────── */

type TabKey = 'pages' | 'referrers' | 'countries' | 'cities' | 'devices' | 'recent'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'pages', label: '页面' },
  { key: 'referrers', label: '来源' },
  { key: 'countries', label: '国家/地区' },
  { key: 'cities', label: '城市' },
  { key: 'devices', label: '设备' },
  { key: 'recent', label: '最近' },
]

const activeTab = ref<TabKey>('pages')

const countryAliases: Record<string, string> = {
  CN: '中国',
  China: '中国',
  china: '中国',
  中国: '中国',
  中國: '中国',
  TW: '中国',
  Taiwan: '中国',
  taiwan: '中国',
  台湾: '中国',
  臺灣: '中国',
  HK: '中国',
  'Hong Kong': '中国',
  'hong kong': '中国',
  香港: '中国',
  MO: '中国',
  Macao: '中国',
  Macau: '中国',
  macao: '中国',
  macau: '中国',
  澳门: '中国',
  澳門: '中国',
  中国台湾: '中国',
  中国香港: '中国',
  中国澳门: '中国',
}

const cityAliases: Record<string, string> = {
  Anhui: '安徽',
  Beijing: '北京',
  Chongqing: '重庆',
  Fujian: '福建',
  Gansu: '甘肃',
  Guangdong: '广东',
  Guangxi: '广西',
  Guizhou: '贵州',
  Hainan: '海南',
  Hebei: '河北',
  Heilongjiang: '黑龙江',
  Henan: '河南',
  Hubei: '湖北',
  Hunan: '湖南',
  'Inner Mongolia': '内蒙古',
  Jiangsu: '江苏',
  Jiangxi: '江西',
  Jilin: '吉林',
  Liaoning: '辽宁',
  Ningxia: '宁夏',
  Qingdao: '青岛',
  Qinghai: '青海',
  Shaanxi: '陕西',
  Shandong: '山东',
  Shanghai: '上海',
  Shanxi: '山西',
  Sichuan: '四川',
  Tianjin: '天津',
  Xinjiang: '新疆',
  Xizang: '西藏',
  Yunnan: '云南',
  Zhejiang: '浙江',
  Baoding: '保定',
  Changchun: '长春',
  Changsha: '长沙',
  Chengdu: '成都',
  Dalian: '大连',
  Dongguan: '东莞',
  Foshan: '佛山',
  Fuzhou: '福州',
  Guangzhou: '广州',
  Hangzhou: '杭州',
  Harbin: '哈尔滨',
  Hefei: '合肥',
  Jinan: '济南',
  Kunming: '昆明',
  Nanjing: '南京',
  Ningbo: '宁波',
  Qingyuan: '清远',
  Quanzhou: '泉州',
  Shenzhen: '深圳',
  Shenyang: '沈阳',
  Suzhou: '苏州',
  Wuhan: '武汉',
  Wuxi: '无锡',
  Xiamen: '厦门',
  "Xi'an": '西安',
  Xian: '西安',
  Zhengzhou: '郑州',
  Taiwan: '台湾',
  台湾: '台湾',
  臺灣: '台湾',
  Taipei: '台北',
  'Taipei City': '台北',
  'New Taipei': '新北',
  'New Taipei City': '新北',
  Taoyuan: '桃园',
  Taichung: '台中',
  Tainan: '台南',
  Kaohsiung: '高雄',
  'Hong Kong': '香港',
  HK: '香港',
  Macao: '澳门',
  Macau: '澳门',
  MO: '澳门',
}

function normalizeCountryName(value = ''): string {
  const raw = value.trim()
  return countryAliases[raw] || countryAliases[raw.toUpperCase()] || countryAliases[raw.toLowerCase()] || raw || '未知'
}

function normalizePlaceKey(value = ''): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[().,]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+(city|province|prefecture|region|municipality)$/, '')
    .replace(/\s+shi$/, '')
}

const cityAliasLookup = Object.entries(cityAliases).reduce<Record<string, string>>(
  (lookup, [key, value]) => {
    lookup[key] = value
    lookup[normalizePlaceKey(key)] = value
    return lookup
  },
  {}
)

function normalizeChinaPlaceName(value = ''): string {
  const raw = value.trim()
  if (!raw) return ''
  return (
    cityAliasLookup[raw] ||
    cityAliasLookup[normalizePlaceKey(raw)] ||
    raw
      .replace(/(土家族苗族|藏族羌族|哈尼族彝族|傣族景颇族|蒙古族藏族|柯尔克孜|哈萨克|蒙古|藏族|彝族|傣族|白族|苗族|回族|壮族)自治州$/, '')
      .replace(/(维吾尔|壮族|回族|特别)?自治区$/, '')
      .replace(/省$/, '')
      .replace(/市$/, '')
      .replace(/地区$/, '')
      .replace(/盟$/, '')
      .replace(/自治州$/, '')
  )
}

function normalizeCityName(city = '', region = '', countryCode = ''): string {
  const code = countryCode.toUpperCase()
  const fallbackRegion = code === 'TW' ? '台湾' : code === 'HK' ? '香港' : code === 'MO' ? '澳门' : ''
  const normalizedCity = normalizeChinaPlaceName(city)
  const normalizedRegion = normalizeChinaPlaceName(region)
  const cityValue = ['unknown', '未知', ''].includes(normalizedCity.toLowerCase())
    ? ''
    : normalizedCity
  const value =
    cityValue ||
    fallbackRegion ||
    normalizedRegion ||
    '未知'
  return value
}

const normalizedCountries = computed(() => {
  const map = new Map<string, number>()
  for (const item of summary.value?.geo?.countries || []) {
    const name = normalizeCountryName(item.name)
    map.set(name, (map.get(name) || 0) + item.count)
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

const normalizedCities = computed<CityStat[]>(() => {
  const map = new Map<string, CityStat>()
  for (const item of summary.value?.geo?.cities || []) {
    const country = normalizeCountryName(item.country || item.countryCode)
    const city = normalizeCityName(item.city, item.region, item.countryCode)
    const region = normalizeCityName(item.region || city, item.region, item.countryCode)
    const key = `${country}|${region}|${city}`
    const current =
      map.get(key) ||
      ({
        ...item,
        country,
        countryCode: country === '中国' ? 'CN' : item.countryCode,
        region,
        city,
        count: 0,
      } as CityStat)
    current.count += item.count
    if (!current.lat && item.lat) current.lat = item.lat
    if (!current.lon && item.lon) current.lon = item.lon
    map.set(key, current)
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count)
})

const tabData = computed(() => {
  const s = summary.value
  if (!s) return []
  switch (activeTab.value) {
    case 'pages':
      return s.pages || []
    case 'referrers':
      return s.referrers || []
    case 'countries':
      return normalizedCountries.value.map((c: CountryStat) => ({ name: c.name, count: c.count }))
    case 'cities':
      return normalizedCities.value.map((c: CityStat) => ({
        name: c.city === c.country ? c.city : `${c.city}`,
        count: c.count,
      }))
    case 'devices':
      return s.devices || []
    default:
      return []
  }
})

const recentEvents = computed<RecentEvent[]>(() => summary.value?.recent || [])

function formatTime(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/* ── Download ranking ────────────────────────────────────── */

const downloadRanking = computed(() => {
  const byFile = summary.value?.downloadsByFile
  if (!byFile) return []
  const localDownloads = new Map(downloads.map((d) => [d.id, d]))
  return Object.entries(byFile)
    .map(([id, stats]) => ({
      id,
      label: stats.label || localDownloads.get(id)?.title || id,
      total: stats.total ?? 0,
      today: stats.today ?? 0,
    }))
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total)
})

/* ── Map ─────────────────────────────────────────────────── */

const mapContainer = ref<HTMLDivElement | null>(null)
let mapInstance: any = null
let mapObserver: IntersectionObserver | null = null
const mapLoaded = ref(false)

const cities = computed(() => normalizedCities.value)

function initMap() {
  if (mapInstance || !mapContainer.value || !cities.value.length) return

  import('leaflet').then((L) => {
    if (mapInstance || !mapContainer.value) return

    mapInstance = L.map(mapContainer.value, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    })

    L.tileLayer(
      'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
      { subdomains: '1234', maxZoom: 18 },
    ).addTo(mapInstance)

    const points: [number, number][] = []

    for (const city of cities.value) {
      if (!city.lat || !city.lon) continue
      const radius = Math.max(5, Math.min(22, 5 + Math.log2(1 + city.count) * 5))
      const circle = L.circleMarker([city.lat, city.lon], {
        radius,
        color: '#237164',
        fillColor: '#237164',
        fillOpacity: 0.35,
        weight: 1.5,
      })
      circle.bindPopup(
        `<div style="font-size:13px"><b>${city.city}</b><br/>${city.count} 次访问</div>`,
      )
      circle.addTo(mapInstance)
      points.push([city.lat, city.lon])
    }

    if (points.length === 1) {
      mapInstance.setView(points[0], 10)
    } else if (points.length > 1) {
      mapInstance.fitBounds(points, { padding: [40, 40], maxZoom: 12 })
    } else {
      mapInstance.setView([35.8617, 104.1954], 4)
    }

    mapLoaded.value = true

    setTimeout(() => {
      mapInstance?.invalidateSize()
    }, 300)
  })
}

function setupMapObserver() {
  if (!mapContainer.value) return
  mapObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && cities.value.length) {
        initMap()
        mapObserver?.disconnect()
      }
    },
    { threshold: 0.1 },
  )
  mapObserver.observe(mapContainer.value)
}

/* ── City strip (below map) ──────────────────────────────── */

const cityStrip = computed(() =>
  (cities.value || []).slice(0, 8).map((c) => ({
    label: `${c.city}·${c.count}`,
    count: c.count,
  })),
)

/* ── Lifecycle ───────────────────────────────────────────── */

onMounted(async () => {
  await loadSummary()
  await nextTick()
  setupMapObserver()
})

onUnmounted(() => {
  mapObserver?.disconnect()
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})

watch(cities, () => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    mapLoaded.value = false
    nextTick(() => initMap())
  }
})
</script>

<template>
  <div class="analytics-page">
    <!-- Header -->
    <header class="analytics-header">
      <h1>访问统计</h1>
      <p>全站访问与下载数据概览</p>
    </header>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <span class="kpi-label">累计访问</span>
        <strong class="kpi-value">{{ formatNumber(totalVisits) }}</strong>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">累计下载</span>
        <strong class="kpi-value">{{ formatNumber(totalDownloads) }}</strong>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">今日访问</span>
        <strong class="kpi-value">{{ formatNumber(todayVisits) }}</strong>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">访问国家</span>
        <strong class="kpi-value">{{ formatNumber(countryCount) }}</strong>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">访问城市</span>
        <strong class="kpi-value">{{ formatNumber(cityCount) }}</strong>
      </div>
    </div>

    <!-- Visualization Row: Bar Chart + Map -->
    <div class="viz-row">
      <!-- 24h Bar Chart -->
      <section class="glass-panel bar-chart-panel">
        <div class="panel-title">
          <span>今日 24 小时访问与下载</span>
          <small>访问 {{ hourlyTotal }} / 下载 {{ downloadHourlyTotal }} / 峰值 {{ hourlyMax }}</small>
        </div>
        <div class="bar-legend">
          <span><i class="legend-dot visit" />访问</span>
          <span><i class="legend-dot download" />下载</span>
        </div>
        <div class="bar-chart">
          <div class="bar-scale">
            <span v-for="(v, i) in scaleLabels" :key="i">{{ v }}</span>
          </div>
          <div class="bar-grid">
            <div
              v-for="bar in hourlyBars"
              :key="bar.hour"
              class="bar-col"
              :class="{ current: bar.isCurrent }"
            >
              <div class="bar-track">
                <div
                  class="bar-fill visit"
                  :title="`${bar.hour}:00 访问 ${bar.visits}`"
                  :style="{ height: bar.visitPct + '%' }"
                />
                <div
                  class="bar-fill download"
                  :title="`${bar.hour}:00 下载 ${bar.downloads}`"
                  :style="{ height: bar.downloadPct + '%' }"
                />
              </div>
              <span class="bar-hour">{{ bar.hour }}</span>
            </div>
          </div>
        </div>
        <div class="download-distribution">
          <span class="distribution-title">下载时间分布</span>
          <div v-if="downloadDistribution.length" class="distribution-list">
            <div
              v-for="item in downloadDistribution"
              :key="item.hour"
              class="distribution-row"
            >
              <span>{{ item.hour }}</span>
              <div class="distribution-track">
                <i :style="{ width: item.pct + '%' }" />
              </div>
              <strong>{{ item.count }}</strong>
            </div>
          </div>
          <span v-else class="distribution-empty">暂无今日下载</span>
        </div>
      </section>

      <!-- Map -->
      <section class="glass-panel map-panel">
        <div class="panel-title">
          <span>城市分布</span>
          <small>{{ cityCount }} 个城市</small>
        </div>
        <div ref="mapContainer" class="map-container" />
        <div v-if="cityStrip.length" class="city-strip">
          <span
            v-for="(c, i) in cityStrip"
            :key="i"
            class="city-tag"
          >{{ c.label }}</span>
        </div>
      </section>
    </div>

    <!-- Tabbed Breakdown + Download Ranking -->
    <div class="bottom-row">
      <!-- Breakdown Tabs -->
      <section class="glass-panel breakdown-panel">
        <div class="tab-bar">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="['tab-btn', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <!-- Table view for non-recent tabs -->
          <template v-if="activeTab !== 'recent'">
            <div v-if="!tabData.length" class="empty-hint">暂无数据</div>
            <table v-else class="breakdown-table">
              <tbody>
                <tr v-for="(item, i) in tabData" :key="i">
                  <td class="rank-cell">{{ i + 1 }}</td>
                  <td class="name-cell">{{ item.name }}</td>
                  <td class="count-cell">{{ formatNumber(item.count) }}</td>
                </tr>
              </tbody>
            </table>
          </template>

          <!-- Recent events -->
          <template v-else>
            <div v-if="!recentEvents.length" class="empty-hint">暂无记录</div>
            <table v-else class="breakdown-table recent-table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>类型</th>
                  <th>页面/文件</th>
                  <th>设备</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(ev, i) in recentEvents" :key="i">
                  <td class="time-cell">{{ formatTime(ev.time) }}</td>
                  <td>
                    <span :class="['ev-badge', ev.kind]">
                      {{ ev.kind === 'download' ? '下载' : '浏览' }}
                    </span>
                  </td>
                  <td class="page-cell">{{ ev.page || ev.fileLabel || ev.file || '-' }}</td>
                  <td class="device-cell">{{ ev.device || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </template>
        </div>
      </section>

      <!-- Download Ranking -->
      <section class="glass-panel download-rank-panel">
        <div class="panel-title">
          <span>下载排行</span>
          <small>{{ summary?.downloadsTotal ?? 0 }} 次下载</small>
        </div>
        <div v-if="!downloadRanking.length" class="empty-hint">暂无下载数据</div>
        <div v-else class="rank-list">
          <div
            v-for="(item, i) in downloadRanking"
            :key="item.id"
            class="rank-item"
          >
            <span class="rank-num">{{ i + 1 }}</span>
            <div class="rank-info">
              <strong>{{ item.label }}</strong>
              <small>{{ item.total }} 次下载{{ item.today ? ` · 今日 ${item.today}` : '' }}</small>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Loading / Offline states -->
    <div v-if="analyticsState === 'loading'" class="state-overlay">
      <div class="state-spinner" />
      <span>加载统计数据…</span>
    </div>
    <div v-else-if="analyticsState === 'offline'" class="state-overlay offline">
      <span>统计数据暂时不可用</span>
    </div>
  </div>
</template>

<style scoped>
.analytics-page {
  width: min(1460px, calc(100% - 72px));
  margin: 0 auto;
  padding: 118px 0 74px;
  animation: page-rise 480ms cubic-bezier(0.16, 1, 0.3, 1);
}

.analytics-header {
  margin-bottom: 36px;
}

.analytics-header h1 {
  margin: 0 0 8px;
  font-size: clamp(36px, 4vw, 52px);
  font-weight: 700;
  line-height: 1.08;
  color: var(--ink);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.analytics-header p {
  margin: 0;
  color: var(--muted);
  font-size: 16px;
}

/* ── Glass Panel ──────────────────────────────────────── */

.glass-panel {
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  box-shadow: var(--glass-shadow);
  padding: 22px;
  transition:
    transform var(--transition-normal),
    box-shadow var(--transition-normal);
}

.glass-panel:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.11);
}

:root[data-theme='dark'] .glass-panel {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(26, 26, 26, 0.9);
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.panel-title span {
  color: var(--ink);
  font-size: 15px;
  font-weight: 700;
}

.panel-title small {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 12px;
}

/* ── KPI Cards ────────────────────────────────────────── */

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.kpi-card {
  padding: 20px;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  box-shadow: var(--glass-shadow);
  text-align: center;
  transition:
    transform var(--transition-normal),
    box-shadow var(--transition-normal);
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.11);
}

:root[data-theme='dark'] .kpi-card {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(26, 26, 26, 0.9);
}

.kpi-label {
  display: block;
  color: var(--accent);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.kpi-value {
  display: block;
  color: var(--ink);
  font-family: var(--mono);
  font-size: clamp(24px, 3vw, 36px);
  font-weight: 700;
  line-height: 1;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Viz Row ──────────────────────────────────────────── */

.viz-row {
  display: grid;
  grid-template-columns: minmax(340px, 1fr) minmax(340px, 1.2fr);
  gap: 16px;
  margin-bottom: 20px;
}

/* ── Bar Chart ────────────────────────────────────────── */

.bar-legend {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  margin: -8px 0 10px;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
}

.bar-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}

.legend-dot.visit {
  background: rgba(35, 113, 100, 0.64);
}

.legend-dot.download {
  background: rgba(173, 115, 51, 0.74);
}

.bar-chart {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 8px;
  min-height: 176px;
}

.bar-scale {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 22px;
}

.bar-scale span {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 10px;
  text-align: right;
}

.bar-grid {
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: 3px;
  align-items: end;
  min-height: 176px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 0;
}

.bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
  justify-content: flex-end;
}

.bar-col.current .bar-fill.visit {
  background: var(--accent);
  box-shadow: 0 0 8px rgba(35, 113, 100, 0.4);
}

.bar-track {
  width: 100%;
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  min-height: 0;
}

.bar-fill {
  width: min(44%, 8px);
  min-height: 2px;
  border-radius: 2px 2px 0 0;
  transition: height 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

.bar-fill.visit {
  background: rgba(35, 113, 100, 0.5);
}

.bar-fill.download {
  background: rgba(173, 115, 51, 0.72);
}

:root[data-theme='dark'] .bar-fill.visit {
  background: rgba(155, 199, 173, 0.4);
}

:root[data-theme='dark'] .bar-fill.download {
  background: rgba(246, 173, 85, 0.62);
}

:root[data-theme='dark'] .bar-col.current .bar-fill.visit {
  background: var(--accent);
  box-shadow: 0 0 8px rgba(155, 199, 173, 0.3);
}

.bar-hour {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 9px;
  line-height: 1;
  flex-shrink: 0;
}

.download-distribution {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px 12px;
  align-items: start;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
}

.distribution-title,
.distribution-empty {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
}

.distribution-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px 12px;
}

.distribution-row {
  display: grid;
  grid-template-columns: 42px 1fr 28px;
  gap: 7px;
  align-items: center;
  min-width: 0;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 10px;
}

.distribution-row strong {
  color: var(--warm);
  font-size: 11px;
  text-align: right;
}

.distribution-track {
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--soft);
}

.distribution-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: rgba(173, 115, 51, 0.74);
}

/* ── Map ──────────────────────────────────────────────── */

.map-container {
  width: 100%;
  height: 320px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--soft);
}

.city-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.city-tag {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  background: var(--glass-bg);
  color: var(--ink);
  font-family: var(--mono);
  font-size: 12px;
  transition: transform var(--transition-fast);
}

.city-tag:hover {
  transform: translateY(-1px);
}

:root[data-theme='dark'] .city-tag {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(26, 26, 26, 0.8);
}

/* ── Bottom Row ───────────────────────────────────────── */

.bottom-row {
  display: grid;
  grid-template-columns: minmax(400px, 1.6fr) minmax(280px, 1fr);
  gap: 16px;
}

/* ── Tabs ─────────────────────────────────────────────── */

.tab-bar {
  display: flex;
  gap: 2px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 0;
  overflow-x: auto;
}

.tab-btn {
  min-height: 38px;
  padding: 0 14px;
  border: none;
  background: transparent;
  color: var(--muted);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast);
  white-space: nowrap;
}

.tab-btn:hover {
  color: var(--ink);
}

.tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

/* ── Breakdown Table ──────────────────────────────────── */

.breakdown-table {
  width: 100%;
  border-collapse: collapse;
}

.breakdown-table th,
.breakdown-table td {
  padding: 10px 8px;
  border-bottom: 1px solid var(--line);
  font-size: 14px;
  text-align: left;
}

.breakdown-table th {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.rank-cell {
  width: 32px;
  color: var(--accent);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
}

.name-cell {
  color: var(--ink);
  word-break: break-all;
}

.count-cell {
  width: 72px;
  text-align: right;
  color: var(--ink);
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 700;
}

.time-cell {
  width: 110px;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 12px;
  white-space: nowrap;
}

.page-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--ink);
  font-size: 13px;
}

.device-cell {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--muted);
  font-size: 12px;
}

.ev-badge {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.ev-badge.view {
  background: rgba(35, 113, 100, 0.12);
  color: var(--accent);
}

.ev-badge.download {
  background: rgba(173, 115, 51, 0.12);
  color: var(--warm);
}

:root[data-theme='dark'] .ev-badge.view {
  background: rgba(155, 199, 173, 0.15);
}

:root[data-theme='dark'] .ev-badge.download {
  background: rgba(246, 173, 85, 0.15);
}

.empty-hint {
  padding: 40px 0;
  text-align: center;
  color: var(--muted);
  font-size: 14px;
}

/* ── Download Ranking ─────────────────────────────────── */

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--line);
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-num {
  width: 28px;
  flex: 0 0 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--accent);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
}

.rank-info {
  min-width: 0;
}

.rank-info strong {
  display: block;
  color: var(--ink);
  font-size: 14px;
  line-height: 1.3;
}

.rank-info small {
  display: block;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  margin-top: 2px;
}

/* ── States ───────────────────────────────────────────── */

.state-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 0;
  color: var(--muted);
  font-size: 14px;
}

.state-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid var(--line);
  border-top-color: var(--accent);
  border-radius: 999px;
  animation: spin 0.8s linear infinite;
}

.state-overlay.offline {
  opacity: 0.7;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Responsive ───────────────────────────────────────── */

@media (max-width: 1080px) {
  .analytics-page {
    width: min(100% - 32px, 860px);
    padding-top: 116px;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .viz-row {
    grid-template-columns: 1fr;
  }

  .bottom-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .analytics-page {
    width: min(100% - 24px, 560px);
    padding-top: 134px;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .kpi-card {
    padding: 14px;
  }

  .kpi-value {
    font-size: 24px;
  }

  .bar-chart {
    min-height: 160px;
  }

  .bar-grid {
    min-height: 140px;
  }

  .bar-hour {
    font-size: 7px;
  }

  .map-container {
    height: 240px;
  }

  .tab-btn {
    padding: 0 10px;
    font-size: 13px;
  }

  .glass-panel {
    padding: 16px;
  }
}

@keyframes page-rise {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
