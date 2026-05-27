import { describe, expect, it } from 'vitest'
import { platformAdviceMap } from '@/utils/platform'

describe('platform recommendations', () => {
  it('recommends the public Android package for Android users', () => {
    expect(platformAdviceMap.android.primaryId).toBe('android-3.1')
  })

  it('recommends the regular installer for Windows users', () => {
    expect(platformAdviceMap.windows.primaryId).toBe('windows-exe-3.0.0')
  })
})
