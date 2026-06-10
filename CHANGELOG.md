# CPE++ Web Changelog

## Release 3.5.3 (2026-06-09)

- 发布 Android、macOS arm64、Windows EXE、Windows MSI 和 Windows Portable 3.5.3 安装包。
- 桌面端、Android Gradle 元数据和共享应用元数据统一升级到 `3.5.3` / `versionCode = 353`。
- 品牌统一为 CPE加加，英文名 CPE++；发布文件名统一使用 CPEPlusPlus。
- Android、Windows 和 macOS 图标资源替换为新的 CPE++ 图标。
- 修复 ProGuard 混淆后 release / portable 更新检查异常，请求 payload 使用显式 JSON key，响应字段名保持稳定。
- 官网下载页更新到 3.5.3，Windows 默认推荐 Portable 免安装包；Android 旧版继续只保留 3.5，并显著标记为旧版本。
- 后端 `/api/updates/check` 默认数据更新到 Android / Windows / macOS 3.5.3，并继续保留 iOS “正在路上”的占位信息。
- 公共前端不再内置统计 token，完整统计页改为维护者 token 门禁；首页和导航不再展示统计页入口。
- 公共页面只展示访问总量、下载总量和各版本下载量；页面、来源、设备和地理统计只通过受保护 `/api/analytics/summary` 查看。
- 官网首次打开增加隐私统计告知，说明会统计访问页面、来源、设备/浏览器/系统、粗略地区和下载点击。
- ESA 分发继续使用 20MiB 分片下载和浏览器合并方式，不改变桌面大包低成本分发方案。

## Website 2.0.4 (2026-06-08)

- 下载统计汇总改为读取所有历史文件 ID 和旧版 `download:<id>` 计数键，发布新安装包后累计下载量不再因为版本 ID 变化看起来清零。
- 应用内更新接口返回带统计跳转的下载 URL，App 内部更新下载也会进入下载统计；分片下载只统计首片，避免一个安装包被重复计数。
- `/api/analytics/summary` 新增今日下载小时分布，统计页顶部补充累计下载，并把 24 小时图改成访问 / 下载双指标展示。
- 地图统计补充中国省市拼音到中文的本地映射，并支持配置高德 WebService Key 后按经纬度反查中文省市。
- 下载排行不再只展示当前版本文件，旧版本和未知下载 ID 也会以可读标签进入统计列表。
- 产品页手机截图进度条固定到手机壳下方留白，不再被截图底部栏或外层裁切隐藏。

## Release 3.5.2 (2026-06-08)

- 发布 Android、macOS arm64、Windows EXE、Windows MSI 和 Windows Portable 3.5.2 安装包。
- Android 更新到 `versionCode = 10` / `versionName = "3.5.2"`，修复烽火 / FiberHome 登录后连接页反复闪烁的问题。
- Android 3.5.1 已加入应用内检查更新：支持手动检查、下载进度、SHA-256 校验、系统安装器交接，以及单 APK / 分片下载两种下载模式。
- 桌面端同步烽火后台重登录修复，继续保留更新检测、已保存设备、测试页面、AMBR/QCI 和紧凑看板等近期改进。
- 官网下载页更新到 3.5.2，Windows 默认推荐 Portable 免安装包；Android 旧版只保留 3.5，并显著标记为旧版本。
- ESA 分发继续使用 20MiB 分片下载和浏览器合并方式，避免桌面大包进入单文件构建限制。
- 后端 `/api/updates/check` 默认数据更新到 Android / Windows / macOS 3.5.2，并加入 iOS “正在路上”的占位信息。

## Website 2.0.3 (2026-06-08)

- 历史版本曾新增访问统计页面，展示访问量、下载排行、24 小时分布、来源/设备拆分和城市分布；3.5.3 起完整统计已改为受保护入口。
- 统计接口补齐 Android 3.2 Beta 下载项，前端对旧版或异常 summary 响应做兜底归一化，避免统计页因为缺字段显示异常。
- ESA Edge 统计写入改为运行时限流加单键聚合：普通访问合并写入，下载点击立即写入，避免高频写 EdgeKV。
- 写接口增加同站校验、可选写入 token、请求体大小限制和读取限流；外站脚本不能直接刷统计。

## Android 3.2 Beta (2026-05-30)

> **测试版本**：此版本为 Beta 测试版，可能存在不稳定或 Bug。建议普通用户继续使用正式版 Android 3.1。

