import type {
  AboutInfo,
  ChangelogEntry,
  Download,
  HeroFact,
  PlatformCard,
  ProductMoment,
  Route,
} from '@/types'

export const appIcon = '/media/app-icon.png'

export const routes: Route[] = [
  { path: '/', label: '首页', title: 'CPE加加' },
  { path: '/product', label: '产品', title: '产品介绍' },
  { path: '/download', label: '下载', title: '下载 CPE加加' },
  { path: '/changelog', label: '更新日志', title: '更新日志' },
  { path: '/about', label: '关于', title: '关于 CPE加加' },
]

export const heroDesktopImage = '/media/computer/desktop-signal-dashboard.png'

export const desktopScreenItems: Array<{
  image: string
  label: string
  tone: 'light' | 'dark'
}> = [
  { image: '/media/computer/desktop-signal-dashboard.png', label: '信号质量监控', tone: 'dark' },
  { image: '/media/computer/desktop-frequency-lock.png', label: '频段锁定管理', tone: 'light' },
  { image: '/media/computer/desktop-speed-test.png', label: '测速页面', tone: 'light' },
  { image: '/media/computer/desktop-ping-test.png', label: 'Ping 测试', tone: 'light' },
  { image: '/media/computer/desktop-route-test.png', label: '路由追踪', tone: 'light' },
  { image: '/media/computer/desktop-display-settings.png', label: '显示设置', tone: 'light' },
  { image: '/media/computer/desktop-login-config.png', label: '登录配置', tone: 'light' },
]

export const mobileScreenItems: Array<{
  image: string
  label: string
  tone: 'light' | 'dark'
}> = [
  { image: '/media/phone/mobile-status-dashboard-dark.jpg', label: '状态看板', tone: 'dark' },
  { image: '/media/phone/mobile-lock-arfcn.jpg', label: '锁 ARFCN', tone: 'dark' },
  { image: '/media/phone/mobile-band-selection.jpg', label: '频段选择', tone: 'dark' },
  { image: '/media/phone/mobile-network-preference.jpg', label: '网络首选', tone: 'dark' },
  { image: '/media/phone/mobile-lock-pci.jpg', label: '锁 PCI', tone: 'dark' },
  { image: '/media/phone/mobile-device-neighbor-cells.jpg', label: '设备信息与邻区', tone: 'dark' },
  { image: '/media/phone/mobile-ping-test.jpg', label: 'Ping 测试', tone: 'dark' },
  { image: '/media/phone/mobile-speed-test.jpg', label: '测速页面', tone: 'dark' },
  { image: '/media/phone/mobile-route-test.jpg', label: '路由追踪', tone: 'dark' },
  { image: '/media/phone/mobile-display-settings.jpg', label: '显示设置', tone: 'dark' },
  { image: '/media/phone/mobile-device-settings.jpg', label: '设备设置', tone: 'dark' },
  { image: '/media/phone/mobile-status-dashboard-light.jpg', label: '浅色状态看板', tone: 'light' },
]

export const desktopScreens = desktopScreenItems.map((item) => item.image)
export const desktopScreenLabels = desktopScreenItems.map((item) => item.label)
export const desktopScreenTones = desktopScreenItems.map((item) => item.tone)
export const mobileScreens = mobileScreenItems.map((item) => item.image)
export const mobileScreenLabels = mobileScreenItems.map((item) => item.label)
export const mobileScreenTones = mobileScreenItems.map((item) => item.tone)

function chunkedParts(folder: string, fileName: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_, index) => `/downloads/chunks/${folder}/${fileName}.part${String(index).padStart(2, '0')}`
  )
}

const chunkBytes: Record<string, number[]> = {
  'macos-3.5.3': [20971520, 20971520, 20971520, 20971520, 20971520, 20971520, 8734301],
  'windows-exe-3.5.3': [20971520, 20971520, 20971520, 20971520, 20971520, 20971520, 20737264],
  'windows-msi-3.5.3': [20971520, 20971520, 20971520, 20971520, 20971520, 20971520, 19996672],
  'windows-portable-3.5.3': [20971520, 20971520, 20971520, 20971520, 20971520, 20534614],
}

export const heroFacts: HeroFact[] = [
  { label: '当前小区', value: 'PCI / ARFCN' },
  { label: '射频质量', value: 'RSRP / SINR' },
  { label: '验证链路', value: 'Speed / Ping' },
]

