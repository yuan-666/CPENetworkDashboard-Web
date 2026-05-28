/**
 * CPE Network Dashboard Web — ESA Edge Function
 *
 * Public routes:
 *   /api/health
 *   /api/counter
 *   /api/track
 *   /api/download
 *   /api/downloads
 *   /api/analytics/summary
 *
 * Storage:
 *   EdgeKV namespace: cpeweb
 *
 * Privacy:
 *   Public responses do not expose full IP addresses or raw User-Agent values.
 *   IPs are used only for coarse rate-limit buckets.
 */

const KV_NAMESPACE = 'cpeweb'
const EDGE_BUILD = '2026-05-28.2'
const ANALYTICS_KEY = 'analytics'
const MAX_JSON_BYTES = 24 * 1024
const MAX_DAILY_EVENTS = 360
const PUBLIC_DAYS = 7
const WRITE_TOKEN = readEnv('CPE_STATS_TOKEN') || readEnv('STATS_WRITE_TOKEN')

const DOWNLOADS = {
  'android-3.1': {
    label: 'Android 3.1 APK',
    href: '/downloads/CPE-Network-Dashboard-3.1-android.apk',
  },
  'macos-3.0.0': {
    label: 'macOS 3.0.0 DMG',
    href: '/#/download',
  },
  'windows-exe-3.0.0': {
    label: 'Windows 3.0.0 EXE',
    href: '/#/download',
  },
  'windows-msi-3.0.0': {
    label: 'Windows 3.0.0 MSI',
    href: '/#/download',
  },
  'windows-portable-3.0.0': {
    label: 'Windows 3.0.0 Portable',
    href: '/#/download',
  },
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token, X-CPE-Stats-Token',
    'Access-Control-Max-Age': '86400',
  }
}

function readEnv(name) {
  try {
    const value = globalThis?.[name]
    return value ? String(value).trim() : ''
  } catch {
    return ''
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...corsHeaders(),
    },
  })
}

function edgeKv() {
  return new EdgeKV({ namespace: KV_NAMESPACE })
}

function getTodayKey() {
  const now = new Date()
  const offset = now.getTimezoneOffset() + 480
  const local = new Date(now.getTime() + offset * 60000)
  return local.toISOString().slice(0, 10)
}

function recentDateKeys(days = PUBLIC_DAYS) {
  const safeDays = Math.min(Math.max(Number(days) || PUBLIC_DAYS, 1), 31)
  const dates = []
  for (let i = 0; i < safeDays; i += 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const offset = d.getTimezoneOffset() + 480
    const local = new Date(d.getTime() + offset * 60000)
    dates.push(local.toISOString().slice(0, 10))
  }
  return dates
}

function normalizeIP(value) {
  if (!value) return ''
  let ip = String(value).trim().replace(/^"|"$/g, '')
  if (!ip || ip.toLowerCase() === 'unknown') return ''
  if (ip.startsWith('[')) {
    const end = ip.indexOf(']')
    if (end > 0) ip = ip.slice(1, end)
  } else if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(ip)) {
    ip = ip.replace(/:\d+$/, '')
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) return ip
  if (/^[0-9a-f:.]+$/i.test(ip) && ip.includes(':')) return ip
  return ''
}

function readHeaderIPs(request, header) {
  const value = request.headers.get(header)
  if (!value) return []
  if (header === 'forwarded') {
    return String(value)
      .split(',')
      .map((part) => normalizeIP(part.match(/(?:^|;)\s*for="?([^";,]+)"?/i)?.[1]))
      .filter(Boolean)
  }
  return String(value).split(',').map(normalizeIP).filter(Boolean)
}

function getClientIP(request) {
  const headers = [
    'ali-real-client-ip',
    'ali-cdn-real-ip',
    'cf-connecting-ip',
    'x-real-ip',
    'x-client-ip',
    'x-forwarded-for',
    'forwarded',
  ]
  for (const header of headers) {
    const [ip] = readHeaderIPs(request, header)
    if (ip) return ip
  }
  return '0.0.0.0'
}

function ipBucket(ip) {
  if (!ip || ip === '0.0.0.0') return 'unknown'
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) return `${ip.split('.').slice(0, 3).join('.')}.0`
  if (ip.includes(':')) return `${ip.toLowerCase().split(':').slice(0, 3).join(':')}::`
  return 'unknown'
}

