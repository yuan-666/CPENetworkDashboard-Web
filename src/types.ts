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
