export function formatNumber(value: number | null | undefined, fallback = '部署后统计'): string {
  return Number.isFinite(value) ? Number(value).toLocaleString('zh-CN') : fallback
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!Number.isFinite(bytes) || Number(bytes) <= 0) return ''
  const safeBytes = Number(bytes)
  const mib = safeBytes / 1024 / 1024
  if (mib >= 1) return `${mib.toFixed(mib >= 100 ? 0 : 1)} MiB`
  return `${Math.round(safeBytes / 1024)} KiB`
}
