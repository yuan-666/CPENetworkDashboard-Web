import type { Platform, PlatformAdvice } from '@/types'

export const platformAdviceMap: Record<Platform, PlatformAdvice> = {
  android: {
    device: 'Android 手机',
    primaryId: 'android-3.5.3',
    title: '检测到 Android，直接下载 APK。',
    copy: '现场调试通常就是这个场景：手机在手边，CPE 也在旁边。',
  },
  macos: {
    device: 'macOS 电脑',
    primaryId: 'macos-3.5.3',
    title: '检测到 macOS，推荐下载 DMG。',
    copy: '适合坐下来长时间看信号、测速和 Ping 曲线。',
  },
  windows: {
    device: 'Windows 电脑',
    primaryId: 'windows-portable-3.5.3',
    title: '检测到 Windows，推荐免安装 Portable。',
    copy: '临时电脑、U 盘携带和无安装权限环境优先用 Portable；固定电脑也可以改选 EXE 或 MSI。',
  },
  ios: {
    device: 'iPhone / iPad',
    primaryId: 'macos-3.5.3',
    title: '检测到 iOS，iOS 版本正在路上。',
    copy: 'iOS 方向已经在推进，预计很快就能和大家见面。现在可先使用 macOS、Windows 或 Android 版本。',
  },
  linux: {
    device: 'Linux / 其他桌面',
    primaryId: 'windows-portable-3.5.3',
    title: '暂时没有 Linux 桌面包。',
    copy: '当前公开下载是 Android、macOS 和 Windows；Linux 用户建议先用 Android 或 Windows 便携版。',
  },
  unknown: {
    device: '未知设备',
    primaryId: 'android-3.5.3',
    title: '没能判断你的设备，先给你 Android 最新版。',
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
