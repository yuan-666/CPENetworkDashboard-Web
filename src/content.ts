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
  { path: '/', label: '首页', title: 'CPE 网络看板' },
  { path: '/product', label: '介绍', title: '产品介绍' },
  { path: '/download', label: '下载', title: '下载 CPE 网络看板' },
  { path: '/changelog', label: '更新日志', title: '更新日志' },
  { path: '/about', label: '关于', title: '关于 CPE 网络看板' },
]

export const heroDesktopImage = '/media/computer/29b0da59250a42a033e3cb98ba1a786f.png'

export const desktopScreens = [
  '/media/computer/29b0da59250a42a033e3cb98ba1a786f.png',
  '/media/computer/331c02244c4db828675aa6943572e2cc.png',
  '/media/computer/4132f93bab5c7b08f16dbac12d9b2d3a.png',
  '/media/computer/49d747e746370fd0623d11972c27972e.png',
  '/media/computer/6bc260e09db214eab82a0fc0c8bca98f.png',
  '/media/computer/ad0052a60b290d111c9c012149faff94.png',
  '/media/computer/bbf5fbd9716c05be2903dfddd6be5e49.png',
]

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
]

function chunkedParts(folder: string, fileName: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_, index) => `/downloads/chunks/${folder}/${fileName}.part${String(index).padStart(2, '0')}`
  )
}

const chunkBytes: Record<string, number[]> = {
  'macos-3.0.0': [20971520, 20971520, 20971520, 20971520, 5976951],
  'windows-exe-3.0.0': [20971520, 20971520, 20971520, 20971520, 20507136],
  'windows-msi-3.0.0': [20971520, 20971520, 20971520, 20971520, 19799576],
  'windows-portable-3.0.0': [20971520, 20971520, 20971520, 20971520, 18346522],
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
    title: '先确认它连到了哪里。',
    copy: '当前小区、邻区、信号质量、签约速率和连接状态放在一起。先判断是信号掉了、频段变了，还是后台字段没有说清楚。',
    points: ['当前/邻区', 'RSRP / RSRQ / SINR', 'SIM / AMBR'],
  },
  {
    label: '再动手',
    title: '要不要锁，先看依据。',
    copy: 'Band、ARFCN、PCI、网络模式和邻区扫描放在同一条思路里。改完立刻回读，知道设备有没有真的吃到配置。',
    points: ['Band 锁定', 'ARFCN / PCI', '网络偏好'],
  },
  {
    label: '最后验证',
    title: '改完，马上测这一条链路。',
    copy: '测速、Ping 和路由测试不是为了给一个好看的数字，而是确认刚才那次调整有没有意义。电脑端适合长时间看，手机端适合现场走动。',
    points: ['下载测速', 'Ping 折线', '路由测试'],
  },
]

export const platformCards: PlatformCard[] = [
  {
    name: 'Android',
    version: '3.1',
    title: '站在设备旁边，手机最顺手。',
    copy: '打开、登录、看信号、扫邻区、改锁定。弱电箱、窗边、机柜旁边，用手机比搬电脑自然得多。',
  },
  {
    name: 'macOS',
    version: '3.0.0',
    title: '坐下来排查，Mac 端看得更完整。',
    copy: '连接、锁定、测试和日志能铺开，适合边调边记，也适合把一段时间的结果放到大屏上对比。',
  },
  {
    name: 'Windows',
    version: '3.0.0',
    title: '维护电脑、临时电脑，都留了入口。',
    copy: '常规 EXE、固定环境 MSI、免安装 Portable 都准备好了。能安装就安装，不能安装也能带走。',
  },
]

export const supportedDevices: Array<[string, string]> = [
  ['HUAWEI', 'H168-383 / H155-381 / H153-381'],
  ['FiberHome', 'LG6121D / LG6121F / LG6121H / LG6851F / LG6151M'],
  ['NRADIO / 鲲鹏无限', 'LuCI NRADIO CPE，兼容 cpe / cpe1 / wan0 模板'],
  ['ZTE / 中兴', '支持 UBUS Web API 的中兴 CPE'],
]

