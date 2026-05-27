export const appIcon = '/media/app-icon.png';

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

export const mobileScreens = [
  '/media/phone/313254916b9f1917e928d3499c389ead.jpg',
  '/media/phone/3b426262ac549c51e1aff8f7c1eda93b.jpg',
  '/media/phone/402b81006b43c3f12b7a20f368972d0a.jpg',
  '/media/phone/1ee8508406def15a2c0ab82ed88066af.jpg',
  '/media/phone/176d49b8c01d0904883c1d50c5d61f4f.jpg',
  '/media/phone/60d457163b7068c9129ba5960fa5d480.jpg',
  '/media/phone/6ecd8cc18d11fcc995659c3b7f295556.jpg',
  '/media/phone/82b19cf05c055f7648ea013ed26eaddf.jpg',
  '/media/phone/98938e8d6fcc561907978c78bce6c43f.jpg',
  '/media/phone/9f8f20e11f2d538b67409b13b7011c92.jpg',
  '/media/phone/b5b61464b42036d72f26552afdd47168.jpg',
  '/media/phone/d597071b57ea38eae45b94581d48bf2d.jpg',
  '/media/phone/fa604e99c37426bf1b886a77af64abb1.jpg',
];

export const storyCards = [
  {
    label: '看状态',
    title: '先确认信号和小区是不是正常。',
    copy: 'RSRP、RSRQ、SINR、当前小区、邻区和签约速率放在一起看。网速突然不对时，先知道问题更像出在信号、频段，还是小区切换。',
  },
  {
    label: '调参数',
    title: '锁频、锁小区，要能下发也要能读回。',
    copy: '看板会按设备族处理 Band、ARFCN、PCI、网络模式和邻区扫描。现场改完不用靠猜，回读结果会告诉你配置有没有真的生效。',
  },
  {
    label: '做验证',
    title: '测速和 Ping 直接走当前这条链路。',
    copy: '电脑或手机连着 CPE 时，就用它来测出口、延迟和路由路径。调完网络以后，马上验证体验有没有变好。',
  },
];

export const platformCards = [
  {
    name: 'Android',
    version: '3.1',
    title: '拿着手机，在设备旁边就能处理。',
    copy: '适合上门、机房、弱电箱旁边的快速调试。打开应用，连接设备，看状态，必要时直接调整锁定策略。',
  },
  {
    name: 'macOS',
    version: '3.0.0',
    title: '放在桌面上，适合长时间观察。',
    copy: '桌面端用更宽的布局展示信号、测速、Ping、锁频和日志，适合一边调试一边记录结果。',
  },
  {
    name: 'Windows',
    version: '3.0.0',
    title: '维护电脑也能直接使用。',
    copy: '提供 EXE、MSI 和便携包。临时电脑、常用维护机、不能安装软件的环境，都有对应入口。',
  },
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
    label: '手机现场调试',
    copy: '推荐先装这一版。适合日常看状态、锁频锁小区、测速和路由测试。',
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
    label: '桌面观察',
    copy: '适合 macOS 电脑查看大屏指标，做长时间对比和现场复盘。',
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
    label: '普通安装',
    copy: '适合大多数 Windows 用户直接安装。',
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
    label: '稳定部署',
    copy: '适合维护电脑或偏固定的 Windows 环境。',
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
    label: '免安装',
    copy: '适合临时调试机、U 盘携带或不方便安装软件的现场。',
  },
];

export const releaseNotes = [
  {
    version: 'Android 3.1',
    date: '2026.05',
    title: '烽火设备和 OPPO 手机，这次会更顺。',
    copy: '修正烽火 AMBR、4G Trans.Mode 和接口读取逻辑，收起容易误导的 PUCCH 信息；测速页也重新适配速率监控，减少数值溢出和闪屏。',
  },
  {
    version: 'Desktop 3.0.0',
    date: '2026.05',
    title: '电脑端已经可以作为日常调试入口。',
    copy: 'macOS 和 Windows 安装包都已放出。大屏上能同时看连接、锁频、测速、Ping、路由测试和日志，更适合长时间排障。',
  },
  {
    version: 'Cross-platform 3.0',
    date: '2026.05',
    title: '同一套设备能力，开始覆盖更多平台。',
    copy: '设备逻辑向跨平台版本同步，烽火、中兴、鲲鹏等设备族的显示和读取能力继续补齐。',
  },
];

export const supportedDevices = [
  ['HUAWEI', 'H168-383 / H155-381 / H153-381'],
  ['FiberHome', 'LG6121D / LG6121F / LG6121H / LG6851F / LG6151M'],
  ['NRADIO / 鲲鹏无限', 'LuCI NRADIO CPE，兼容 cpe / cpe1 / wan0 模板'],
  ['ZTE / 中兴', '支持 UBUS Web API 的中兴 CPE'],
];
