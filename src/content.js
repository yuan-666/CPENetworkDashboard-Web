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

function chunkedParts(folder, fileName, count) {
  return Array.from(
    { length: count },
    (_, index) => `/downloads/chunks/${folder}/${fileName}.part${String(index).padStart(2, '0')}`,
  );
}

export const storyCards = [
  {
    label: '看状态',
    title: '网速突然不对，先别急着重启。',
    copy: '先看当前小区、邻区、RSRP、RSRQ、SINR 和签约速率。很多问题不是设备坏了，而是信号质量、频段或小区选择变了。',
  },
  {
    label: '调参数',
    title: '需要锁频锁小区时，别靠感觉填。',
    copy: 'Band、ARFCN、PCI、网络模式和邻区扫描放在一起。改完以后再读一次，知道设备有没有真的吃到配置。',
  },
  {
    label: '做验证',
    title: '调完以后，马上测这一条链路。',
    copy: '测速、Ping 和路由测试走你正在用的 CPE 出口。不是看一个漂亮数字，而是确认刚才的调整有没有意义。',
  },
];

export const platformCards = [
  {
    name: 'Android',
    version: '3.1',
    title: '人在设备旁边，就用手机看。',
    copy: '上门、机房、弱电箱旁边，手机打开就能看状态、扫邻区、调锁定。很多时候不用再掏电脑。',
  },
  {
    name: 'macOS',
    version: '3.0.0',
    title: '坐下来排查，就把它放在桌面上。',
    copy: '大屏能把信号、测速、Ping、锁频和日志摊开，适合边调边记，也适合反复对比结果。',
  },
  {
    name: 'Windows',
    version: '3.0.0',
    title: '维护电脑、临时电脑，都留了入口。',
    copy: 'EXE、MSI、便携包都准备了。能安装就安装，不能安装就用便携版。',
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
    label: '先装这个',
    copy: 'Android 是现场调试最顺手的版本。拿着手机站在 CPE 旁边，看状态、调锁定、测出口。',
  },
  {
    id: 'macos-3.0.0',
    platform: 'macOS',
    version: '3.0.0',
    title: 'macOS DMG',
    fileName: 'CPE-Network-Dashboard-3.0.0-macos.dmg',
    chunks: chunkedParts('macos-3.0.0', 'CPE-Network-Dashboard-3.0.0-macos.dmg', 5),
    size: '85.7 MiB',
    checksum: '35ae5e36c5c72723e520c7240a7ff39263a51567f48936815b9973478d5de952',
    label: 'Mac 上看大屏',
    copy: '适合坐下来观察一段时间，边看指标边做 Ping、测速和锁频回读。',
  },
  {
    id: 'windows-exe-3.0.0',
    platform: 'Windows',
    version: '3.0.0',
    title: 'Windows EXE',
    fileName: 'CPE-Network-Dashboard-3.0.0-windows-x64.exe',
    chunks: chunkedParts('windows-exe-3.0.0', 'CPE-Network-Dashboard-3.0.0-windows-x64.exe', 5),
    size: '99.6 MiB',
    checksum: '0d613ea043d0f38f17d52334ad3c42fddb4beeb80877eda0aa87c6165d466803',
    label: '常规安装',
    copy: '平时就在这台 Windows 电脑上维护 CPE，选 EXE 最省事。',
  },
  {
    id: 'windows-msi-3.0.0',
    platform: 'Windows',
    version: '3.0.0',
    title: 'Windows MSI',
    fileName: 'CPE-Network-Dashboard-3.0.0-windows-x64.msi',
    chunks: chunkedParts('windows-msi-3.0.0', 'CPE-Network-Dashboard-3.0.0-windows-x64.msi', 5),
    size: '98.9 MiB',
    checksum: '9e738a7cedfe93ffdaa2c8a73a8689d31d9118ccf4c5b757664d6a4e7039f7cf',
    label: '固定电脑',
    copy: '更适合维护机、办公电脑这类长期使用的环境。',
  },
  {
    id: 'windows-portable-3.0.0',
    platform: 'Windows',
    version: '3.0.0',
    title: 'Windows Portable',
    fileName: 'CPE-Network-Dashboard-3.0.0-protected-portable-windows-x64.zip',
    chunks: chunkedParts(
      'windows-portable-3.0.0',
      'CPE-Network-Dashboard-3.0.0-protected-portable-windows-x64.zip',
      5,
    ),
    size: '97.5 MiB',
    checksum: 'a359d9eff066173efd7431687b804d6fa7a63a511aa477f21440f06fecb9983a',
    label: '免安装',
    copy: '临时电脑、U 盘携带、不方便安装软件时，用这个版本。',
  },
];

export const releaseNotes = [
  {
    version: 'Android 3.1',
    date: '2026.05',
    title: '如果你用烽火，或者 OPPO 手机，这版值得更新。',
    copy: 'AMBR、4G Trans.Mode 和接口读取逻辑重新整理；测速页的速率显示也更稳，OPPO 系设备在烽火配置下的闪屏问题已经处理。',
  },
  {
    version: 'Desktop 3.0.0',
    date: '2026.05',
    title: '电脑端现在可以认真用了。',
    copy: 'macOS 和 Windows 都有安装包。需要长时间看状态、对比 Ping 和测速结果时，不必只盯着手机。',
  },
  {
    version: 'Cross-platform 3.0',
    date: '2026.05',
    title: '多平台版本开始跟上同一套设备逻辑。',
    copy: '烽火、中兴、鲲鹏等设备族的显示和读取能力继续补齐。以后换设备、换电脑，使用方式会更接近。',
  },
];

export const supportedDevices = [
  ['HUAWEI', 'H168-383 / H155-381 / H153-381'],
  ['FiberHome', 'LG6121D / LG6121F / LG6121H / LG6851F / LG6151M'],
  ['NRADIO / 鲲鹏无限', 'LuCI NRADIO CPE，兼容 cpe / cpe1 / wan0 模板'],
  ['ZTE / 中兴', '支持 UBUS Web API 的中兴 CPE'],
];