export const telemetryWords = [
  'RSRP',
  'RSRQ',
  'SINR',
  'AMBR',
  'PCI',
  'ARFCN',
  'CA',
  'Ping',
  'Route',
  'Lock',
]

export const productMoments: ProductMoment[] = [
  {
    label: '先看清',
    title: '它现在连着哪个基站？',
    copy: '当前小区、邻区、信号质量、签约速率和连接状态一目了然。先搞清楚是信号掉了、频段变了，还是后台字段没显示对。',
    points: ['当前/邻区', 'RSRP / RSRQ / SINR', 'SIM / AMBR'],
  },
  {
    label: '再动手',
    title: '要不要锁频？先看看数据。',
    copy: 'Band、ARFCN、PCI、网络模式和邻区扫描都在一个页面里。改完立刻回读，确认设备有没有真的吃配置。',
    points: ['Band 锁定', 'ARFCN / PCI', '网络偏好'],
  },
  {
    label: '最后验证',
    title: '改完了，测一下这条链路。',
    copy: '测速、Ping 和路由测试不是为了好看的数字，是为了确认刚才的调整有没有效果。电脑端适合长时间观察，手机端适合现场走动。',
    points: ['下载测速', 'Ping 折线', '路由测试'],
  },
]

export const platformCards: PlatformCard[] = [
  {
    name: 'Android',
    version: '3.5.3',
    title: '在设备旁边，手机最方便。',
    copy: '打开 CPE加加，先看信号、扫邻区、改锁定。弱电箱、窗边、机柜旁边，用手机比搬电脑省事多了。',
  },
  {
    name: 'macOS',
    version: '3.5.3',
    title: '坐下来排查，Mac 看得更全。',
    copy: '连接、锁定、测试和日志能铺开，边调边记，也能把 CPE加加 的结果放到大屏上对比。',
  },
  {
    name: 'Windows',
    version: '3.5.3',
    title: '维护电脑、临时电脑，都能用。',
    copy: '默认推荐免安装 Portable，常规 EXE 和固定环境 MSI 也都保留，方便把 CPE加加 放到随手可用的位置。',
  },
  {
    name: 'iOS',
    version: '敬请期待',
    title: 'CPE加加 iOS 版本正在路上。',
    copy: 'iOS 方向已经在推进，预计很快就能和大家见面。',
  },
]

export const supportedDevices: Array<[string, string]> = [
  ['HUAWEI / 华为', 'H168-383 / H155-381 / H153-381'],
  ['FiberHome / 烽火通信', 'LG6121D / LG6121F / LG6121H / LG6851F / LG6151M'],
  ['NRADIO / 鲲鹏无限', 'LuCI NRADIO CPE，兼容 cpe / cpe1 / wan0 模板'],
  ['ZLT / 通则', 'X300 Max 支持读取和锁频；X300 GT 可读取，锁频未测试'],
  ['ZTE / 中兴通讯', 'G5 Pro / U60 Pro'],
]