export const downloads: Download[] = [
  {
    id: 'android-3.1',
    platform: 'Android',
    version: '3.1',
    title: 'Android APK',
    fileName: 'CPE-Network-Dashboard-3.1-android.apk',
    href: '/downloads/CPE-Network-Dashboard-3.1-android.apk',
    size: '12.6 MiB',
    checksum: '9aed997cc91f34a0b17bf79c31230ca1f459064a9f797f49d78a9df0b547b790',
    label: '现场调试优先',
    copy: '人在 CPE 旁边，直接装 Android 版。看状态、扫邻区、调锁定、做一次测速，动作最少。',
  },
  {
    id: 'macos-3.0.0',
    platform: 'macOS',
    version: '3.0.0',
    title: 'macOS DMG',
    fileName: 'CPE-Network-Dashboard-3.0.0-macos.dmg',
    chunks: chunkedParts('macos-3.0.0', 'CPE-Network-Dashboard-3.0.0-macos.dmg', 5),
    chunkBytes: chunkBytes['macos-3.0.0'],
    size: '85.7 MiB',
    checksum: '35ae5e36c5c72723e520c7240a7ff39263a51567f48936815b9973478d5de952',
    label: 'Mac 桌面版',
    copy: '适合在桌面上长时间观察，边看信号边做 Ping、测速和锁定回读。',
  },
  {
    id: 'windows-exe-3.0.0',
    platform: 'Windows',
    version: '3.0.0',
    title: 'Windows EXE',
    fileName: 'CPE-Network-Dashboard-3.0.0-windows-x64.exe',
    chunks: chunkedParts('windows-exe-3.0.0', 'CPE-Network-Dashboard-3.0.0-windows-x64.exe', 5),
    chunkBytes: chunkBytes['windows-exe-3.0.0'],
    size: '99.6 MiB',
    checksum: '0d613ea043d0f38f17d52334ad3c42fddb4beeb80877eda0aa87c6165d466803',
    label: 'Windows 常规安装',
    copy: '这台电脑以后还会维护 CPE，选 EXE 最省事。',
  },
  {
    id: 'windows-msi-3.0.0',
    platform: 'Windows',
    version: '3.0.0',
    title: 'Windows MSI',
    fileName: 'CPE-Network-Dashboard-3.0.0-windows-x64.msi',
    chunks: chunkedParts('windows-msi-3.0.0', 'CPE-Network-Dashboard-3.0.0-windows-x64.msi', 5),
    chunkBytes: chunkBytes['windows-msi-3.0.0'],
    size: '98.9 MiB',
    checksum: '9e738a7cedfe93ffdaa2c8a73a8689d31d9118ccf4c5b757664d6a4e7039f7cf',
    label: 'Windows 固定部署',
    copy: '维护机、办公电脑或更偏固定安装的环境，用 MSI 会更合适。',
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
      5
    ),
    chunkBytes: chunkBytes['windows-portable-3.0.0'],
    size: '97.5 MiB',
    checksum: 'a359d9eff066173efd7431687b804d6fa7a63a511aa477f21440f06fecb9983a',
    label: 'Windows 免安装',
    copy: '临时电脑、U 盘携带、没有安装权限的时候，用这个版本。',
  },
]

