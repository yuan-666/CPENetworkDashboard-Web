# CPE Network Dashboard Web

CPE 网络看板产品官网。前端使用 Vue + Vite，下载文件放在 `public/downloads`，截图放在 `public/media`，可直接构建后放到阿里云 ESA 静态站点分发。

## ESA 25MB 文件限制

ESA 静态构建产物单文件限制为 25MB。当前发布方式是：

- Android APK 小于 25MB，保留原始文件直链。
- macOS DMG、Windows EXE、Windows MSI、Windows Portable 原始包移出 `public`，不进入 `dist`。
- 大文件按 20MiB 拆到 `public/downloads/chunks/<file-id>/`，前端点击下载时逐片读取并在浏览器中合成为原文件。
- 原始大文件仅保留在本地 `release-originals/`，该目录被 `.gitignore` 忽略，不参与 ESA 发布。

## 官网内容结构

- 首屏使用应用图标和电脑端截图作为品牌识别，直接进入“先看清 CPE，再调好网络”的产品表达。
- 场景页按真实排障过程解释：先看状态、再调参数、最后验证结果。
- 电脑端展示只引用 `public/media/computer` 横向截图，手机端展示只引用 `public/media/phone` 长屏截图。
- 平台页说明 Android、macOS、Windows 的不同使用场景，避免把跨端版本写成工程日志。
- 下载页保留所有公开安装包的静态直链、下载统计和 SHA-256 复制。
- 更新页只展示用户能感知到的变化，完整仓库记录仍在本文件和 `CHANGELOG.md`。

## 当前公开下载

| 文件 | 平台 | 版本 | 大小 |
| --- | --- | --- | --- |
| `CPE-Network-Dashboard-3.1-android.apk` | Android | 3.1 | 12.6 MiB |
| `CPE-Network-Dashboard-3.0.0-macos.dmg` | macOS | 3.0.0 | 85.7 MiB |
| `CPE-Network-Dashboard-3.0.0-windows-x64.exe` | Windows x64 | 3.0.0 | 99.6 MiB |
| `CPE-Network-Dashboard-3.0.0-windows-x64.msi` | Windows x64 | 3.0.0 | 98.9 MiB |
| `CPE-Network-Dashboard-3.0.0-protected-portable-windows-x64.zip` | Windows x64 | 3.0.0 | 97.5 MiB |

SHA-256 见 `public/downloads/checksums.txt`。桌面端大文件在网页里自动分片下载并合并，用户不需要手动处理分片。

## 本地开发

```bash
npm install
npm run dev
```

构建：

```bash
npm run build
```

构建产物在 `dist/`。`public/downloads` 中只保留 APK、校验文件和不超过 25MB 的分片文件，适合直接上传到 ESA 静态资源托管。

## ESA Edge Function

单文件函数在 `edge/index.js`，`esa.jsonc` 指向该入口。

建议路由：

```text
/api/*  -> edge/index.js
/*      -> dist 静态站点
```

EdgeKV namespace：

```text
cpe_network_dashboard_web
```

公开 API：

| 路径 | 方法 | 用途 |
| --- | --- | --- |
| `/api/health` | GET | 健康检查 |
| `/api/counter?skip=1` | GET | 读取访问计数 |
| `/api/track` | POST | 写入页面访问事件 |
| `/api/download` | POST | 写入下载点击事件 |
| `/api/download?file=<id>` | GET | 统计后跳转；大文件请使用页面内分片下载 |
| `/api/downloads` | GET | 读取下载计数 |
| `/api/analytics/summary` | GET | 公开聚合统计 |

前端默认 API 前缀为 `/api`，需要改路径时设置：

```bash
VITE_API_BASE=/api npm run build
```

## 隐私口径

- 公共仓库不包含密钥、设备登录信息、私有配置或原始设备日志。
- 边缘函数只公开聚合访问和下载数据，不返回完整 IP 或原始 User-Agent。
- IP 仅用于粗粒度限流桶，不写入公开统计事件。
- 安装包作为静态文件分发，下载统计失败不会阻断用户下载。

## 内容来源

- Android 3.1 更新记录来自本次官网需求。
- 桌面 3.0.0、跨平台 3.0 记录整理自当前产品仓库的 `README.md`、`VERSION.md` 和 `RELEASE_NOTES_V3.0.0.md`。
- 官网 `CHANGELOG.md` 保留更完整的公开发布记录，产品页只保留适合用户阅读的更新摘要。