function safeKey(value) {
  return (
    String(value || 'unknown')
      .replace(/[^a-z0-9_-]/gi, '_')
      .slice(0, 160) || 'unknown'
  )
}

function kvKey(...parts) {
  return parts.map((part) => safeKey(part)).join('__')
}

function legacyKey(...parts) {
  return parts.map((part) => String(part || 'unknown')).join(':')
}

async function kvGetText(kv, key) {
  try {
    const value = await kv.get(key, { type: 'text' })
    if (!value || typeof value === 'string') return value || ''
    if (typeof value.text === 'function') return value.text()
    return String(value || '')
  } catch {
    try {
      const value = await kv.get(key)
      if (!value || typeof value === 'string') return value || ''
      if (typeof value.text === 'function') return value.text()
      return ''
    } catch {
      return ''
    }
  }
}

async function kvPutText(kv, key, value) {
  await kv.put(key, String(value))
}

async function consumeRate(kv, key, limit, windowSeconds) {
  try {
    const windowId = Math.floor(Date.now() / 1000 / windowSeconds)
    const rateKey = kvKey('rate', key, windowSeconds, windowId)
    const current = parseInt((await kvGetText(kv, rateKey)) || '0', 10)
    if (current >= limit) return false
    await kvPutText(kv, rateKey, current + 1)
    return true
  } catch {
    return true
  }
}

function normalizePage(page = '/') {
  let value = String(page || '/').slice(0, 180)
  if (value.startsWith('#/')) value = value.slice(1)
  if (!value.startsWith('/')) value = `/${value}`
  return value
}

function normalizeReferrer(value) {
  const raw = String(value || '')
    .slice(0, 260)
    .trim()
  if (!raw) return 'direct'
  try {
    return new URL(raw).hostname.slice(0, 120) || 'direct'
  } catch {
    return raw === 'direct' ? 'direct' : raw.replace(/[^\w:./-]/g, '').slice(0, 120) || 'direct'
  }
}

