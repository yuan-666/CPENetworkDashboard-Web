# CPE加加 v3.5.3

发布日期：2026-06-09

3.5.3 已同步发布 Android、macOS 和 Windows。这个版本统一 CPE加加 / CPE++ 品牌和新图标，优化更新检查，并继续同步烽火 / FiberHome 后台重登录优化。iOS 版本正在路上，敬请期待。

## 主要变化

- Android、macOS 和 Windows 均更新到 3.5.3。
- 应用品牌统一为 CPE加加，英文名 CPE++；发布文件名统一使用 CPEPlusPlus。
- Android、Windows 和 macOS 图标资源替换为新的 CPE++ 图标。
- 优化更新检查，提升版本检测和下载信息展示的稳定性。

## 设备与桌面同步

- 同步烽火 / FiberHome 后台自动重登录优化：登录成功后记录并重置重登录时间，空小区重登录独立限流。
- 后台重登录会保留当前可见连接数据；刷新异常时触发后台重登，但不会先清空仍然有效的旧数据。
- Windows 保留 EXE、MSI 和 Portable 三种下载包。
- 延续桌面 UI/UX、更新检查、已保存设备、测试页、AMBR/QCI 和紧凑看板等近期工作。

## 官网与更新接口

- 官网下载页、更新日志、README 和 Edge 更新接口已同步到 3.5.3。
- Windows 默认推荐 EXE 安装版，同时保留 Portable 和 MSI 备选。
- Android 旧版本暂时只保留 3.5，并在下载页标记为旧版回退包。
- 公共前端不再内置统计 token，完整统计页需要维护者 token 才能访问。
- 公共页面只展示访问总量、下载总量和各版本下载量。
- 首次打开官网会提示隐私统计口径。

## 发布包

| 文件 | SHA-256 |
| --- | --- |
| `CPEPlusPlus-v3.5.3.apk` | `1f2180ff03f84a64aaeb413debebe349219ab3e739cea1c267d8e375995c99e1` |
| `CPEPlusPlus-3.5.3-macos-arm64.dmg` | `c0cf7b64694f06d4dc6c45ef3c15f259aae1b442ff72f2dfd77b1cd56db165b4` |
| `CPEPlusPlus-3.5.3-protected-portable-windows-x64.zip` | `11091c7d2560000cf4167b6fc27231da3a0acb0cf6cfe7d17456de9dfcf703c5` |
| `CPEPlusPlus-3.5.3-windows-x64.exe` | `0808a5a69bf1ac5a16561955f67cc55ac87cfb3c3298b28dbe8e6ab17290addf` |
| `CPEPlusPlus-3.5.3-windows-x64.msi` | `a9d313bd7c77963ef650f7c7b40ea3ce986dbbb20cc8e7d67c36a90e47cbd1de` |
