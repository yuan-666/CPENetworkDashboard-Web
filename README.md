# CPE++ Web

CPE加加产品官网。英文名 CPE++，在不能使用符号的场景可写作 CPEPlusPlus。前端使用 Vue 3 + TypeScript + Vite，下载文件放在 `public/downloads`，截图放在 `public/media`，可直接构建后放到阿里云 ESA 静态站点分发。

## 技术结构

- Vue Router 使用 hash history，`#/`、`#/product`、`#/download`、`#/changelog`、`#/about` 分别独立加载。
- 页面拆分到 `src/pages`，页头页脚、懒加载图片、下载操作和下载进度拆到 `src/components`。
- 统计、下载分片、平台识别和格式化分别放在 `src/composables` 与 `src/utils`。
- 样式入口为 `src/styles.css`，接入 Tailwind CSS v4 Vite 插件，同时保留 `src/styles/site.css` 的产品级视觉规则。
- `npm run check` 使用 `vue-tsc` 做类型检查，`npm run lint` 使用 ESLint flat config，`npm run test` 使用 Vitest。

## ESA 25MB 文件限制

ESA 静态构建产物单文件限制为 25MB。当前发布方式是：

- Android APK 小于 25MB，保留原始文件直链。
- macOS DMG、Windows EXE、Windows MSI、Windows Portable 原始大包不直接放入 `dist`。
- 大文件按 20MiB 拆到 `public/downloads/chunks/<file-id>/`，前端点击下载时逐片读取并在浏览器中合成为原文件。
- 原始大文件仅作为 GitHub Release 附件发布；ESA 侧继续使用分片下载，保持当前省成本分发方式。

## 官网内容结构

| 页面     | 路径          | 内容                                                                                         |
| -------- | ------------- | -------------------------------------------------------------------------------------------- |
| 首页     | `#/`          | 应用图标、核心产品表达、电脑/手机界面动效和指标滚动条                                      |
| 产品介绍 | `#/product`   | 排障流程、电脑端截图、手机端截图、平台说明和设备覆盖                                       |
| 下载     | `#/download`  | 自动识别当前设备并推荐 Android APK、macOS DMG 或 Windows EXE，保留 Portable / MSI 手动选择 |
| 更新日志 | `#/changelog` | 展开 Android 3.6.5、3.5.3、3.5.2、Android 3.5 旧版、Desktop 3.0.0 等更新记录              |
| 关于     | `#/about`     | 软件名、版本、QQ群、开发者、赞助入口和完整致谢名单                                          |

## 当前公开下载

| 文件                                                               | 平台        | 版本  | 大小      |
| ------------------------------------------------------------------ | ----------- | ----- | --------- |
| `CPENetworkDashboard V3.6.5.apk`                                   | Android     | 3.6.5 | 16.0 MiB  |
| `CPEPlusPlus-v3.5-legacy-release.apk`                              | Android     | 3.5   | 13.3 MiB  |
| `CPEPlusPlus-3.5.3-macos-arm64.dmg`                                | macOS arm64 | 3.5.3 | 128.3 MiB |
| `CPEPlusPlus-3.5.3-protected-portable-windows-x64.zip`             | Windows x64 | 3.5.3 | 119.6 MiB |
| `CPEPlusPlus-3.5.3-windows-x64.exe`                                | Windows x64 | 3.5.3 | 139.8 MiB |
| `CPEPlusPlus-3.5.3-windows-x64.msi`                                | Windows x64 | 3.5.3 | 139.1 MiB |