export const downloads: Download[] = [
  {
    id: 'android-3.5.3',
    platform: 'Android',
    version: '3.5.3',
    title: 'Android APK',
    fileName: 'CPEPlusPlus-v3.5.3.apk',
    href: '/downloads/CPEPlusPlus-v3.5.3.apk',
    size: '13.4 MiB',
    checksum: '1f2180ff03f84a64aaeb413debebe349219ab3e739cea1c267d8e375995c99e1',
    label: '最新正式版',
    copy: '当前 CPE加加 Android 最新正式版。统一 CPE加加 / CPE++ 品牌和新图标，并修复混淆后 release / portable 更新检查异常。',
  },
  {
    id: 'macos-3.5.3',
    platform: 'macOS',
    version: '3.5.3',
    title: 'macOS DMG',
    fileName: 'CPEPlusPlus-3.5.3-macos-arm64.dmg',
    chunks: chunkedParts('macos-3.5.3', 'CPEPlusPlus-3.5.3-macos-arm64.dmg', 7),
    chunkBytes: chunkBytes['macos-3.5.3'],
    size: '128.3 MiB',
    checksum: 'c0cf7b64694f06d4dc6c45ef3c15f259aae1b442ff72f2dfd77b1cd56db165b4',
    label: 'Mac 桌面版',
    copy: '当前 CPE加加 macOS arm64 最新桌面版。同步品牌、图标、更新检测修复和烽火后台重登录优化。',
  },
  {
    id: 'windows-portable-3.5.3',
    platform: 'Windows',
    version: '3.5.3',
    title: 'Windows Portable',
    fileName: 'CPEPlusPlus-3.5.3-protected-portable-windows-x64.zip',
    chunks: chunkedParts(
      'windows-portable-3.5.3',
      'CPEPlusPlus-3.5.3-protected-portable-windows-x64.zip',
      6
    ),
    chunkBytes: chunkBytes['windows-portable-3.5.3'],
    size: '119.6 MiB',
    checksum: '11091c7d2560000cf4167b6fc27231da3a0acb0cf6cfe7d17456de9dfcf703c5',
    label: 'Windows 免安装（推荐）',
    copy: '当前 CPE加加 Windows 默认推荐版本。适合临时电脑、U 盘携带和没有安装权限的环境。',
  },
  {
    id: 'windows-exe-3.5.3',
    platform: 'Windows',
    version: '3.5.3',
    title: 'Windows EXE',
    fileName: 'CPEPlusPlus-3.5.3-windows-x64.exe',
    chunks: chunkedParts('windows-exe-3.5.3', 'CPEPlusPlus-3.5.3-windows-x64.exe', 7),
    chunkBytes: chunkBytes['windows-exe-3.5.3'],
    size: '139.8 MiB',
    checksum: '0808a5a69bf1ac5a16561955f67cc55ac87cfb3c3298b28dbe8e6ab17290addf',
    label: 'Windows 常规安装',
    copy: '适合固定使用的维护电脑。安装后可以像普通桌面应用一样使用 CPE加加。',
  },
  {
    id: 'windows-msi-3.5.3',
    platform: 'Windows',
    version: '3.5.3',
    title: 'Windows MSI',
    fileName: 'CPEPlusPlus-3.5.3-windows-x64.msi',
    chunks: chunkedParts('windows-msi-3.5.3', 'CPEPlusPlus-3.5.3-windows-x64.msi', 7),
    chunkBytes: chunkBytes['windows-msi-3.5.3'],
    size: '139.1 MiB',
    checksum: 'a9d313bd7c77963ef650f7c7b40ea3ce986dbbb20cc8e7d67c36a90e47cbd1de',
    label: 'Windows 固定部署',
    copy: '适合固定部署、统一安装或更偏企业维护习惯的 Windows 环境，方便统一分发 CPE加加。',
  },
  {
    id: 'android-3.5',
    platform: 'Android',
    version: '3.5',
    title: 'Android APK',
    fileName: 'CPEPlusPlus-v3.5-legacy-release.apk',
    href: '/downloads/CPEPlusPlus-v3.5-legacy-release.apk',
    size: '13.3 MiB',
    checksum: '9c562d0f7a61191c6b31a596a43d2fce44a9093d5f8329a698aed7e6a6a03700',
    label: '旧版 Android 3.5',
    copy: '这是旧版本的 CPE加加，仅保留给暂时需要回退的 Android 用户。新用户建议下载 3.5.3。',
  },
]