- 修复 4G 下 Trans.Mode 显示、更新接口逻辑。
- 测速界面速率监控重新适配，减少数值溢出。
- 修复 OPPO 系在烽火配置下闪屏问题。
- 烽火 Pro2 参数查看。
- 优化烽火 AMBR 显示逻辑。

## Website 2.0.2 (2026-05-28)

- 修复 ESA EdgeKV 读取异常导致下载统计写入返回 500 的问题，统计读取现在兼容旧键但不会阻断新计数写入。
- 统计接口增加单键聚合写入路径和 build 标识，避开多键计数在 ESA 上反复失效的问题，便于线上确认新函数是否生效。
- 产品页删除重复的手机端“完整状态看板”截图，并移除对应公开图片资源。
- 优化产品页短高度桌面视口下的电脑端截图尺寸，避免截图和进度条被视口裁掉。
- 电脑端暗色截图外框改为暗色底，避免第一张暗色截图被亮色圆角边框包住。
- 放大正文、产品页功能说明和截图标签字号，中文标签不再使用等宽字体，减少 Windows 上发糊和偏小的问题。
- 关于页开发者区域改成“本项目开发者：/ Project Developers”的中英文标题结构，去掉冗余说明句。

## Website 2.0.1 (2026-05-27)

- 修复产品介绍页电脑端截图圆角边缘露黑的问题，电脑截图现在通过独立屏幕裁切层展示。
- 调整全站字体栈、标题字重和背景网格强度，减少部分设备上文字和网格糊在一起的感觉。
- 关于页重新突出制作者，把“当然是小原啦、叉子么”为并列开发者的关系放到独立主卡片里。
- 设备覆盖文案收窄中兴范围：目前只写 G5 Pro / U60 Pro，不再表达成泛化的中兴全系支持。

## Website 2.0.0 (2026-05-27)

- 完成官网工程重构：从 Vue 单文件堆叠拆成 `pages`、`components`、`composables`、`utils` 和 typed content，后续改页面不用再在一个大文件里找半天。
- 引入 TypeScript、Vue Router、Tailwind CSS v4、ESLint flat config、Prettier、Vitest 和 `vue-tsc`，构建前会先做类型检查。
- 路由改为懒加载：首页、产品介绍、下载、更新日志、关于各自独立打包，打开下载页或更新日志时不需要一次性执行全部页面代码。
- 下载逻辑独立为 composable：自动识别当前设备，桌面大包按分片实时显示字节进度，下载完成后再由浏览器合成原始安装包。
- 统计逻辑统一：页面访问和下载点击都会刷新聚合数据；ESA Edge Function 改用 `cpeweb` EdgeKV，并支持可选写入 token。
- 更新页、关于页和下载页继续按面向用户的表达重写，不把官网写成开发日志；关于页保留 AppMetadata 名单，同时把制作者和致谢分开呈现。
- 增加 Vitest 覆盖格式化和平台识别逻辑，保留 ESA 25MB 单文件检查作为发布前验证项。

## Website 1.4.0 (2026-05-27)

- EdgeKV namespace 改为用户已创建的 `cpeweb`，用于访问量、下载量等聚合统计。
- 首页继续强化产品感：加入信号雷达、指标浮动条，并把固定 `192.168.8.1` 改为更通用的 `192.168.x.1`。
- 文案口吻调整为更接近 3.0 更新公告的表达，减少“说明网页功能”的感觉。
- 桌面分片下载改为显示实时字节进度、当前分片和总大小，不再只等每个分片完成后跳百分比。
- 关于页重新区分“制作者”和“致谢”：制作者使用独立深色区域，致谢使用列表时间线式呈现。
- 访问量和下载量从关于页大块区域收进页脚，并补充版权、GPL 许可和仓库链接。

## Website 1.3.0 (2026-05-27)

- 将官网从单页长滚动改为独立页面：`#/` 首页、`#/product` 产品介绍、`#/download` 下载、`#/changelog` 更新日志、`#/about` 关于。
- 首页重写为更短的产品表达，并加入截图动效、扫描线和指标滚动条，避免把功能清单堆在首屏。
- 产品介绍页重新分开电脑端与手机端展示：电脑端只使用 `public/media/computer` 横向截图，手机端只使用 `public/media/phone` 长屏截图。
- 下载页加入设备自动识别：Android 推荐 APK，macOS 推荐 DMG，Windows 推荐 EXE，同时保留 MSI 和 Portable 手动选择。
- 更新日志页独立出来，并按用户场景展开 Android 3.1、Desktop 3.0.0、Cross-platform 3.0、Upstream 2.7 / 2.6 的详细变化。
- 关于页同步应用内部 `AppMetadata`：软件名、英文名、版本、QQ群、制作者和完整致谢名单。
- 下载统计改为记录 hash 页面路径，桌面大包的边缘函数跳转改到 `/#/download`。

