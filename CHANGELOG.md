# CPE Network Dashboard Web Changelog

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
- 使用 CPE 网络看板应用图标作为导航、首屏品牌标志和 favicon。
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
