import { describe, expect, it } from 'vitest'
import { platformAdviceMap } from '@/utils/platform'

describe('platform recommendations', () => {
  it('recommends the public Android package for Android users', () => {
    expect(platformAdviceMap.android.primaryId).toBe('android-3.5.2')
  })

  it('recommends the portable package for Windows users', () => {
    expect(platformAdviceMap.windows.primaryId).toBe('windows-portable-3.5.2')
  })
})
