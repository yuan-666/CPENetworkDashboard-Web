export const heroDesktopImage = '/media/computer/29b0da59250a42a033e3cb98ba1a786f.png';

export const desktopScreens = [
  '/media/computer/29b0da59250a42a033e3cb98ba1a786f.png',
  '/media/computer/331c02244c4db828675aa6943572e2cc.png',
  '/media/computer/4132f93bab5c7b08f16dbac12d9b2d3a.png',
  '/media/computer/49d747e746370fd0623d11972c27972e.png',
  '/media/computer/6bc260e09db214eab82a0fc0c8bca98f.png',
  '/media/computer/ad0052a60b290d111c9c012149faff94.png',
  '/media/computer/bbf5fbd9716c05be2903dfddd6be5e49.png',
];

export const phoneScreens = [
  '/media/phone/176d49b8c01d0904883c1d50c5d61f4f.jpg',
  '/media/phone/1ee8508406def15a2c0ab82ed88066af.jpg',
  '/media/phone/313254916b9f1917e928d3499c389ead.jpg',
  '/media/phone/3b426262ac549c51e1aff8f7c1eda93b.jpg',
  '/media/phone/402b81006b43c3f12b7a20f368972d0a.jpg',
  '/media/phone/60d457163b7068c9129ba5960fa5d480.jpg',
  '/media/phone/6ecd8cc18d11fcc995659c3b7f295556.jpg',
  '/media/phone/82b19cf05c055f7648ea013ed26eaddf.jpg',
  '/media/phone/98938e8d6fcc561907978c78bce6c43f.jpg',
  '/media/phone/9f8f20e11f2d538b67409b13b7011c92.jpg',
  '/media/phone/b5b61464b42036d72f26552afdd47168.jpg',
  '/media/phone/d597071b57ea38eae45b94581d48bf2d.jpg',
  '/media/phone/fa604e99c37426bf1b886a77af64abb1.jpg',
];

export const downloads = [
  {
    id: 'android-3.1',
    platform: 'Android',
    version: '3.1',
    title: 'Android APK',
    fileName: 'CPE-Network-Dashboard-3.1-android.apk',
    href: '/downloads/CPE-Network-Dashboard-3.1-android.apk',
    size: '12.6 MiB',
    checksum: '9aed997cc91f34a0b17bf79c31230ca1f459064a9f797f49d78a9df0b547b790',
    status: 'latest',
    notes: ['烽火 AMBR 显示修复', '测速页速率监控重适配', 'OPPO 系烽火配置闪屏修复'],
  },
  {
    id: 'macos-3.0.0',
    platform: 'macOS',
    version: '3.0.0',
    title: 'macOS DMG',
    fileName: 'CPE-Network-Dashboard-3.0.0-macos.dmg',
    href: '/downloads/CPE-Network-Dashboard-3.0.0-macos.dmg',
    size: '85.7 MiB',
    checksum: '35ae5e36c5c72723e520c7240a7ff39263a51567f48936815b9973478d5de952',
    status: 'desktop',
    notes: ['Apple Liquid Glass 桌面界面', '本地 CPE 直连策略', '已通过 hdiutil verify'],
  },
  {
    id: 'windows-exe-3.0.0',
    platform: 'Windows',
    version: '3.0.0',
    title: 'Windows EXE',
    fileName: 'CPE-Network-Dashboard-3.0.0-windows-x64.exe',
    href: '/downloads/CPE-Network-Dashboard-3.0.0-windows-x64.exe',
    size: '99.6 MiB',
    checksum: '0d613ea043d0f38f17d52334ad3c42fddb4beeb80877eda0aa87c6165d466803',
    status: 'installer',
    notes: ['x64 安装器', 'Windows 字体清晰度优化', 'DIRECT3D 推荐渲染参数'],
  },
  {
    id: 'windows-msi-3.0.0',
    platform: 'Windows',
    version: '3.0.0',
    title: 'Windows MSI',
    fileName: 'CPE-Network-Dashboard-3.0.0-windows-x64.msi',
    href: '/downloads/CPE-Network-Dashboard-3.0.0-windows-x64.msi',
    size: '98.9 MiB',
    checksum: '9e738a7cedfe93ffdaa2c8a73a8689d31d9118ccf4c5b757664d6a4e7039f7cf',
    status: 'installer',
    notes: ['x64 MSI 安装包', '稳定 upgrade UUID', '适合集中部署'],
  },
  {
    id: 'windows-portable-3.0.0',
    platform: 'Windows',
    version: '3.0.0',
    title: 'Windows Portable',
    fileName: 'CPE-Network-Dashboard-3.0.0-protected-portable-windows-x64.zip',
    href: '/downloads/CPE-Network-Dashboard-3.0.0-protected-portable-windows-x64.zip',
    size: '97.5 MiB',
    checksum: 'a359d9eff066173efd7431687b804d6fa7a63a511aa477f21440f06fecb9983a',
    status: 'portable',
    notes: ['免安装压缩包', '便于现场 U 盘携带', '适合临时调试机'],
  },
];

