# CPE 网络看板 v3.5.2

发布日期：2026-06-08

3.5.2 已同步发布 Android、macOS 和 Windows。这个版本重点修复烽火 / FiberHome 登录后连接页反复闪烁的问题，同时把 Android 应用内检查更新和桌面端近期改进一起纳入当前公开版本。iOS 版本正在推进，预计很快就能和大家见面。

## 修复问题

- 修复烽火 / FiberHome 登录后连接页闪烁的问题：后台重登录时保留当前可见连接状态，不再在自动刷新过程中反复退回登录页。
- 烽火后台重登录失败时不再强制清空连接页状态，减少自动刷新时的页面跳动和重复闪屏。
- 桌面端同步 Android 分支的烽火后台重登录逻辑，保留旧的有效连接数据，同时在后台继续重试。

## 更新能力

- Android 新增应用内检查更新，支持手动检查、下载进度、SHA-256 校验和系统安装器交接。
- 应用更新接口支持单 APK 下载，也支持按分片索引下载、按顺序合并并校验后安装，继续沿用官网低成本分片下载方式。
- 关于页和设置页版本号改为读取构建信息，App 内显示会和实际安装包版本一致。

## 桌面端同步

- macOS 和 Windows 桌面端版本同步到 3.5.2，继续保留更新检测、已保存设备、测试页面、AMBR/QCI 和紧凑看板等近期改进。
- Windows 继续保留受保护便携版打包流程，并在官网下载页默认推荐 Portable 免安装包。
- Windows 新增固定签名辅助脚本，便于后续统一处理安装包签名。

## 发布包

| 文件 | SHA-256 |
| --- | --- |
| `CPENetworkDashboard-v3.5.2.apk` | `302ceb8f1c145b8e41eac55aa33067bcc5eb9e5b19354a9bf09cd985211fc1b6` |
| `CPE-Network-Dashboard-3.5.2-macos-arm64.dmg` | `cf03bf8ae81ef106acce2b24fb69b868b8445c456cd01468b37d62cb24086288` |
| `CPE-Network-Dashboard-3.5.2-protected-portable-windows-x64.zip` | `1587f5e4eea86718f7c1f3c6ada053a6d2c24b1608801667cd92dffb438ed549` |
| `CPE-Network-Dashboard-3.5.2-windows-x64.exe` | `51ff1548a340b643fa0c9b1bc6640d1324b1a21cdf89bf75c2827cd82c1df3e5` |
| `CPE-Network-Dashboard-3.5.2-windows-x64.msi` | `32ec9c0b3bc1de358ac8da89c902243874f0ed311a4d55234d4fd51c6d9e3362` |