function parseUserAgent(ua = '') {
  const raw = String(ua).slice(0, 260)
  if (!raw) return { device: 'Unknown', browser: '', os: '' }
  if (/bot|spider|crawler|slurp|bingpreview/i.test(raw))
    return { device: 'Bot', browser: 'Bot', os: '' }

  let os = ''
  if (/Android/i.test(raw)) os = 'Android'
  else if (/iPhone|iPad|iPod/i.test(raw)) os = 'iOS'
  else if (/Windows NT/i.test(raw)) os = 'Windows'
  else if (/Macintosh|Mac OS X/i.test(raw)) os = 'macOS'
  else if (/Linux|X11/i.test(raw)) os = 'Linux'

  let browser = ''
  if (/Edg\//.test(raw)) browser = 'Edge'
  else if (/OPR\//.test(raw)) browser = 'Opera'
  else if (/Firefox\//.test(raw)) browser = 'Firefox'
  else if (/Chrome\//.test(raw) || /CriOS\//.test(raw)) browser = 'Chrome'
  else if (/Safari\//.test(raw)) browser = 'Safari'

  const form = /Mobile|Android|iPhone|iPad|iPod/i.test(raw) ? 'Mobile' : 'Desktop'
  return {
    device: [browser || form, os].filter(Boolean).join(' on ') || 'Unknown',
    browser,
    os,
  }
}

function sameSiteOrNoOrigin(request) {
  const origin = request.headers.get('Origin')
  const referer = request.headers.get('Referer')
  if (!origin && !referer) return true

  const targetHost = new URL(request.url).hostname.toLowerCase()
  const isAllowed = (value) => {
    if (!value) return false
    try {
      const host = new URL(value).hostname.toLowerCase()
      return host === targetHost || host === 'localhost' || host === '127.0.0.1' || host === '::1'
    } catch {
      return false
    }
  }

  return isAllowed(origin) || isAllowed(referer)
}

function verifyWriteToken(request, body = {}) {
  if (!WRITE_TOKEN) return true
  const auth = request.headers.get('Authorization') || ''
  const headerToken = request.headers.get('X-CPE-Stats-Token') || ''
  const bodyToken = body && typeof body === 'object' ? String(body.token || '') : ''
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : ''
  return [headerToken, bodyToken, bearer].some((token) => token && token === WRITE_TOKEN)
}

async function readJsonLimited(request) {
  const len = Number(request.headers.get('content-length') || '0')
  if (len > MAX_JSON_BYTES) throw new Error('Request body too large')
  return request.json()
}

async function incrementCounter(kv, baseKey, todayKey) {
  const current = await readCounter(kv, baseKey, todayKey)
  const base = safeKey(baseKey)
  const [totalStr, storedDate, todayStr] = await Promise.all([
    Promise.resolve(String(current.total || 0)),
    Promise.resolve(todayKey),
    Promise.resolve(String(current.today || 0)),
  ])
  const total = parseInt(totalStr || '0', 10) + 1
  const today = storedDate === todayKey ? parseInt(todayStr || '0', 10) + 1 : 1
  await Promise.all([
    kvPutText(kv, kvKey(base, 'total'), total),
    kvPutText(kv, kvKey(base, 'today_date'), todayKey),
    kvPutText(kv, kvKey(base, 'today_count'), today),
  ])
  return { total, today }
}

async function readCounterTotalOnly(kv, baseKey) {
  const base = safeKey(baseKey)
  const totalStr = await kvGetText(kv, kvKey(base, 'total'))
  if (totalStr) return parseInt(totalStr, 10) || 0
  return parseInt((await kvGetText(kv, legacyKey(baseKey, 'total'))) || '0', 10) || 0
}

async function readCounterTodayOnly(kv, baseKey, todayKey) {
  const base = safeKey(baseKey)
  const [storedDate, todayStr] = await Promise.all([
    kvGetText(kv, kvKey(base, 'today_date')),
    kvGetText(kv, kvKey(base, 'today_count')),
  ])
  if (storedDate || todayStr) {
    return storedDate === todayKey ? parseInt(todayStr || '0', 10) || 0 : 0
  }
  const [legacyDate, legacyToday] = await Promise.all([
    kvGetText(kv, legacyKey(baseKey, 'today_date')),
    kvGetText(kv, legacyKey(baseKey, 'today_count')),
  ])
  return legacyDate === todayKey ? parseInt(legacyToday || '0', 10) || 0 : 0
}

async function readCounter(kv, baseKey, todayKey) {
  const [total, today] = await Promise.all([
    readCounterTotalOnly(kv, baseKey),
    readCounterTodayOnly(kv, baseKey, todayKey),
  ])
  return {
    total,
    today,
  }
}

async function appendDailyEvent(kv, event) {
  const date = getTodayKey()
  const key = kvKey('events', date)
  const fallbackKey = legacyKey('events', date)
  let str = ''

  try {
    str = (await kvGetText(kv, key)) || ''
    if (!str) str = (await kvGetText(kv, fallbackKey)) || ''
  } catch {
    str = ''
  }

  let events = []
  try {
    const parsed = str ? JSON.parse(str) : []
    events = Array.isArray(parsed) ? parsed : []
  } catch {
    events = []
  }

  try {
    events.push(event)
    if (events.length > MAX_DAILY_EVENTS) events = events.slice(events.length - MAX_DAILY_EVENTS)
    await kvPutText(kv, key, JSON.stringify(events))
    return true
  } catch {
    return false
  }
}

async function readRecentEvents(kv) {
  const events = []
  for (const date of recentDateKeys()) {
    try {
      const str =
        (await kvGetText(kv, kvKey('events', date))) ||
        (await kvGetText(kv, legacyKey('events', date)))
      if (!str) continue
      const parsed = JSON.parse(str)
      if (Array.isArray(parsed)) events.push(...parsed)
    } catch {
      /* ignore unavailable or corrupt day */
    }
  }
  return events.sort((a, b) => String(b.time || '').localeCompare(String(a.time || '')))
}

async function safeReadCounter(kv, baseKey, todayKey) {
  try {
    return await readCounter(kv, baseKey, todayKey)
  } catch {
    return { total: 0, today: 0 }
  }
}

function topBreakdown(items, keyFn, limit = 8) {
  const map = new Map()
  for (const item of items) {
    const key = keyFn(item) || 'Unknown'
    map.set(key, (map.get(key) || 0) + 1)
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}

function emptySummary() {
  return {
    visits: { total: 0, today: 0 },
    downloadsTotal: 0,
    downloadsByFile: {},
    pages: [],
    referrers: [],
    devices: [],
    recent: [],
  }
}

function emptyAnalyticsStore() {
  return {
    version: 1,
    updatedAt: '',
    counters: {
      visits: { total: 0, today: 0, todayKey: '' },
      downloads: {},
    },
    events: [],
  }
}

function normalizeStoredCounter(counter = {}, todayKey) {
  return {
    total: parseInt(counter.total || '0', 10) || 0,
    today: counter.todayKey === todayKey ? parseInt(counter.today || '0', 10) || 0 : 0,
    todayKey,
  }
}

async function readAnalyticsStore(kv) {
  const str = await kvGetText(kv, ANALYTICS_KEY)
  if (!str) return emptyAnalyticsStore()
  try {
    const parsed = JSON.parse(str)
    return {
      ...emptyAnalyticsStore(),
      ...parsed,
      counters: {
        visits: parsed?.counters?.visits || { total: 0, today: 0, todayKey: '' },
        downloads: parsed?.counters?.downloads || {},
      },
      events: Array.isArray(parsed?.events) ? parsed.events : [],
    }
  } catch {
    return emptyAnalyticsStore()
  }
}

async function writeAnalyticsStore(kv, store) {
  store.updatedAt = new Date().toISOString()
  await kvPutText(kv, ANALYTICS_KEY, JSON.stringify(store))
}

function incrementStoredCounter(store, group, id, todayKey) {
  if (group === 'visits') {
    const current = normalizeStoredCounter(store.counters.visits, todayKey)
    current.total += 1
    current.today += 1
    store.counters.visits = current
    return { total: current.total, today: current.today }
  }

  const current = normalizeStoredCounter(store.counters.downloads[id], todayKey)
  current.total += 1
  current.today += 1
  store.counters.downloads[id] = current
  return { total: current.total, today: current.today }
}

function appendStoredEvent(store, event) {
  store.events.push(event)
  const maxEvents = Math.max(MAX_DAILY_EVENTS * PUBLIC_DAYS, MAX_DAILY_EVENTS)
  if (store.events.length > maxEvents) {
    store.events = store.events.slice(store.events.length - maxEvents)
  }
}

async function trackInAnalyticsStore(kv, mutator) {
  const store = await readAnalyticsStore(kv)
  const result = mutator(store)
  await writeAnalyticsStore(kv, store)
  return result
}

function summaryFromStore(store, todayKey) {
  const downloadsByFile = {}
  let downloadsTotal = 0

  for (const id of Object.keys(DOWNLOADS)) {
    const counter = normalizeStoredCounter(store.counters.downloads[id], todayKey)
    downloadsByFile[id] = {
      total: counter.total,
      today: counter.today,
      label: DOWNLOADS[id].label,
      href: DOWNLOADS[id].href,
    }
    downloadsTotal += counter.total
  }

  const events = [...store.events].sort((a, b) =>
    String(b.time || '').localeCompare(String(a.time || ''))
  )

  return {
    visits: normalizeStoredCounter(store.counters.visits, todayKey),
    downloadsByFile,
    downloadsTotal,
    pages: topBreakdown(
      events.filter((event) => event.kind === 'view'),
      (event) => event.page
    ),
    referrers: topBreakdown(events, (event) => event.referrer),
    devices: topBreakdown(events, (event) => event.device),
    recent: events.slice(0, 18),
  }
}

function routePath(url) {
  const path = url.pathname.replace(/^\/api(?=\/|$)/, '') || '/'
  return path === '' ? '/' : path
}

async function handleCounter(request) {
  const kv = edgeKv()
  const todayKey = getTodayKey()
  const url = new URL(request.url)
  const skip = url.searchParams.get('skip') === '1'
  try {
    if (!skip) {
      const allowed = await consumeRate(kv, `counter:${ipBucket(getClientIP(request))}`, 120, 3600)
      if (!allowed) return json({ error: 'Too many requests' }, 429)
      return json(
        await trackInAnalyticsStore(kv, (store) =>
          incrementStoredCounter(store, 'visits', 'visits', todayKey)
        )
      )
    }
    const store = await readAnalyticsStore(kv)
    return json(normalizeStoredCounter(store.counters.visits, todayKey))
  } catch {
    return json(await safeReadCounter(kv, 'visits', todayKey))
  }
}

async function handleTrack(request) {
  if (!sameSiteOrNoOrigin(request)) return json({ error: 'Access denied' }, 403)
  const kv = edgeKv()
  const bucket = ipBucket(getClientIP(request))
  const allowed = await consumeRate(kv, `track:${bucket}`, 240, 3600)
  if (!allowed) return json({ error: 'Too many requests' }, 429)

  try {
    const body = await readJsonLimited(request)
    if (!verifyWriteToken(request, body)) return json({ error: 'Invalid write token' }, 401)
    const ua = parseUserAgent(body.ua || request.headers.get('User-Agent') || '')
    const todayKey = getTodayKey()
    const page = normalizePage(body.page || '/')
    const event = {
      kind: 'view',
      time: new Date().toISOString(),
      page,
      referrer: normalizeReferrer(body.referrer || request.headers.get('Referer') || ''),
      device: ua.device,
      browser: ua.browser,
      os: ua.os,
    }
    const visits = await trackInAnalyticsStore(kv, (store) => {
      const counter = incrementStoredCounter(store, 'visits', 'visits', todayKey)
      appendStoredEvent(store, event)
      return counter
    })
    return json({ ok: true, visits, eventStored: true, build: EDGE_BUILD })
  } catch (error) {
    return json({ ok: false, error: 'Failed to track visit', build: EDGE_BUILD }, 500)
  }
}

async function readDownloads(kv, todayKey) {
  const downloadsByFile = {}
  let downloadsTotal = 0
  await Promise.all(
    Object.keys(DOWNLOADS).map(async (id) => {
      const counter = await safeReadCounter(kv, `download:${id}`, todayKey)
      downloadsByFile[id] = {
        ...counter,
        label: DOWNLOADS[id].label,
        href: DOWNLOADS[id].href,
      }
      downloadsTotal += counter.total
    })
  )
  return { downloadsByFile, downloadsTotal }
}

async function handleDownload(request) {
  const url = new URL(request.url)
  const kv = edgeKv()
  let fileId = url.searchParams.get('file') || ''
  let body = {}

  if (request.method === 'POST') {
    if (!sameSiteOrNoOrigin(request)) return json({ error: 'Access denied' }, 403)
    try {
      body = await readJsonLimited(request)
      fileId = body.file || fileId
      if (!verifyWriteToken(request, body)) return json({ error: 'Invalid write token' }, 401)
    } catch {
      return json({ ok: false, error: 'Invalid JSON' }, 400)
    }
  }

  if (!DOWNLOADS[fileId]) return json({ ok: false, error: 'Unknown download file' }, 404)

  const allowed = await consumeRate(
    kv,
    `download:${fileId}:${ipBucket(getClientIP(request))}`,
    90,
    3600
  )
  if (!allowed) return json({ error: 'Too many requests' }, 429)

  try {
    const todayKey = getTodayKey()
    const ua = parseUserAgent(body.ua || request.headers.get('User-Agent') || '')
    const event = {
      kind: 'download',
      time: new Date().toISOString(),
      file: fileId,
      fileLabel: DOWNLOADS[fileId].label,
      page: normalizePage(body.page || '/'),
      referrer: normalizeReferrer(body.referrer || request.headers.get('Referer') || ''),
      device: ua.device,
      browser: ua.browser,
      os: ua.os,
    }
    const counter = await trackInAnalyticsStore(kv, (store) => {
      const next = incrementStoredCounter(store, 'downloads', fileId, todayKey)
      appendStoredEvent(store, event)
      return next
    })

    if (request.method === 'GET') {
      return Response.redirect(new URL(DOWNLOADS[fileId].href, request.url).toString(), 302)
    }

    return json({ ok: true, file: fileId, eventStored: true, ...counter, build: EDGE_BUILD })
  } catch (error) {
    if (request.method === 'GET') {
      return Response.redirect(new URL(DOWNLOADS[fileId].href, request.url).toString(), 302)
    }
    return json({ ok: false, error: 'Failed to track download', build: EDGE_BUILD }, 500)
  }
}

async function handleDownloads() {
  try {
    const kv = edgeKv()
    const todayKey = getTodayKey()
    const store = await readAnalyticsStore(kv)
    const summary = summaryFromStore(store, todayKey)
    if (summary.downloadsTotal > 0) {
      return json({
        downloadsByFile: summary.downloadsByFile,
        downloadsTotal: summary.downloadsTotal,
        build: EDGE_BUILD,
      })
    }
    return json({ ...(await readDownloads(kv, todayKey)), build: EDGE_BUILD })
  } catch {
    return json({ downloadsByFile: {}, downloadsTotal: 0, build: EDGE_BUILD })
  }
}

async function handleSummary() {
  const kv = edgeKv()
  const todayKey = getTodayKey()
  const store = await readAnalyticsStore(kv)
  const storeSummary = summaryFromStore(store, todayKey)
  if (
    storeSummary.visits.total > 0 ||
    storeSummary.downloadsTotal > 0 ||
    storeSummary.recent.length > 0
  ) {
    return json({ ...storeSummary, build: EDGE_BUILD })
  }
  const [visits, downloads, events] = await Promise.all([
    safeReadCounter(kv, 'visits', todayKey),
    readDownloads(kv, todayKey).catch(() => ({ downloadsByFile: {}, downloadsTotal: 0 })),
    readRecentEvents(kv).catch(() => []),
  ])
  return json({
    visits,
    ...downloads,
    pages: topBreakdown(
      events.filter((event) => event.kind === 'view'),
      (event) => event.page
    ),
    referrers: topBreakdown(events, (event) => event.referrer),
    devices: topBreakdown(events, (event) => event.device),
    recent: events.slice(0, 18),
    build: EDGE_BUILD,
  })
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() })
    }

    const url = new URL(request.url)
    const path = routePath(url)

    if (path === '/health') {
      return json({
        ok: true,
        service: 'cpe-network-dashboard-web',
        namespace: KV_NAMESPACE,
        build: EDGE_BUILD,
      })
    }

    if (path === '/counter') {
      if (request.method !== 'GET') return json({ error: 'Use GET' }, 405)
      return handleCounter(request)
    }

    if (path === '/track') {
      if (request.method !== 'POST') return json({ error: 'Use POST' }, 405)
      return handleTrack(request)
    }

    if (path === '/download') {
      if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Use GET or POST' }, 405)
      return handleDownload(request)
    }

    if (path === '/downloads') {
      if (request.method !== 'GET') return json({ error: 'Use GET' }, 405)
      return handleDownloads()
    }

    if (path === '/analytics/summary') {
      if (request.method !== 'GET') return json({ error: 'Use GET' }, 405)
      return handleSummary()
    }

    return json({ error: 'Not found' }, 404)
  },
}
