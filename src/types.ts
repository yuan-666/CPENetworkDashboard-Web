export interface Route {
  path: string
  label: string
  title: string
}

export interface HeroFact {
  label: string
  value: string
}

export interface ProductMoment {
  label: string
  title: string
  copy: string
  points: string[]
}

export interface PlatformCard {
  name: string
  version: string
  title: string
  copy: string
}

export interface Download {
  id: string
  platform: string
  version: string
  title: string
  fileName: string
  href?: string
  chunks?: string[]
  chunkBytes?: number[]
  size: string
  checksum: string
  label: string
  copy: string
  beta?: boolean
}

export interface ChangelogSection {
  title: string
  items: string[]
}

export interface ChangelogEntry {
  version: string
  date: string
  badge: string
  lead: string
  sections: ChangelogSection[]
}

export interface PersonLink {
  label: string
  href: string
}

export interface Maker {
  name: string
  links: PersonLink[]
}

export interface ThanksPerson {
  name: string
  contribution: string
  links?: PersonLink[]
}

export interface AboutInfo {
  chineseName: string
  englishName: string
  versionName: string
  userGroup: string
  description: string
  note: string
  makers: Maker[]
  thanks: ThanksPerson[]
}

export interface DownloadCounter {
  total: number
  today: number
}

export interface DownloadStats extends DownloadCounter {
  label: string
  href: string
}

export interface DownloadTrackResult extends DownloadCounter {
  ok: boolean
  file: string
  eventStored?: boolean
}

export interface AnalyticsSummary {
  visits: DownloadCounter
  downloadsTotal: number
  downloadsByFile: Record<string, DownloadStats>
  pages: BreakdownItem[]
  referrers: BreakdownItem[]
  devices: BreakdownItem[]
  recent: RecentEvent[]
  geo?: GeoData
  hourly?: HourlyData
}

export interface BreakdownItem {
  name: string
  count: number
}

export interface RecentEvent {
  kind: 'view' | 'download'
  time: string
  page?: string
  file?: string
  fileLabel?: string
  referrer?: string
  device?: string
  browser?: string
  os?: string
  country?: string
  countryCode?: string
  city?: string
  region?: string
  lat?: number
  lon?: number
}

export interface CountryStat {
  name: string
  count: number
}

export interface CityStat {
  country: string
  countryCode: string
  city: string
  region: string
  lat: number
  lon: number
  count: number
}

export interface GeoData {
  countries: CountryStat[]
  cities: CityStat[]
}

export interface HourlyBar {
  hour: number
  count: number
}

export interface HourlyData {
  bars: HourlyBar[]
  total: number
  max: number
  currentHour: number
}

export interface UpdateDownloadChunk {
  index: number
  href: string
  url: string
  bytes: number
}

export interface UpdateDownload {
  fileId: string
  platform: string
  version: string
  label: string
  fileName: string
  mode: 'single' | 'chunked'
  href: string
  url: string
  chunks: UpdateDownloadChunk[]
  chunkBytes: number[]
  size: string
  checksum: string
}

export interface UpdateRelease {
  platform: string
  channel: string
  version: string
  versionCode: number
  title: string
  notes: string
  releaseDate: string
  publishedAt: string
  mandatory: boolean
  minSupportedVersion: string
  download: UpdateDownload | null
  alternatives: UpdateDownload[]
}

export interface UpdateCheckResult {
  ok: boolean
  platform: string
  channel: string
  current: {
    version: string
    versionCode: number
  }
  updateAvailable: boolean
  mandatory: boolean
  latest: UpdateRelease | null
  updatedAt?: string
  build?: string
}

export interface DownloadState {
  status: '' | 'downloading' | 'assembling' | 'done' | 'error'
  progress?: number
  loadedBytes?: number
  totalBytes?: number
  currentChunk?: number
  chunkCount?: number
}

export type Platform = 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'unknown'

export interface PlatformAdvice {
  device: string
  primaryId: string
  title: string
  copy: string
}