export const changelogEntries: ChangelogEntry[] = [
  {
    version: '3.5.3',
    date: '2026-06-09',
    badge: 'Android / macOS / Windows 最新正式版',
    lead:
      'CPE加加 3.5.3 已经同步发布 Android、macOS 和 Windows。这个版本统一品牌与新图标，修复混淆后更新检查异常，并继续同步烽火后台重登录优化。',
    sections: [
      {
        title: '主要变化',
        items: [
          'Android 更新到 versionCode 10 / versionName 3.5.3；桌面端和共享应用元数据升级到 3.5.3 / versionCode 353。',
          '应用品牌统一为 CPE加加，英文名 CPE++；发布文件名统一使用 CPEPlusPlus，避免符号在部分系统里不兼容。',
          'Android、Windows 和 macOS 图标资源替换为新的 CPE++ 图标。',
          '修复 ProGuard 混淆后 release / portable 更新检查异常：更新请求使用显式 JSON key，响应字段名保持稳定。',
        ],
      },
      {
        title: '设备与桌面同步',
        items: [
          '同步烽火 / FiberHome 后台自动重登录优化：登录成功后记录并重置重登录时间，空小区重登录独立限流。',
          '后台重登录会保留当前可见连接数据；刷新异常时触发后台重登，但不会先清空仍然有效的旧数据。',
          'Windows 继续保留受保护 Portable 打包流程和 .cpe-portable 标记，并保留固定签名辅助脚本。',
          '延续桌面 UI/UX、更新检查、已保存设备、测试页、AMBR/QCI 和紧凑看板等近期工作。',
        ],
      },
      {
        title: '发布包',
        items: [
          'Android：CPEPlusPlus-v3.5.3.apk，SHA-256：1f2180ff03f84a64aaeb413debebe349219ab3e739cea1c267d8e375995c99e1。',
          'macOS：CPEPlusPlus-3.5.3-macos-arm64.dmg，SHA-256：c0cf7b64694f06d4dc6c45ef3c15f259aae1b442ff72f2dfd77b1cd56db165b4。',
          'Windows Portable：CPEPlusPlus-3.5.3-protected-portable-windows-x64.zip，SHA-256：11091c7d2560000cf4167b6fc27231da3a0acb0cf6cfe7d17456de9dfcf703c5。',
          'Windows EXE：CPEPlusPlus-3.5.3-windows-x64.exe，SHA-256：0808a5a69bf1ac5a16561955f67cc55ac87cfb3c3298b28dbe8e6ab17290addf。',
          'Windows MSI：CPEPlusPlus-3.5.3-windows-x64.msi，SHA-256：a9d313bd7c77963ef650f7c7b40ea3ce986dbbb20cc8e7d67c36a90e47cbd1de。',
        ],
      },
    ],
  },
  {
    version: '3.5.2',
    date: '2026-06-08',
    badge: '上一版正式版',
    lead:
      'CPE加加 3.5.2 已经同步发布 Android、macOS 和 Windows。这个版本重点修复烽火 / FiberHome 登录后连接页反复闪烁的问题，并把 Android 应用内检查更新和桌面端近期改进一起纳入当前公开版本。',
    sections: [
      {
        title: '修复问题',
        items: [
          '修复烽火 / FiberHome 登录后连接页闪烁的问题：后台重登录时保留当前可见连接状态，不再在自动刷新过程中反复退回登录页。',
          '烽火后台重登录失败时不再强制清空连接页状态，减少自动刷新时的页面跳动和重复闪屏。',
          '桌面端同步 Android 分支的烽火后台重登录逻辑，保留旧的有效连接数据，同时在后台继续重试。',
        ],
      },
      {
        title: '更新能力',
        items: [
          'Android 新增应用内检查更新，支持手动检查、下载进度、SHA-256 校验和系统安装器交接。',
          '应用更新接口支持单 APK 下载，也支持按分片索引下载、按顺序合并并校验后安装，继续沿用官网低成本分片下载方式。',
          '关于页和设置页版本号改为读取构建信息，App 内显示会和实际安装包版本一致。',
        ],
      },
      {
        title: '桌面端同步',
        items: [
          'macOS 和 Windows 桌面端版本同步到 3.5.2，继续保留更新检测、已保存设备、测试页面、AMBR/QCI 和紧凑看板等近期改进。',
          'Windows 继续保留受保护便携版打包流程，并在官网下载页默认推荐 Portable 免安装包。',
          'Windows 新增固定签名辅助脚本，便于后续统一处理安装包签名。',
        ],
      },
      {
        title: '发布包',
        items: [
          'Android：CPEPlusPlus-v3.5.2.apk，SHA-256：302ceb8f1c145b8e41eac55aa33067bcc5eb9e5b19354a9bf09cd985211fc1b6。',
          'macOS：CPEPlusPlus-3.5.2-macos-arm64.dmg，SHA-256：cf03bf8ae81ef106acce2b24fb69b868b8445c456cd01468b37d62cb24086288。',
          'Windows Portable：CPEPlusPlus-3.5.2-protected-portable-windows-x64.zip，SHA-256：1587f5e4eea86718f7c1f3c6ada053a6d2c24b1608801667cd92dffb438ed549。',
          'Windows EXE：CPEPlusPlus-3.5.2-windows-x64.exe，SHA-256：51ff1548a340b643fa0c9b1bc6640d1324b1a21cdf89bf75c2827cd82c1df3e5。',
          'Windows MSI：CPEPlusPlus-3.5.2-windows-x64.msi，SHA-256：32ec9c0b3bc1de358ac8da89c902243874f0ed311a4d55234d4fd51c6d9e3362。',
        ],
      },
    ],
  },
  {
    version: 'Android 3.5',
    date: '2026-06-08',
    badge: '旧版 Android 正式版',
    lead:
      'Android 3.5 是当前保留的旧版 Android 包，主要用于需要回退的用户。新用户建议下载 3.5.3。',
    sections: [
      {
        title: '新增功能',
        items: [
          '新增通则（新）设备适配。',
          '新增通则登录、刷新、网络首选、锁 Band、锁小区等接口逻辑。',
          '新增通则连接页面，支持连接情况、系统状态、当前小区、射频质量、上下行链路、设备信息、邻区显示和载波聚合显示。',
          '新增通则频段能力读取。',
          '通则登录成功后自动读取频段能力，避免进入锁小区页面时没有 Band 可选。',
          '通则锁 Band、锁小区增加读取后台已保存状态、开关状态和一键恢复默认。',
          '新增华为 E6898-886 专项适配。',
          '当设备型号为 E6898-886 时，自动保持 diag 和 telnet/AT TCP 开启。',
          '新增华为连接页“载波聚合”卡片：仅当存在 Type=S 条目时显示。原“邻区显示”继续完整显示 P/S/D，并保留点击条目锁频功能。',
          '新增华为 SIM 卡 AMBR 获取辅助逻辑：支持缓存状态下的 AMBR 展示。强化开 telnet/diag、关闭移动数据、等待后重新打开移动数据并获取 AMBR 的流程。',
          '新增设置页“捐赠”入口：新增捐赠说明页，新增微信和支付宝捐赠二维码卡片。',
          '测速页面重构。',
        ],
      },
      {
        title: '修复问题',
        items: [
          '修复烽火 AMBR 显示错误，按数值特征选择合适换算方式。',
          '修复烽火 PUCCH 显示逻辑和 4G 下 Trans.Mode 显示问题。',
          '修复烽火、华为、中兴、鲲鹏无限等配置下流量统计单位换算，统一按 1024 进制处理并支持 TB 显示。',
          '修复通则邻区显示下面重复出现载波聚合页面的问题。',
          '修复通则设备信息里“当前下载 / 当前上传”命名不符合语义的问题。',
          '修复通则设备信息在线时间来源不准确的问题。',
          '修复华为当前小区 DL/UL 被拆分或显示异常的问题，保持 DL/UL 作为完整卡片名。',
          '修复华为当前小区 ARFCN 在 5G CA 场景下取值不稳定的问题。',
          '修复华为 AMBR 获取后移动数据恢复不稳定的问题。',
          '修复华为锁 Band、锁 ARFCN、锁 PCI 下发后缺少结果提示的问题。',
          '修复测速停止后重新开始时柱状图未清空的问题。',
        ],
      },
      {
        title: '界面和交互调整',
        items: [
          '通则锁 Band 页面选中频段左侧增加 √，提升辨识度。',
          '登录页密码输入框增加小眼睛，方便查看密码。',
          '测速页面在线程数位置改为“普通模式 / 极速模式”二选一。',
          '测速页面点击下载、上传、双向后隐藏三按钮，仅显示一个红色停止按钮。',
          '速率监控改为柱状图样式，并优化从右向左推进动效。',
          '删除带宽上限、下载流量、上传流量、运行时长等冗余展示。',
          '新增“总消耗流量”长卡片。',
          '支持配置多条下载 URL 和上传 URL，方便多线程打流。',
        ],
      },
      {
        title: '发布包',
        items: [
          '安装包：CPEPlusPlus-v3.5-legacy-release.apk。',
          'SHA-256：9c562d0f7a61191c6b31a596a43d2fce44a9093d5f8329a698aed7e6a6a03700。',
        ],
      },
    ],
  },
  {
    version: 'Android 3.2 Beta',
    date: '2026-05-30',
    badge: 'Beta 测试版',
    lead: '这版是 Android 3.2 的 Beta 测试版本，包含最新修复和功能，但可能存在不稳定或 Bug。建议想体验新功能的用户尝试，普通用户建议继续使用正式版 3.1。',
    sections: [
      {
        title: '烽火设备优化',
        items: [
          '修复 4G 下 Trans.Mode 显示问题，更新接口逻辑。',
          '烽火 Pro2 参数查看支持。',
          '优化烽火 AMBR 显示逻辑。',
        ],
      },
      {
        title: '测速页改进',
        items: [
          '测速界面速率监控重新适配，减少数值溢出。',
        ],
      },
      {
        title: 'OPPO 系设备修复',
        items: [
          '修复 OPPO 系在烽火配置下闪屏问题。',
        ],
      },
    ],
  },
  {
    version: 'Android 3.1',
    date: '2026-05-26',
    badge: 'Android 用户建议更新',
    lead: '这版主要修了烽火设备、测速页和 OPPO 系手机上几个影响体验的问题。已经在用烽火配置的朋友，建议更新。',
    sections: [
      {
        title: '烽火设备显示修好了',
        items: [
          '烽火 AMBR 显示不会再因为字段读取问题出错。',
          '烽火 PUCCH 字段不再显示，避免干扰判断。',
          '4G 下 Trans.Mode 显示正常了，接口读取逻辑也同步调整。',
        ],
      },
      {
        title: '测速页重新整理',
        items: [
          '速率监控逻辑优化，大数值和异常瞬时值不会再溢出。',
          '测速时的显示更清晰，不会让人觉得软件坏了。',
        ],
      },
      {
        title: 'OPPO 系手机体验修复',
        items: [
          'OPPO 系设备在烽火配置下的闪屏问题解决了。',
          '之前进入烽火配置会闪一下或反复重绘，这版不会了。',
        ],
      },
    ],
  },
  {
    version: 'Desktop 3.0.0',
    date: '2026-05-26',
    badge: 'macOS / Windows 首个完整桌面分发',
    lead: '3.0.0 开始，macOS 和 Windows 都有了公开安装包。桌面版不是把手机界面简单放大，是为长时间排障设计的工作台。',
    sections: [
      {
        title: '电脑端安装包齐了',
        items: [
          'macOS 有 DMG，Windows 有 EXE、MSI 和 Portable 免安装包。',
          '官网用 20MiB 分片分发桌面大包，浏览器会自动下载并合成原文件。',
          '所有公开安装包都提供 SHA-256，下载后可以自己校验。',
        ],
      },
      {
        title: '桌面上能认真看数据',
        items: [
          '连接、锁定、测速、Ping、路由测试和日志分开呈现，横向空间利用更充分。',
          'Ping 和路由测试有折线采样，适合观察一段时间内的变化。',
          '连接看板支持指标卡大小、排序、分区列数、质量样式和标签显示方式。',
        ],
      },
      {
        title: '设备逻辑跟上 Android 3.0',
        items: [
          '烽火 CA/Header/时长、中兴 CA/频段能力、鲲鹏多 speed name 聚合都同步了。',
          '显示元数据进入 shared-logic，不同平台同一字段的解释一致了。',
          '桌面本地 CPE 请求绕开系统代理，访问 192.168.* 设备时不会被代理影响。',
        ],
      },
    ],
  },
  {
    version: 'Cross-platform 3.0',
    date: '2026-05-24',
    badge: '多平台逻辑开始统一',
    lead: '这一轮把设备接口和展示规则从 Android 里拆出来，为 macOS、Windows 和 iOS 铺路。',
    sections: [
      {
        title: '共享逻辑',
        items: [
          '新增 shared-logic，统一指标显示、运营商解析、字段别名和展示设置。',
          'Android 基线升级到 3.0，桌面和 iOS 包版本同步到 3.0.0。',
        ],
      },
      {
        title: 'iOS 方向',
        items: [
          '新增 IosCpeBridge，使用 NSURLSession 和 Kotlin crypto 覆盖华为 V2、中兴、鲲鹏 NRADIO 和基础烽火 probe。',
          '测速、Ping、路由测试在 iOS 和桌面端补齐真实探测逻辑。',
        ],
      },
    ],
  },
  {
    version: 'Upstream 2.7',
    date: '2026-05-20',
    badge: '鲲鹏 / NRADIO 兼容增强',
    lead: '这版主要解决不同 NRADIO 模板把信息放在不同位置的问题，尤其是 C5800 / AK68 这类设备。',
    sections: [
      {
        title: '运行状态读取更智能',
        items: [
          '运行状态选择扩展到 cpe、cpe1、wan0、overview speed names、外置 CPE 列表和 cpestatus/cellinfo。',
          '新增外置设备字段、SIM 备注、RSSI/CQI、PUSCH、PUCCH、SRS、PRACH 和 AMBR 解析。',
        ],
      },
      {
        title: '速率显示更稳定',
        items: [
          '改进实时速率候选、计数回绕和异常值过滤。',
          '旧固件或多接口设备不会再因为字段不同而显示空白。',
        ],
      },
    ],
  },
  {
    version: 'Upstream 2.6',
    date: '2026-05-19',
    badge: '跨平台基础继续补齐',
    lead: '这一版把华为、烽火和鲲鹏逻辑同步到桌面副本，同时把 Windows 和 iOS 的工程基线铺好。',
    sections: [
      {
        title: '设备侧能力',
        items: [
          '新增鲲鹏 / NRADIO overview 解析，覆盖设备详情、Wi-Fi、SIM/网络状态、动态 SIM 卡槽、AMBR、流量和 IP/DNS。',
          '补齐 NRADIO 网络模式、锁频、锁小区、邻区扫描和解锁回退流程。',
          '增强华为 NSA 显示，4G / 5G 小区、射频、功率和链路数据分开呈现。',
        ],
      },
      {
        title: '跨平台准备',
        items: [
          '新增 Windows 打包基线和 iOS host 工程。',
          '桌面连接页按设备配置拆开，不同设备族不再共用过度压缩的通用页面。',
        ],
      },
    ],
  },
]