export const platformCards = [
  {
    name: 'Android',
    version: '3.1',
    posture: '移动端主线',
    copy: 'Material 3 与液态玻璃导航，保留最完整的设备配置入口，适合随身排障和现场巡检。',
    bullets: ['烽火 / 华为 / 鲲鹏 NRADIO / 中兴', '锁频、锁小区、邻区扫描', '测速、Ping、路由测试'],
  },
  {
    name: 'macOS',
    version: '3.0.0',
    posture: '桌面发布',
    copy: 'Compose Multiplatform 桌面壳，使用 Apple Liquid Glass 方向重建窗口、侧栏、工具栏与指标卡。',
    bullets: ['深浅色完整 palette', '桌面控制器复用设备 API', 'DMG 已完成校验'],
  },
  {
    name: 'Windows',
    version: '3.0.0',
    posture: '桌面发布',
    copy: '同一套桌面业务逻辑，切换为更清晰的 Windows 玻璃材质、字体抗锯齿与 HiDPI 适配。',
    bullets: ['MSI / EXE / Portable', 'Microsoft YaHei UI', 'DIRECT3D 渲染建议'],
  },
  {
    name: 'iOS',
    version: '3.0.0 baseline',
    posture: '技术基线',
    copy: '已接入 Compose UIKit 入口与原生网络桥，当前用于跨端逻辑验证，暂不在官网提供公开安装包。',
    bullets: ['NSURLSession 直连', 'Huawei SCRAM / ZTE / NRADIO', '真机回归继续推进'],
  },
];

export const features = [
  {
    title: '真实 CPE 接口',
    eyebrow: 'Device protocols',
    copy: '覆盖烽火 FHTOOLAPIS、华为 Webserver XML、鲲鹏 NRADIO LuCI 与中兴 UBUS。页面里的数据不是装饰图，而是围绕真实设备字段组织。',
  },
  {
    title: '可回读的控制链路',
    eyebrow: 'Lock & verify',
    copy: '网络模式、Band、ARFCN、PCI、小区锁定和卡槽操作都以“下发后回读”为设计目标，减少现场调试时的盲操作。',
  },
  {
    title: '射频指标看板',
    eyebrow: 'RF telemetry',
    copy: 'RSRP、RSRQ、SINR、RSSI、CQI、PUSCH、PUCCH、SRS、PRACH、AMBR、CA/PCC/SCC 等指标按场景拆分，适合快速判断链路质量。',
  },
  {
    title: '本机测速与路由测试',
    eyebrow: 'Field diagnostics',
    copy: '测速、Ping 和路由测试走当前设备网络路径，桌面端提供采样折线与一键 Ping 全部，方便比对 CPE 到公网边缘的状态。',
  },
  {
    title: '跨平台但不混用风格',
    eyebrow: 'Platform-native surface',
    copy: 'Apple 平台使用 Liquid Glass 方向，Windows 使用更硬朗的自研玻璃 palette，Android 继续保留移动端交互节奏。',
  },
  {
    title: '本地优先的隐私边界',
    eyebrow: 'Local-first',
    copy: '应用面向局域网 CPE 管理，不把设备登录信息上传到云端；官网统计也只公开聚合访问和下载数据。',
  },
];

