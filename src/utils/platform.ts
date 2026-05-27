import type { Platform, PlatformAdvice } from '@/types'

export const platformAdviceMap: Record<Platform, PlatformAdvice> = {
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
}

export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'unknown'

  const ua = navigator.userAgent || ''
  const platform = navigator.platform || ''
  const hasTouchMac = /Mac/i.test(platform) && navigator.maxTouchPoints > 1

  if (/Android/i.test(ua)) return 'android'
  if (/iPhone|iPad|iPod/i.test(ua) || hasTouchMac) return 'ios'
  if (/Windows/i.test(ua) || /Win/i.test(platform)) return 'windows'
  if (/Macintosh|Mac OS X/i.test(ua) || /Mac/i.test(platform)) return 'macos'
  if (/Linux|X11/i.test(ua)) return 'linux'
  return 'unknown'
}