## Website 1.2.0 (2026-05-27)

- 重写首页、场景、平台、下载和更新文案，减少工程说明和功能罗列，改成更贴近日常 CPE 排障的表达。
- 为 ESA 25MB 单文件限制增加静态分片下载：桌面端大文件拆为 20MiB 分片，网页自动下载并合成为原始安装包。
- 原始 macOS / Windows 大包移出 `public`，构建产物不再包含超过 25MB 的单文件。
- 边缘函数保留下载统计，桌面大文件下载由前端分片流程完成。

## Website 1.1.0 (2026-05-27)

- 官网改为分页式产品介绍结构：首屏、使用场景、电脑端展示、手机端展示、平台、设备覆盖、下载、更新和隐私统计各自成段。
- 电脑端展示只引用 `public/media/computer` 横向截图，手机端展示只引用 `public/media/phone` 长屏截图，避免两类素材混放。
- 使用 CPE加加应用图标作为导航、首屏品牌标志和 favicon。
- 下载区改为一屏下载板，Android、macOS、Windows EXE、Windows MSI 和 Windows Portable 均保留直接静态下载入口与 SHA-256 复制。
- 更新记录改为面向用户的产品语言，Android 3.1 重点说明烽火、测速页和 OPPO 系闪屏修复带来的实际体验变化。

## Android 3.1 (2026-05-26)

- 修复烽火 AMBR 显示错误，屏蔽烽火 PUCCH，修复 4G 下 Trans.Mode 显示，并更新接口逻辑。
- 测速界面速率监控重新适配，减少数值溢出。
- 修复 OPPO 系设备在烽火配置下的闪屏问题。

## Desktop 3.0.0 (2026-05-26)

- macOS 和 Windows 桌面安装包进入官网分发：DMG、MSI、EXE、Windows 便携版。
- 桌面端同步 Android V3.0 设备逻辑：烽火 CA/Header/时长、中兴 CA/频段能力、鲲鹏多 speed name 聚合与 shared-logic 显示元数据。
- macOS 完成 Apple Liquid Glass 方向的桌面 UI 迭代，覆盖侧栏、工具栏、面板、按钮、设置行、指标卡和深浅色 palette。
- Windows 加入更清晰的自研玻璃 palette、字体抗锯齿、DPI 感知、Microsoft YaHei UI / Cascadia Mono 默认字体和 DIRECT3D 推荐渲染参数。
- 官网记录所有公开安装包 SHA-256，静态下载由 ESA 分发，点击统计写入 EdgeKV。

## Cross-platform 3.0 (2026-05-24)

- Android 基线升级为 `versionCode = 6` / `versionName = "3.0"`，跨平台桌面与 iOS 包版本同步为 `3.0.0`。
- 新增 `shared-logic` 模块，统一指标显示、运营商解析、字段别名和展示设置。
- iOS 新增 `IosCpeBridge`，使用 `NSURLSession` 与 Kotlin crypto 覆盖华为 V2、中兴、鲲鹏 NRADIO 和基础烽火 probe。
- 测速、Ping、路由测试在桌面和 iOS 端补齐真实探测逻辑。

## Upstream 2.7 (2026-05-20)

- 增强鲲鹏 C5800 / AK68 NRADIO 兼容。
- 运行状态选择扩展到 `cpe`、`cpe1`、`wan0`、overview speed names、外置 CPE 列表和 `cpestatus/cellinfo`。
- 新增外置设备字段、SIM 备注、RSSI/CQI、PUSCH、PUCCH、SRS、PRACH 和 AMBR 解析。
- 改进实时速率候选、计数回绕和异常值过滤。

## Upstream 2.6 (2026-05-19)

- 同步华为、烽火和鲲鹏逻辑到 macOS `desktopMain` 副本，并保留本地 CPE 直连策略。
- 新增 Windows 打包基线和 iOS host 工程，明确跨平台方向。
- 桌面连接页按配置拆分，避免不同设备族共用压缩版通用页面。