export const aboutInfo: AboutInfo = {
  chineseName: 'CPE加加',
  englishName: 'CPE++',
  versionName: '3.5.3',
  userGroup: '955206409',
  description:
    '面向 4G/5G CPE 的管理工具。CPE加加覆盖连接状态、射频指标、SIM/AMBR、锁频锁小区、邻区扫描、测速、Ping 与路由测试。',
  note: '感谢所有参与和帮助过我们的朋友。CPE加加能走到今天，不只是代码的事，也有测试设备、接口抓包、UI 方案、建议和很多次反馈的功劳。',
  sponsor: {
    title: '支持 CPE加加继续维护',
    description:
      '赞助会用于服务器、下载流量、测试设备和多平台适配。你可以通过爱发电主页支持 CPE加加，也可以使用微信或支付宝二维码赞助。',
    ifdianUrl: 'https://ifdian.net/a/CPEPlusPlus',
    qrs: [
      {
        label: '微信赞助',
        image: '/media/donation-wechat.png',
        alt: '微信赞助二维码',
      },
      {
        label: '支付宝赞助',
        image: '/media/donation-alipay.jpg',
        alt: '支付宝赞助二维码',
      },
    ],
  },
  makers: [
    {
      name: '叉子么',
      links: [
        { label: 'GitHub', href: 'https://github.com/chazime/' },
        { label: '酷安', href: 'https://www.coolapk.com/u/3517558' },
      ],
    },
    {
      name: '当然是小原啦',
      links: [
        { label: 'GitHub', href: 'https://github.com/yuan-666' },
        { label: '酷安', href: 'https://www.coolapk.com/u/2779987' },
      ],
    },
  ],
  thanks: [
    {
      name: '墨戥玳',
      contribution: '负责项目宣传部分。纯血鸿蒙设备可继续关注由墨戥玳独立开发的 CPE 监控面板。',
    },
    {
      name: '大湾区网络观察',
      contribution: '建议增加中兴、烽火的载波聚合显示卡片，让当前载波聚合的小区连接情况更直观。',
    },
    {
      name: '马野',
      contribution: '提供鲲鹏多设备接口 C5800+AK68 帮助；马野正在开发鲲鹏系统的一键安装脚本。',
      links: [{ label: '鲲鹏脚本', href: 'https://nradio.mayebano.shop/' }],
    },
    {
      name: '空',
      contribution: '空哥在测试时提供了设备，也给了项目很多其他方面的帮助。',
    },
    {
      name: 'AndroidLiquidGlassView',
      contribution:
        '本 app 的 UI 设计引用了 GitHub 上 AndroidLiquidGlassView 项目的方案，感谢作者的开源实现。',
      links: [{ label: 'GitHub', href: 'https://github.com/QmDeve/AndroidLiquidGlassView' }],
    },
    {
      name: '春风不语',
      contribution: '提供鲲鹏多设备测试和接口帮助，并提出了很多修改意见。',
    },
  ],
}
