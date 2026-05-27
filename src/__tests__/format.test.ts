import { describe, expect, it } from 'vitest'
import { formatBytes, formatNumber } from '@/utils/format'

describe('format utilities', () => {
  it('formats counters with a fallback', () => {
    expect(formatNumber(1200)).toBe('1,200')
    expect(formatNumber(null)).toBe('部署后统计')
  })

  it('formats byte sizes for download progress', () => {
    expect(formatBytes(1024)).toBe('1 KiB')
    expect(formatBytes(20971520)).toBe('20.0 MiB')
  })
})