export const changelogEntries: ChangelogEntry[] = [
  {
    version: 'Android 3.1',
    date: '2026-05-26',
    badge: 'Android 用户建议更新',
    lead: '这次主要把烽火设备、测速页和 OPPO 系手机上容易影响使用的地方修稳。已经在用烽火配置的朋友，建议直接更新。',
    sections: [
      {
        title: '烽火设备显示更可靠',
        items: [
          '修复烽火 AMBR 显示错误，签约速率不会再因为字段读取问题显示得不对。',
          '屏蔽烽火 PUCCH，避免把不适合展示的字段放进用户判断里。',
          '修复 4G 下 Trans.Mode 显示，并同步调整接口读取逻辑。',
        ],
      },
      {
        title: '测速页重新适配',
        items: [
          '速率监控重新整理，减少大数值或异常瞬时值带来的溢出。',
          '测速时更关注可读性，避免一眼看过去像是软件坏了。',
        ],
      },
      {
        title: 'OPPO 系手机体验修复',
        items: [
          '处理 OPPO 系设备在烽火配置下的闪屏问题。',
          '如果之前一进入烽火配置就闪一下或反复重绘，这版会更稳。',
        ],
      },
    ],
  },
  {
    version: 'Desktop 3.0.0',
    date: '2026-05-26',
    badge: 'macOS / Windows 首个完整桌面分发',
    lead: '久等了，各位。3.0.0 开始，macOS 和 Windows 都有了公开安装包。桌面版不是把手机界面简单放大，而是为长时间排障准备的工作台。',
    sections: [
      {
        title: '电脑端安装包齐了',
        items: [
          'macOS 提供 DMG，Windows 提供 EXE、MSI 和 Portable 免安装包。',
          '官网使用 20MiB 分片分发桌面大包，浏览器会自动下载并合成原始文件。',
          '所有公开安装包都提供 SHA-256，下载后可以自己校验。',
        ],
      },
      {
        title: '桌面上能认真看数据',
        items: [
          '连接、锁定、测速、Ping、路由测试和日志分开呈现，横向空间利用更充分。',
          'Ping 和路由测试加入折线采样，适合观察一段时间内的变化。',
          '连接看板支持指标卡大小、排序、分区列数、质量样式和标签显示方式。',
        ],
      },
      {
        title: '设备逻辑跟上 Android 3.0',
        items: [
          '同步烽火 CA/Header/时长、中兴 CA/频段能力、鲲鹏多 speed name 聚合。',
          '共享显示元数据进入 shared-logic，减少不同平台同一字段解释不一致的问题。',
          '桌面本地 CPE 请求绕开系统代理，减少访问 192.168.* 设备时被代理影响的情况。',
        ],
      },
    ],
  },
  {
    version: 'Cross-platform 3.0',
    date: '2026-05-24',
    badge: '多平台逻辑开始统一',
    lead: '这一轮把设备接口和展示规则从 Android 里拆出来，为 macOS、Windows 和 iOS 继续铺路。',
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
    lead: '这版主要解决不同 NRADIO 模板把信息放在不同位置的问题，尤其是 C5800 / AK68 一类设备。',
    sections: [
      {
        title: '运行状态读取更会找',
        items: [
          '运行状态选择扩展到 cpe、cpe1、wan0、overview speed names、外置 CPE 列表和 cpestatus/cellinfo。',
          '新增外置设备字段、SIM 备注、RSSI/CQI、PUSCH、PUCCH、SRS、PRACH 和 AMBR 解析。',
        ],
      },
      {
        title: '速率显示更稳',
        items: [
          '改进实时速率候选、计数回绕和异常值过滤。',
          '避免旧固件或多接口设备因为字段不同而直接显示空白。',
        ],
      },
    ],
  },
  {
    version: 'Upstream 2.6',
    date: '2026-05-19',
    badge: '跨平台基础继续补齐',
    lead: '这一版把华为、烽火和鲲鹏逻辑继续同步到桌面副本，同时把 Windows 和 iOS 的工程基线铺好。',
    sections: [
      {
        title: '设备侧能力',
        items: [
          '新增鲲鹏 / NRADIO overview 解析，覆盖设备详情、Wi-Fi、SIM/网络状态、动态 SIM 卡槽、AMBR、流量和 IP/DNS。',
          '补齐 NRADIO 网络模式、锁频、锁小区、邻区扫描和解锁回退流程。',
          '增强华为 NSA 显示，分开呈现 4G / 5G 小区、射频、功率和链路数据。',
        ],
      },
      {
        title: '跨平台准备',
        items: [
          '新增 Windows 打包基线和 iOS host 工程。',
          '桌面连接页按设备配置拆开，避免不同设备族共用过度压缩的通用页面。',
        ],
      },
    ],
  },
]

export const aboutInfo: AboutInfo = {
  chineseName: 'CPE网络看板',
  englishName: 'CPE Network Dashboard',
  versionName: '3.0.0',
  userGroup: '955206409',
  description:
    '面向 4G/5G CPE 的管理工具。覆盖连接状态、射频指标、SIM/AMBR、锁频锁小区、邻区扫描、测速、Ping 与路由测试。',
  note: '首先还是要感谢共同参与和帮助过我们的朋友们。CPE 网络看板能走到 3.0，不只是一个人的代码，也有测试设备、接口抓包、UI 方案、建议和很多次反馈。',
  makers: [
    {
      name: '当然是小原啦',
      links: [
        { label: 'GitHub', href: 'https://github.com/yuan-666' },
        { label: '酷安', href: 'https://www.coolapk.com/u/2779987' },
      ],
    },
    {
      name: '叉子么',
      links: [
        { label: 'GitHub', href: 'https://github.com/chazime/' },
        { label: '酷安', href: 'https://www.coolapk.com/u/3517558' },
      ],
    },
  ],
  thanks: [
    {
      name: '墨戥玳',
      contribution:
        '为项目宣传部分做出贡献。纯血鸿蒙设备可继续关注由墨戥玳独立开发的 CPE 监控面板。',
    },
    {
      name: '空',
      contribution: '空哥在需要测试的时候提供了设备，也给了项目很多其他方面的帮助。',
    },
    {
      name: 'AndroidLiquidGlassView',
      contribution:
        '本 app 的 UI 设计引用了 GitHub 上 AndroidLiquidGlassView 项目的方案，非常感谢作者的开源实现。',
      links: [{ label: 'GitHub', href: 'https://github.com/QmDeve/AndroidLiquidGlassView' }],
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
      name: '春风不语',
      contribution: '提供鲲鹏多设备测试和接口帮助，并提出了很多修改意见。',
    },
  ],
}
