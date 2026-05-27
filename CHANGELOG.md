# CPE Network Dashboard Web Changelog

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
