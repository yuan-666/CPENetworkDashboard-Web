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

export const scenePages = [
  {
    kicker: '01 / 先看懂',
    title: '信号不好时，别先猜。',
    copy: '打开看板，先把 RSRP、RSRQ、SINR、CA、小区、邻区和签约速率摆在同一张桌面上。你不用在设备后台来回翻，也不用靠感觉判断是信号、频段还是小区切换出了问题。',
    points: ['当前小区与邻区放在一起看', '射频和功率指标保留质量判断', '烽火、华为、鲲鹏、中兴按设备族分开呈现'],
  },
  {
    kicker: '02 / 再动手',
    title: '锁频和锁小区，不做盲操作。',
    copy: '网络模式、Band、ARFCN、PCI、卡槽和邻区扫描都围绕“能下发，也要能回读”来设计。现场调整之后，马上知道设备有没有真的吃到配置。',
    points: ['Band / ARFCN / PCI / 小区锁定', 'NRADIO 卡槽与邻区扫描', '操作日志保留给排障复盘'],
  },
  {
    kicker: '03 / 最后验证',
    title: '测速、Ping、路由测试，走你正在用的网络。',
    copy: '测速不是摆一个漂亮数字，而是帮你确认这台电脑或手机当前经过 CPE 出口的实际状态。桌面端还保留采样折线和一键 Ping 全部，方便对比不同站点。',
    points: ['本机下载探测', '常用国内站点延迟预设', '路由测试估算 CPE 到公网边缘状态'],
  },
];

export const platformCards = [
  {
    name: 'Android',
    version: '3.1',
    title: '随身调试的主力版本',
    copy: '手机在手边，现场就能看信号、扫邻区、调模式。Android 版保留最完整的移动端入口，也是现在公开下载的最新版。',
  },
  {
    name: 'macOS',
    version: '3.0.0',
    title: '给桌面大屏看的版本',
    copy: '用 Liquid Glass 的方向重做窗口、侧栏和指标卡。适合一边看日志，一边做锁频、测速和连接状态对比。',
  },
  {
    name: 'Windows',
    version: '3.0.0',
    title: '给维护电脑准备的版本',
    copy: '同一套桌面功能，换成更清晰的 Windows 玻璃材质和字体渲染。MSI、EXE、便携包都已经放出。',
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
    label: '推荐',
    copy: '适合手机现场调试，包含最新的烽火修复和测速页稳定性调整。',
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
    label: '桌面版',
    copy: '适合 macOS 电脑查看大屏指标、做 Ping / 路由测试和桌面端配置回读。',
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
    label: '安装器',
    copy: '适合普通 Windows 用户直接安装，包含字体清晰度和 HiDPI 渲染优化。',
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
    label: '部署',
    copy: '适合更偏维护环境的安装方式，便于在 Windows 设备上做稳定安装。',
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
    label: '便携',
    copy: '适合临时调试机、U 盘携带或不方便安装软件的现场环境。',
  },
];

export const releaseNotes = [
  {
    version: 'Android 3.1',
    date: '2026.05',
    title: '烽火和 OPPO 用户，这版更稳。',
    copy: '烽火 AMBR 显示、4G 下 Trans.Mode、接口读取逻辑都重新校正；容易误导的 PUCCH 信息被收起。测速页也重新适配了速率监控，数值不再容易溢出，OPPO 系设备在烽火配置下的闪屏问题也一并处理。',
  },
  {
    version: 'Desktop 3.0.0',
    date: '2026.05',
    title: '电脑端不再只是“能跑”。',
    copy: 'macOS 和 Windows 都给出了安装包。桌面端把信号、锁频、测速、Ping、路由测试和设置项铺开，更适合长时间看状态、做对比和现场复盘。',
  },
  {
    version: 'Cross-platform 3.0',
    date: '2026.05',
    title: '同一套设备能力，开始真正跨端。',
    copy: '跨平台分支同步了 Android V3.0 的设备逻辑，桌面端补齐烽火 CA、中兴 CA/频段能力和鲲鹏多 speed name 聚合；iOS 侧也接入了原生网络桥，后续会继续做真机回归。',
  },
];

export const supportedDevices = [
  ['HUAWEI', 'H168-383 / H155-381 / H153-381'],
  ['FiberHome', 'LG6121D / LG6121F / LG6121H / LG6851F / LG6151M'],
  ['NRADIO / 鲲鹏无限', 'LuCI NRADIO CPE，兼容 cpe / cpe1 / wan0 模板'],
  ['ZTE / 中兴', '支持 UBUS Web API 的中兴 CPE'],
];
