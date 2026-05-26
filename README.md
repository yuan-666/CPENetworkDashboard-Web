# CPE Network Dashboard Web

CPE 网络看板产品官网。前端使用 Vue + Vite，下载文件放在 `public/downloads`，截图放在 `public/media`，可直接构建后放到阿里云 ESA 静态站点分发。

## 官网内容结构

- 首屏使用应用图标和桌面截图作为品牌识别，直接进入“看清 CPE，再调好网络”的产品表达。
- 场景页按“先看懂、再动手、最后验证”拆成三段，面向普通用户解释信号、锁频和测速的价值。
- 平台页说明 Android、macOS、Windows 的不同使用场景，避免把跨端版本写成纯工程日志。
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

SHA-256 见 `public/downloads/checksums.txt`。

## 本地开发

```bash
npm install
npm run dev
```

构建：

```bash
npm run build
```

构建产物在 `dist/`。下载文件会随 Vite public 目录复制到 `dist/downloads/`，适合直接上传到 ESA 静态资源托管。

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
| `/api/download?file=<id>` | GET | 统计后 302 到静态下载文件 |
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