Android 3.5 是旧版回退包，当前默认推荐 Android 3.6.5。macOS 和 Windows 仍为 3.5.3，Windows 默认推荐 EXE 安装版。

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
cpeweb
```

### ESA 后台填写清单

1. 静态站点构建变量只填前端公开变量：

```text
VITE_API_BASE=/api
```

2. EdgeKV 新建或选择 namespace：

```text
cpeweb
```

3. 在 `cpeweb` 里新增 KV key：

```text
config
```

KV value 填 JSON：

```json
{
  "CPE_STATS_TOKEN": "自己生成一个长随机字符串，用于统计写入和版本发布",
  "CPE_ANALYTICS_TOKEN": "自己生成一个长随机字符串，用于统计页登录",
  "AMAP_WEB_SERVICE_KEY": "高德 WebService Key，没有就填空字符串"
}
```

4. Edge Function 路由保持：

```text
/api/* -> edge/index.js
/*     -> dist 静态站点
```

5. `updates` 是版本数据 KV，不是必须手动填。默认版本已经内置在 `edge/index.js`；后续发版推荐调用 `POST /api/updates/publish` 写入。当前 Android 稳定版为 `3.6.5 / versionCode 12`，macOS 和 Windows 仍为 `3.5.3 / versionCode 353`。

### ESA KV 配置和维护密码

ESA 的环境变量只能在构建时传给前端，不能作为 Edge Function 的运行时配置使用。运行时 token、统计密码和高德 Key 请放到 EdgeKV，不要写进前端 `.env`，也不要打包进网页。

推荐在 `cpeweb` namespace 里新增一个 KV：

| KV key | KV value |
| --- | --- |
| `config` | 下面这段 JSON |

```json
{
  "CPE_STATS_TOKEN": "填一个长随机写入和发布 token",
  "CPE_ANALYTICS_TOKEN": "填统计页登录密码 token",
  "AMAP_WEB_SERVICE_KEY": "填高德 WebService Key，没有就留空"
}
```

也可以拆成三个单独 KV key：

| 变量名 | 用途 | 调用方式 |
| --- | --- | --- |
| `CPE_STATS_TOKEN` | 统计写入和版本发布 token。设置后，外部写入 `/api/track`、`POST /api/download`、`POST /api/updates/publish` 需要带同一个 token。 | `Authorization: Bearer <token>`，也兼容 `X-CPE-Stats-Token`、`X-Admin-Token` 或 JSON body 里的 `token`。 |
| `CPE_ANALYTICS_TOKEN` | 完整统计页密码，访问 `#/analytics` 时输入这个值。 | 前端会以 `Authorization: Bearer <token>` 请求 `/api/analytics/summary`。 |
| `AMAP_WEB_SERVICE_KEY` | 可选，高德 WebService Key，用于把中国地区访问数据规范化为中文省市名。 | 只由 Edge Function 后端读取。 |

兼容旧 KV key：`STATS_WRITE_TOKEN` 等价于 `CPE_STATS_TOKEN`，`ANALYTICS_READ_TOKEN` 等价于 `CPE_ANALYTICS_TOKEN`。如果没有单独配置 `CPE_ANALYTICS_TOKEN`，完整统计页会回退使用 `CPE_STATS_TOKEN`。Edge Function 会缓存 KV 配置 30 秒，后台修改后等一会儿即可生效，不需要重新构建前端。

前端构建只需要：

```bash
VITE_API_BASE=/api npm run build
```

不要再配置 `VITE_API_TOKEN`，也不要把 `CPE_STATS_TOKEN`、`CPE_ANALYTICS_TOKEN`、`AMAP_WEB_SERVICE_KEY` 放到前端构建环境里。

公开 API：

| 路径                      | 方法     | 用途                                      |
| ------------------------- | -------- | ----------------------------------------- |
| `/api/health`             | GET      | 健康检查                                  |
| `/api/counter?skip=1`     | GET      | 读取访问计数                              |
| `/api/track`              | POST     | 写入页面访问事件                          |
| `/api/download`           | POST     | 写入下载点击事件                          |
| `/api/download?file=<id>` | GET      | 统计后跳转；大文件请使用页面内分片下载    |
| `/api/downloads`          | GET      | 读取下载计数                              |
| `/api/updates/latest`     | GET      | 读取当前公开最新版本                      |
| `/api/updates/check`      | GET/POST | 按平台和当前版本检测是否需要更新          |
| `/api/updates/publish`    | POST     | 使用写入 token 发布云端最新版本           |
| `/api/analytics/summary`  | GET      | 受保护完整统计，需要服务端读取 token      |

更新检测默认数据包括 Android、Windows、macOS；当前 Android 为 3.6.5，Windows 和 macOS 为 3.5.3，iOS 返回“正在路上”的占位信息。

### App 更新接口对接

App 检查更新统一请求：

```http
POST /api/updates/check
Content-Type: application/json
```

请求体：

```json
{
  "platform": "android",
  "version": "3.5.1",
  "versionCode": 9,
  "channel": "stable"
}
```

字段说明：

| 字段          | 必填 | 说明                                                                 |
| ------------- | ---- | -------------------------------------------------------------------- |
| `platform`    | 是   | `android`、`windows`、`macos`、`ios`；兼容 `win`、`mac`、`darwin` 等别名 |
| `version`     | 否   | 当前安装版本名，兼容字段名 `currentVersion`                           |
| `versionCode` | 否   | 当前安装版本号，兼容字段名 `currentVersionCode`                       |
| `channel`     | 否   | 默认 `stable`；后续 Android Beta 可传 `beta`                           |

返回体结构：

```json
{
  "ok": true,
  "platform": "android",
  "channel": "stable",
  "current": {
    "version": "3.5.1",
    "versionCode": 9
  },
  "updateAvailable": true,
  "mandatory": false,
  "latest": {
    "platform": "android",
    "channel": "stable",
    "version": "3.6.5",
    "versionCode": 12,
    "title": "Android 3.6.5 Release APK",
    "notes": "Android 3.6.5 正式版：优化 UI 设计，修复烽火载波聚合显示及其他已知问题。",
    "releaseDate": "2026-08-01",
    "publishedAt": "",
    "mandatory": false,
    "minSupportedVersion": "",
    "download": {
      "fileId": "android-3.6.5",
      "platform": "android",
      "version": "3.6.5",
      "label": "Android 3.6.5 Release APK",
      "fileName": "CPENetworkDashboard V3.6.5.apk",
      "mode": "single",
      "href": "/downloads/CPENetworkDashboard%20V3.6.5.apk",
      "url": "https://cpe.yuan6.cn/downloads/CPENetworkDashboard%20V3.6.5.apk",
      "chunks": [],
      "chunkBytes": [],
      "size": "16.0 MiB",
      "checksum": "0789b5d2c39382c58715b50aaf9c4e4a40c27e3f652ed944c9a619e424626a96"
    },
    "alternatives": []
  },
  "updatedAt": "",
  "build": "2026-06-10.9"
}
```

下载字段说明：

| 字段         | 说明                                                                 |
| ------------ | -------------------------------------------------------------------- |
| `mode`       | `single` 表示直接下载 `url`；`chunked` 表示按 `chunks` 顺序下载并合并 |
| `checksum`   | 原始完整安装包的 SHA-256，单包下载或分片合并后都按这个值校验         |
| `chunks`     | 分片数组，每项包含 `index`、相对路径 `href`、绝对地址 `url`、字节数 `bytes` |
| `chunkBytes` | 兼容旧逻辑的分片大小数组                                             |

当前默认版本数据：

| 平台      | channel  | version        | versionCode | 下载模式  | 说明                                  |
| --------- | -------- | -------------- | ----------- | --------- | ------------------------------------- |
| Android   | `stable` | `3.6.5`        | `12`        | `single`  | APK 直链，和 Android 包内 versionCode 保持一致 |
| Windows   | `stable` | `3.5.3`        | `353`       | `chunked` | 默认 EXE，`alternatives` 含 Portable/MSI |
| macOS     | `stable` | `3.5.3`        | `353`       | `chunked` | arm64 DMG 分片                        |
| iOS       | `stable` | `coming-soon`  | `0`         | 无        | `download` 为 `null`                  |

也可以用 `GET /api/updates/check?platform=android&version=3.5.1&versionCode=9&channel=stable` 检查更新。`GET /api/updates/latest` 返回全平台数据，`GET /api/updates/latest?platform=windows` 只返回指定平台。`POST /api/updates/publish` 用于带 token 发布云端版本，App 端不需要调用。

App 侧建议这样用：

- Android 检查更新时，把本机 `versionName` 和实际 APK 的 `versionCode` 一起传给 `/api/updates/check`。
- Android 3.6.5 应使用 `versionName = 3.6.5`、`versionCode = 12`；Windows 和 macOS 继续使用各自的桌面构建号。
- Windows 和 macOS 继续用桌面端自己的版本号与打包号即可。
- 完整统计页 `#/analytics` 只给维护者使用，输入服务端配置的 `CPE_ANALYTICS_TOKEN` 后才能打开。

### 统计接口权限

公共前端只调用：

- `GET /api/counter?skip=1`：读取访问总量，不新增访问。
- `GET /api/downloads`：读取总下载量和各版本下载量。
- `POST /api/track`、`POST /api/download`：同站写入访问或下载点击。

完整统计只给维护者使用：

```http
GET /api/analytics/summary
Authorization: Bearer <CPE_ANALYTICS_TOKEN>
```

也兼容 `X-CPE-Stats-Token`、`X-Admin-Token` 或 `?token=`。不应把这些 token 写入前端构建环境。

前端默认 API 前缀为 `/api`，需要改路径时设置：

```bash
VITE_API_BASE=/api npm run build
```

公共官网前端不会内置统计写入或读取 token。完整统计页 `#/analytics` 需要输入服务端配置的 `CPE_ANALYTICS_TOKEN` / `ANALYTICS_READ_TOKEN`，若未单独配置则回退使用 `CPE_STATS_TOKEN` / `STATS_WRITE_TOKEN`。

## 隐私口径

- 公共仓库不包含密钥、设备登录信息、私有配置或原始设备日志。
- 页面首次打开会告知统计口径。官网会统计访问页面、来源、设备/浏览器/系统、粗略地区和安装包下载点击，用于判断版本下载量和站点运行情况。
- 公共页面只展示访问总量、下载总量和各版本下载量；页面/来源/设备/城市等完整统计需要维护者 token。
- 边缘函数不返回完整 IP 或原始 User-Agent。
- IP 仅用于粗粒度限流桶和粗略地区解析，不写入公开统计事件。
- 安装包作为静态文件分发，下载统计失败不会阻断用户下载。

## 内容来源

- Android 3.6.5 更新记录来自本次 Android 单独发布说明；macOS 和 Windows 当前仍为 3.5.3。
- 3.5.2 更新记录来自 Android 3.5.1/3.5.2 与桌面 3.5.2 发布说明。
- Android 3.5 更新记录来自官网发布需求。
- 桌面 3.0.0、跨平台 3.0 记录整理自当前产品仓库的 `README.md`、`VERSION.md` 和 `RELEASE_NOTES_V3.0.0.md`。
- 官网 `CHANGELOG.md` 保留更完整的公开发布记录，产品页只保留适合用户阅读的更新摘要。