export const changelog = [
  {
    version: 'Android 3.1',
    date: '2026-05-26',
    title: '烽火兼容、测速监控与 OPPO 系稳定性更新',
    type: 'latest',
    items: [
      '修复烽火 AMBR 显示错误，屏蔽烽火 PUCCH，修复 4G 下 Trans.Mode 显示，并更新接口逻辑。',
      '测速界面速率监控重新适配，减少高速采样时的数值溢出。',
      '修复 OPPO 系设备在烽火配置下的闪屏问题。',
    ],
  },
  {
    version: 'Desktop 3.0.0',
    date: '2026-05-26',
    title: 'macOS 与 Windows 桌面安装包发布',
    type: 'desktop',
    items: [
      '桌面端同步 Android V3.0 设备逻辑，补齐烽火 CA/Header/时长、中兴 CA/频段能力、鲲鹏多 speed name 聚合和共享显示元数据。',
      'macOS 使用 Apple Liquid Glass 方向完成三轮桌面 UI 迭代，窗口底层、侧栏、工具栏、指标卡、深浅色和设置控件统一校准。',
      'Windows 增加字体清晰度、DPI 感知、默认 Microsoft YaHei UI / Cascadia Mono 和 DIRECT3D 渲染建议。',
      '发布 DMG、MSI、EXE 和 Windows 便携版，官网提供 SHA-256 校验值。',
    ],
  },
  {
    version: 'Cross-platform 3.0',
    date: '2026-05-24',
    title: '跨平台设备逻辑合流',
    type: 'logic',
    items: [
      'Android 基线升级到 versionCode 6 / versionName 3.0，新增 shared-logic 模块。',
      '桌面与 iOS 版本号同步为 3.0.0，iOS build 为 300。',
      'iOS 新增 IosCpeBridge，使用 NSURLSession 与 Kotlin crypto 覆盖华为 V2、中兴、鲲鹏 NRADIO 和基础烽火 probe。',
      '测速、Ping、路由测试在桌面和 iOS 端补齐真实探测逻辑。',
    ],
  },
  {
    version: 'Upstream 2.7',
    date: '2026-05-20',
    title: '鲲鹏 C5800 / AK68 与 NRADIO 运行态增强',
    type: 'compat',
    items: [
      '兼容 cpe、cpe1、wan0、overview speed names、外置 CPE 列表和 cpestatus/cellinfo 等多组运行态候选。',
      '新增外置设备字段、SIM 备注、RSSI/CQI、PUSCH、PUCCH、SRS、PRACH 与 AMBR 解析。',
      '改进实时速率候选、计数回绕和异常值过滤。',
    ],
  },
  {
    version: 'Upstream 2.6',
    date: '2026-05-19',
    title: '设备覆盖与桌面基线扩展',
    type: 'base',
    items: [
      '同步华为、烽火和鲲鹏逻辑到 macOS desktopMain 副本，并保留本地 CPE 直连策略。',
      '新增 Windows 打包基线和 iOS host 工程，明确后续跨平台方向。',
      '桌面连接页按配置拆分，避免不同设备族共用压缩版通用页面。',
    ],
  },
];

export const supportedDevices = [
  ['HUAWEI', 'H168-383 / H155-381 / H153-381'],
  ['FiberHome', 'LG6121D / LG6121F / LG6121H / LG6851F / LG6151M'],
  ['NRADIO / 鲲鹏无限', 'LuCI NRADIO CPE，兼容 cpe / cpe1 / wan0 模板'],
  ['ZTE / 中兴', '支持 UBUS Web API 的中兴 CPE'],
];

export const productStats = [
  { label: 'Profile', value: '4', detail: '设备接口族' },
  { label: 'Android', value: '3.1', detail: '最新公开 APK' },
  { label: 'Desktop', value: '3.0.0', detail: 'macOS / Windows' },
  { label: 'UI', value: 'Liquid Glass', detail: 'Apple 平台方向' },
];
