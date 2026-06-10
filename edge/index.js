/**
 * CPE++ Web — ESA Edge Function
 *
 * Public routes:
 *   /api/health
 *   /api/counter
 *   /api/track
 *   /api/download
 *   /api/downloads
 *   /api/updates/latest
 *   /api/updates/check
 *   /api/updates/publish
 *   /api/analytics/summary
 *
 * Storage:
 *   EdgeKV namespace: cpeweb
 *
 * Privacy:
 *   Public responses do not expose full IP addresses or raw User-Agent values.
 *   IPs are used only for coarse rate-limit buckets.
 */

const KV_NAMESPACE = 'cpeweb'
const LEGACY_KV_NAMESPACES = ['cpe_network_dashboard_web']
const EDGE_BUILD = '2026-06-10.8'
const ANALYTICS_KEY = 'analytics'
const UPDATES_KEY = 'updates'
const CONFIG_KEY = 'config'
const BASELINE_KEY = 'statsBaseline'
const UPDATE_STORE_VERSION = 2
const MAX_JSON_BYTES = 24 * 1024
const MAX_DAILY_EVENTS = 360
const PUBLIC_DAYS = 7
const ANALYTICS_READ_CACHE_TTL_MS = 15 * 1000
const CONFIG_CACHE_TTL_MS = 30 * 1000
const ANALYTICS_FLUSH_INTERVAL_MS = 60 * 1000
const ANALYTICS_FLUSH_EVENT_THRESHOLD = 24
const PUBLIC_DOWNLOADS_CACHE_TTL_MS = 30 * 1000
const GEO_CACHE_TTL_MS = 6 * 60 * 60 * 1000
const RATE_BUCKET_MAX_ENTRIES = 1000
const DOWNLOAD_DEDUPE_TTL_MS = 60 * 60 * 1000
const KV_INSTANCE_NAMESPACES = new WeakMap()
const BUILD_WRITE_TOKEN = readEnv('CPE_STATS_TOKEN') || readEnv('STATS_WRITE_TOKEN')
const BUILD_AMAP_WEB_SERVICE_KEY =
  readEnv('AMAP_WEB_SERVICE_KEY') ||
  readEnv('AMAP_WEB_KEY') ||
  readEnv('VITE_AMAP_WEB_KEY') ||
  readEnv('AMAP_KEY')
const BUILD_READ_TOKEN =
  readEnv('CPE_ANALYTICS_TOKEN') || readEnv('ANALYTICS_READ_TOKEN') || BUILD_WRITE_TOKEN

function runtimeState() {
  const key = '__CPE_PLUS_PLUS_EDGE_RUNTIME__'
  if (!globalThis[key]) {
    globalThis[key] = {
      analyticsStores: new Map(),
      dirtyEvents: 0,
      lastFlushAt: 0,
      mutationQueue: Promise.resolve(),
      rateBuckets: new Map(),
      recentDownloadKeys: new Map(),
      geoCache: new Map(),
      config: null,
      configLoadedAt: 0,
      statsBaseline: null,
      statsBaselineKey: '',
      statsBaselineLoadedAt: 0,
      publicDownloadsCache: null,
      publicDownloadsCacheKey: '',
      publicDownloadsCacheLoadedAt: 0,
    }
  }
  return globalThis[key]
}

const GEO_PROVIDERS = [
  {
    url: (ip) => `https://api.ip.sb/geoip/${ip}`,
    parse: (data) => ({
      country: data.country || '',
      countryCode: data.country_code || '',
      region: data.region || '',
      city: data.city || '',
      lat: data.latitude,
      lon: data.longitude,
    }),
  },
  {
    url: (ip) => `https://ipwho.is/${ip}`,
    parse: (data) => ({
      country: data.country || '',
      countryCode: data.country_code || '',
      region: data.region || '',
      city: data.city || '',
      lat: data.latitude,
      lon: data.longitude,
    }),
  },
]

const CN_CITY_ALIASES = {
  昆山: '苏州',
  常熟: '苏州',
  张家港: '苏州',
  太仓: '苏州',
  南山: '深圳',
  福田: '深圳',
  罗湖: '深圳',
  宝安: '深圳',
  龙岗: '深圳',
  龙华: '深圳',
  光明: '深圳',
  坪山: '深圳',
  大鹏: '深圳',
  盐田: '深圳',
  浦东: '上海',
  闵行: '上海',
  徐汇: '上海',
  静安: '上海',
  黄浦: '上海',
  长宁: '上海',
  虹口: '上海',
  杨浦: '上海',
  宝山: '上海',
  嘉定: '上海',
  松江: '上海',
  青浦: '上海',
  奉贤: '上海',
  金山: '上海',
  崇明: '上海',
  海淀: '北京',
  朝阳: '北京',
  丰台: '北京',
  石景山: '北京',
  通州: '北京',
  顺义: '北京',
  昌平: '北京',
  大兴: '北京',
  亦庄: '北京',
}

const COUNTRY_ALIASES = {
  cn: '中国',
  china: '中国',
  'people s republic of china': '中国',
  'people republic of china': '中国',
  中国: '中国',
  中國: '中国',
  tw: '中国',
  taiwan: '中国',
  'taiwan province of china': '中国',
  台湾: '中国',
  臺灣: '中国',
  hk: '中国',
  'hong kong': '中国',
  'hong kong sar': '中国',
  香港: '中国',
  mo: '中国',
  macau: '中国',
  macao: '中国',
  'macao sar': '中国',
  澳门: '中国',
  澳門: '中国',
  中国台湾: '中国',
  中國台灣: '中国',
  中国香港: '中国',
  中國香港: '中国',
  中国澳门: '中国',
  中國澳門: '中国',
}

const REGION_BY_COUNTRY_CODE = {
  TW: '台湾',
  HK: '香港',
  MO: '澳门',
}

const CN_CITY_NAME_ALIASES = {
  anhui: '安徽',
  fujian: '福建',
  gansu: '甘肃',
  guangdong: '广东',
  guangxi: '广西',
  guizhou: '贵州',
  hainan: '海南',
  hebei: '河北',
  heilongjiang: '黑龙江',
  henan: '河南',
  hubei: '湖北',
  hunan: '湖南',
  jiangsu: '江苏',
  jiangxi: '江西',
  jilin: '吉林',
  liaoning: '辽宁',
  'inner mongolia': '内蒙古',
  neimenggu: '内蒙古',
  ningxia: '宁夏',
  qinghai: '青海',
  shaanxi: '陕西',
  shanxi: '山西',
  shandong: '山东',
  sichuan: '四川',
  xinjiang: '新疆',
  tibet: '西藏',
  xizang: '西藏',
  yunnan: '云南',
  zhejiang: '浙江',
  beijing: '北京',
  peking: '北京',
  shanghai: '上海',
  tianjin: '天津',
  chongqing: '重庆',
  shenzhen: '深圳',
  guangzhou: '广州',
  suzhou: '苏州',
  hangzhou: '杭州',
  nanjing: '南京',
  wuhan: '武汉',
  chengdu: '成都',
  xian: '西安',
  "xi'an": '西安',
  shijiazhuang: '石家庄',
  tangshan: '唐山',
  qinhuangdao: '秦皇岛',
  handan: '邯郸',
  xingtai: '邢台',
  baoding: '保定',
  zhangjiakou: '张家口',
  chengde: '承德',
  cangzhou: '沧州',
  langfang: '廊坊',
  hengshui: '衡水',
  taiyuan: '太原',
  datong: '大同',
  yangquan: '阳泉',
  changzhi: '长治',
  jincheng: '晋城',
  shuozhou: '朔州',
  jinzhong: '晋中',
  yuncheng: '运城',
  xinzhou: '忻州',
  linfen: '临汾',
  luliang: '吕梁',
  hohhot: '呼和浩特',
  huhehaote: '呼和浩特',
  baotou: '包头',
  wuhai: '乌海',
  chifeng: '赤峰',
  tongliao: '通辽',
  ordos: '鄂尔多斯',
  eerduosi: '鄂尔多斯',
  hulunbuir: '呼伦贝尔',
  hulunbeier: '呼伦贝尔',
  bayannur: '巴彦淖尔',
  bayannaoer: '巴彦淖尔',
  ulanqab: '乌兰察布',
  wulanchabu: '乌兰察布',
  shenyang: '沈阳',
  dalian: '大连',
  anshan: '鞍山',
  fushun: '抚顺',
  benxi: '本溪',
  dandong: '丹东',
  jinzhou: '锦州',
  yingkou: '营口',
  fuxin: '阜新',
  liaoyang: '辽阳',
  panjin: '盘锦',
  tieling: '铁岭',
  chaoyang: '朝阳',
  huludao: '葫芦岛',
  changchun: '长春',
  siping: '四平',
  liaoyuan: '辽源',
  tonghua: '通化',
  baishan: '白山',
  songyuan: '松原',
  baicheng: '白城',
  yanbian: '延边',
  harbin: '哈尔滨',
  qiqihar: '齐齐哈尔',
  jixi: '鸡西',
  hegang: '鹤岗',
  shuangyashan: '双鸭山',
  daqing: '大庆',
  yichun: '伊春',
  jiamusi: '佳木斯',
  qitaihe: '七台河',
  mudanjiang: '牡丹江',
  heihe: '黑河',
  suihua: '绥化',
  wuxi: '无锡',
  xuzhou: '徐州',
  changzhou: '常州',
  nantong: '南通',
  lianyungang: '连云港',
  huaian: '淮安',
  'huai an': '淮安',
  yancheng: '盐城',
  yangzhou: '扬州',
  zhenjiang: '镇江',
  taizhou: '台州',
  suqian: '宿迁',
  ningbo: '宁波',
  wenzhou: '温州',
  jiaxing: '嘉兴',
  huzhou: '湖州',
  shaoxing: '绍兴',
  jinhua: '金华',
  quzhou: '衢州',
  zhoushan: '舟山',
  lishui: '丽水',
  hefei: '合肥',
  wuhu: '芜湖',
  bengbu: '蚌埠',
  huainan: '淮南',
  maanshan: '马鞍山',
  'ma anshan': '马鞍山',
  huaibei: '淮北',
  tongling: '铜陵',
  anqing: '安庆',
  huangshan: '黄山',
  chuzhou: '滁州',
  fuyang: '阜阳',
  luan: '六安',
  "lu'an": '六安',
  bozhou: '亳州',
  chizhou: '池州',
  xuancheng: '宣城',
  fuzhou: '福州',
  xiamen: '厦门',
  putian: '莆田',
  sanming: '三明',
  quanzhou: '泉州',
  zhangzhou: '漳州',
  nanping: '南平',
  longyan: '龙岩',
  ningde: '宁德',
  nanchang: '南昌',
  jingdezhen: '景德镇',
  pingxiang: '萍乡',
  jiujiang: '九江',
  xinyu: '新余',
  yingtan: '鹰潭',
  ganzhou: '赣州',
  jian: '吉安',
  "ji'an": '吉安',
  shangrao: '上饶',
  jinan: '济南',
  qingdao: '青岛',
  zibo: '淄博',
  zaozhuang: '枣庄',
  dongying: '东营',
  yantai: '烟台',
  weifang: '潍坊',
  jining: '济宁',
  taian: '泰安',
  "tai'an": '泰安',
  weihai: '威海',
  rizhao: '日照',
  linyi: '临沂',
  dezhou: '德州',
  liaocheng: '聊城',
  binzhou: '滨州',
  heze: '菏泽',
  zhengzhou: '郑州',
  kaifeng: '开封',
  luoyang: '洛阳',
  pingdingshan: '平顶山',
  anyang: '安阳',
  hebi: '鹤壁',
  xinxiang: '新乡',
  jiaozuo: '焦作',
  puyang: '濮阳',
  xuchang: '许昌',
  luohe: '漯河',
  sanmenxia: '三门峡',
  nanyang: '南阳',
  shangqiu: '商丘',
  xinyang: '信阳',
  zhoukou: '周口',
  zhumadian: '驻马店',
  huangshi: '黄石',
  shiyan: '十堰',
  yichang: '宜昌',
  xiangyang: '襄阳',
  ezhou: '鄂州',
  jingmen: '荆门',
  xiaogan: '孝感',
  jingzhou: '荆州',
  huanggang: '黄冈',
  xianning: '咸宁',
  suizhou: '随州',
  enshi: '恩施',
  changsha: '长沙',
  zhuzhou: '株洲',
  xiangtan: '湘潭',
  hengyang: '衡阳',
  shaoyang: '邵阳',
  yueyang: '岳阳',
  changde: '常德',
  zhangjiajie: '张家界',
  yiyang: '益阳',
  chenzhou: '郴州',
  yongzhou: '永州',
  huaihua: '怀化',
  loudi: '娄底',
  shaoguan: '韶关',
  zhuhai: '珠海',
  shantou: '汕头',
  foshan: '佛山',
  jiangmen: '江门',
  zhanjiang: '湛江',
  maoming: '茂名',
  zhaoqing: '肇庆',
  huizhou: '惠州',
  meizhou: '梅州',
  shanwei: '汕尾',
  heyuan: '河源',
  yangjiang: '阳江',
  qingyuan: '清远',
  dongguan: '东莞',
  zhongshan: '中山',
  chaozhou: '潮州',
  jieyang: '揭阳',
  yunfu: '云浮',
  nanning: '南宁',
  liuzhou: '柳州',
  guilin: '桂林',
  wuzhou: '梧州',
  beihai: '北海',
  fangchenggang: '防城港',
  qinzhou: '钦州',
  guigang: '贵港',
  yulin: '玉林',
  baise: '百色',
  bose: '百色',
  hezhou: '贺州',
  hechi: '河池',
  laibin: '来宾',
  chongzuo: '崇左',
  haikou: '海口',
  sanya: '三亚',
  sansha: '三沙',
  danzhou: '儋州',
  zigong: '自贡',
  panzhihua: '攀枝花',
  luzhou: '泸州',
  deyang: '德阳',
  mianyang: '绵阳',
  guangyuan: '广元',
  suining: '遂宁',
  neijiang: '内江',
  leshan: '乐山',
  nanchong: '南充',
  meishan: '眉山',
  yibin: '宜宾',
  guangan: '广安',
  "guang'an": '广安',
  dazhou: '达州',
  yaan: '雅安',
  "ya'an": '雅安',
  bazhong: '巴中',
  ziyang: '资阳',
  guiyang: '贵阳',
  liupanshui: '六盘水',
  zunyi: '遵义',
  anshun: '安顺',
  bijie: '毕节',
  tongren: '铜仁',
  kunming: '昆明',
  qujing: '曲靖',
  yuxi: '玉溪',
  baoshan: '保山',
  zhaotong: '昭通',
  lijiang: '丽江',
  puer: '普洱',
  "pu'er": '普洱',
  lincang: '临沧',
  lhasa: '拉萨',
  rikaze: '日喀则',
  shigatse: '日喀则',
  changdu: '昌都',
  qamdo: '昌都',
  linzhi: '林芝',
  nyingchi: '林芝',
  shannan: '山南',
  naqu: '那曲',
  tongchuan: '铜川',
  baoji: '宝鸡',
  xianyang: '咸阳',
  weinan: '渭南',
  yanan: '延安',
  "yan'an": '延安',
  hanzhong: '汉中',
  ankang: '安康',
  shangluo: '商洛',
  lanzhou: '兰州',
  jiayuguan: '嘉峪关',
  jinchang: '金昌',
  baiyin: '白银',
  tianshui: '天水',
  wuwei: '武威',
  zhangye: '张掖',
  pingliang: '平凉',
  jiuquan: '酒泉',
  qingyang: '庆阳',
  dingxi: '定西',
  longnan: '陇南',
  xining: '西宁',
  haidong: '海东',
  yinchuan: '银川',
  shizuishan: '石嘴山',
  wuzhong: '吴忠',
  guyuan: '固原',
  zhongwei: '中卫',
  urumqi: '乌鲁木齐',
  'ürümqi': '乌鲁木齐',
  wulumuqi: '乌鲁木齐',
  karamay: '克拉玛依',
  kelamayi: '克拉玛依',
  turpan: '吐鲁番',
  tulufan: '吐鲁番',
  hami: '哈密',
  xianggang: '香港',
  'hong kong': '香港',
  'hong kong sar': '香港',
  hk: '香港',
  macau: '澳门',
  macao: '澳门',
  'macao sar': '澳门',
  mo: '澳门',
  taiwan: '台湾',
  taipei: '台北',
  'taipei city': '台北',
  'new taipei': '新北',
  'new taipei city': '新北',
  taoyuan: '桃园',
  'taoyuan city': '桃园',
  taichung: '台中',
  'taichung city': '台中',
  tainan: '台南',
  'tainan city': '台南',
  kaohsiung: '高雄',
  'kaohsiung city': '高雄',
  hsinchu: '新竹',
  'hsinchu city': '新竹',
  keelung: '基隆',
  'keelung city': '基隆',
}

const CN_CITY_ALIAS_BY_REGION = {
  安徽: {
    suzhou: '宿州',
  },
  江苏: {
    suzhou: '苏州',
    taizhou: '泰州',
  },
  浙江: {
    taizhou: '台州',
  },
  江西: {
    fuzhou: '抚州',
    yichun: '宜春',
  },
  福建: {
    fuzhou: '福州',
  },
  吉林: {
    jilin: '吉林',
  },
  陕西: {
    yulin: '榆林',
  },
  广西: {
    yulin: '玉林',
  },
  黑龙江: {
    yichun: '伊春',
  },
}

function isPrivateIP(ip) {
  return (
    !ip ||
    ip === '0.0.0.0' ||
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  )
}

function normalizeTextKey(value) {
  return String(value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[().,]/g, ' ')
    .replace(/\s+/g, ' ')
}

function stripChinaAdminSuffix(value) {
  return String(value || '')
    .trim()
    .replace(/(土家族苗族|藏族羌族|哈尼族彝族|傣族景颇族|蒙古族藏族|柯尔克孜|哈萨克|蒙古|藏族|彝族|傣族|白族|苗族|回族|壮族)自治州$/, '')
    .replace(/(维吾尔|壮族|回族|特别)?自治区$/, '')
    .replace(/省$/, '')
    .replace(/市$/, '')
    .replace(/地区$/, '')
    .replace(/盟$/, '')
    .replace(/自治州$/, '')
}

function aliasChinaPlaceName(value, region = '') {
  const raw = String(value || '').trim()
  if (!raw) return ''

  const key = normalizeTextKey(raw)
  const regionName = stripChinaAdminSuffix(
    CN_CITY_NAME_ALIASES[normalizeTextKey(region)] || region
  )
  const regionAliases = CN_CITY_ALIAS_BY_REGION[regionName] || {}
  const candidates = [
    key,
    key.replace(/\s+(city|province|prefecture|region|municipality)$/i, ''),
    key.replace(/\s+shi$/i, ''),
  ].filter(Boolean)

  for (const candidate of candidates) {
    if (regionAliases[candidate]) return regionAliases[candidate]
    if (CN_CITY_NAME_ALIASES[candidate]) return CN_CITY_NAME_ALIASES[candidate]
  }

  return stripChinaAdminSuffix(raw)
}

function normalizeChinaGeoFields(input = {}) {
  const countryCode = String(input.countryCode || input.country_code || '').toUpperCase()
  let country = String(input.country || '').trim()
  let region = String(input.region || '').trim()
  let city = String(input.city || '').trim()

  const countryKey = normalizeTextKey(country)
  const regionKey = normalizeTextKey(region)
  const cityKey = normalizeTextKey(city)
  const isChinaRegionCode = ['CN', 'TW', 'HK', 'MO'].includes(countryCode)
  const isChinaRegion =
    isChinaRegionCode ||
    COUNTRY_ALIASES[countryKey] === '中国' ||
    ['taiwan', 'hk', 'hong kong', 'macau', 'macao'].includes(regionKey) ||
    ['taiwan', 'hk', 'hong kong', 'macau', 'macao'].includes(cityKey)

  if (!isChinaRegion) {
    return {
      country: country || '未知',
      countryCode,
      region,
      city: city || '未知',
    }
  }

  country = '中国'
  if (countryCode === 'TW') region = '台湾'
  if (countryCode === 'HK') region = '香港'
  if (countryCode === 'MO') region = '澳门'

  region = aliasChinaPlaceName(region)
  city = aliasChinaPlaceName(city, region)

  if (!region && REGION_BY_COUNTRY_CODE[countryCode]) region = REGION_BY_COUNTRY_CODE[countryCode]
  if (!city || city === '未知') city = region || '未知'
  if (CN_CITY_ALIASES[city]) city = CN_CITY_ALIASES[city]
  if (['北京', '上海', '天津', '重庆', '香港', '澳门'].includes(city)) region = city
  if (city === '台湾') region = '台湾'

  return {
    country,
    countryCode: countryCode === 'TW' || countryCode === 'HK' || countryCode === 'MO' ? 'CN' : countryCode,
    region,
    city,
  }
}

function stringFromGeoField(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).find(Boolean) || ''
  return String(value || '').trim()
}

function validCoordinate(lat, lon) {
  const latitude = Number(lat)
  const longitude = Number(lon)
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  )
}

async function fetchAmapReverseGeo(lat, lon, amapWebServiceKey = '') {
  if (!amapWebServiceKey || !validCoordinate(lat, lon)) return null

  const latitude = Number(lat)
  const longitude = Number(lon)
  const url = new URL('https://restapi.amap.com/v3/geocode/regeo')
  url.searchParams.set('key', amapWebServiceKey)
  url.searchParams.set('location', `${longitude.toFixed(6)},${latitude.toFixed(6)}`)
  url.searchParams.set('extensions', 'base')
  url.searchParams.set('output', 'json')

  let timeout = 0
  try {
    const controller = new AbortController()
    timeout = setTimeout(() => controller.abort(), 900)
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { 'User-Agent': 'cpe-network-dashboard/1.0' },
    })
    if (!response.ok) return null
    const data = await response.json()
    if (String(data?.status || '') !== '1') return null
    const component = data?.regeocode?.addressComponent || {}
    const province = stringFromGeoField(component.province)
    const city = stringFromGeoField(component.city) || province
    const district = stringFromGeoField(component.district)
    if (!province && !city && !district) return null

    return {
      country: stringFromGeoField(component.country) || '中国',
      countryCode: 'CN',
      region: province || city,
      city: city || province || district,
      lat: latitude,
      lon: longitude,
    }
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

async function enrichChinaGeoWithAmap(geo, amapWebServiceKey = '') {
  if (!geo || !amapWebServiceKey || !validCoordinate(geo.lat, geo.lon)) return geo
  const normalized = normalizeChinaGeoFields(geo)
  if (normalized.country !== '中国') return geo
  const amapGeo = await fetchAmapReverseGeo(geo.lat, geo.lon, amapWebServiceKey)
  return amapGeo || geo
}

async function fetchGeo(ip) {
  if (isPrivateIP(ip)) return null

  const runtime = runtimeState()
  const cached = runtime.geoCache.get(ip)
  if (cached && cached.expiresAt > Date.now()) return cached.value
  const config = await readRuntimeConfig().catch(() => normalizeConfig())

  for (const provider of GEO_PROVIDERS) {
    let timeout = 0
    try {
      const controller = new AbortController()
      timeout = setTimeout(() => controller.abort(), 900)
      const response = await fetch(provider.url(ip), {
        signal: controller.signal,
        headers: { 'User-Agent': 'cpe-plus-plus/1.0' },
      })
      if (!response.ok) continue
      const data = await response.json()
      if (!data || data.error || data.status === 'fail') continue
      const geo = await enrichChinaGeoWithAmap(provider.parse(data), config.amapWebServiceKey)
      if (geo.country || geo.city) {
        runtime.geoCache.set(ip, { value: geo, expiresAt: Date.now() + GEO_CACHE_TTL_MS })
        return geo
      }
    } catch {
      /* try next provider */
    } finally {
      clearTimeout(timeout)
    }
  }

  runtime.geoCache.set(ip, { value: null, expiresAt: Date.now() + 10 * 60 * 1000 })
  return null
}

function normalizeGeo(geo, ip) {
  if (!geo) return { ip: ipBucket(ip) }
  const { lat, lon } = geo
  const normalized = normalizeChinaGeoFields(geo)

  return {
    ip: ipBucket(ip),
    country: normalized.country,
    countryCode: normalized.countryCode,
    region: normalized.region,
    city: normalized.city,
    lat: typeof lat === 'number' ? lat : parseFloat(lat) || 0,
    lon: typeof lon === 'number' ? lon : parseFloat(lon) || 0,
  }
}

const DOWNLOADS = {
  'android-3.5.3': {
    platform: 'android',
    version: '3.5.3',
    label: 'Android 3.5.3 Release APK',
    fileName: 'CPEPlusPlus-v3.5.3.apk',
    href: '/downloads/CPEPlusPlus-v3.5.3.apk',
    size: '13.4 MiB',
    checksum: '1f2180ff03f84a64aaeb413debebe349219ab3e739cea1c267d8e375995c99e1',
    channel: 'stable',
  },
  'android-3.5': {
    platform: 'android',
    version: '3.5',
    label: 'Android 3.5 Legacy APK',
    fileName: 'CPEPlusPlus-v3.5-legacy-release.apk',
    href: '/downloads/CPEPlusPlus-v3.5-legacy-release.apk',
    size: '13.3 MiB',
    checksum: '9c562d0f7a61191c6b31a596a43d2fce44a9093d5f8329a698aed7e6a6a03700',
    channel: 'stable',
  },
  'macos-3.5.3': {
    platform: 'macos',
    version: '3.5.3',
    label: 'macOS 3.5.3 DMG',
    fileName: 'CPEPlusPlus-3.5.3-macos-arm64.dmg',
    href: '/#/download',
    chunks: chunkedParts('macos-3.5.3', 'CPEPlusPlus-3.5.3-macos-arm64.dmg', 7),
    chunkBytes: [20971520, 20971520, 20971520, 20971520, 20971520, 20971520, 8734301],
    size: '128.3 MiB',
    checksum: 'c0cf7b64694f06d4dc6c45ef3c15f259aae1b442ff72f2dfd77b1cd56db165b4',
    channel: 'stable',
  },
  'windows-exe-3.5.3': {
    platform: 'windows',
    version: '3.5.3',
    label: 'Windows 3.5.3 EXE',
    fileName: 'CPEPlusPlus-3.5.3-windows-x64.exe',
    href: '/#/download',
    chunks: chunkedParts('windows-exe-3.5.3', 'CPEPlusPlus-3.5.3-windows-x64.exe', 7),
    chunkBytes: [20971520, 20971520, 20971520, 20971520, 20971520, 20971520, 20737264],
    size: '139.8 MiB',
    checksum: '0808a5a69bf1ac5a16561955f67cc55ac87cfb3c3298b28dbe8e6ab17290addf',
    channel: 'stable',
  },
  'windows-msi-3.5.3': {
    platform: 'windows',
    version: '3.5.3',
    label: 'Windows 3.5.3 MSI',
    fileName: 'CPEPlusPlus-3.5.3-windows-x64.msi',
    href: '/#/download',
    chunks: chunkedParts('windows-msi-3.5.3', 'CPEPlusPlus-3.5.3-windows-x64.msi', 7),
    chunkBytes: [20971520, 20971520, 20971520, 20971520, 20971520, 20971520, 19996672],
    size: '139.1 MiB',
    checksum: 'a9d313bd7c77963ef650f7c7b40ea3ce986dbbb20cc8e7d67c36a90e47cbd1de',
    channel: 'stable',
  },
  'windows-portable-3.5.3': {
    platform: 'windows',
    version: '3.5.3',
    label: 'Windows 3.5.3 Portable',
    fileName: 'CPEPlusPlus-3.5.3-protected-portable-windows-x64.zip',
    href: '/#/download',
    chunks: chunkedParts(
      'windows-portable-3.5.3',
      'CPEPlusPlus-3.5.3-protected-portable-windows-x64.zip',
      6
    ),
    chunkBytes: [20971520, 20971520, 20971520, 20971520, 20971520, 20534614],
    size: '119.6 MiB',
    checksum: '11091c7d2560000cf4167b6fc27231da3a0acb0cf6cfe7d17456de9dfcf703c5',
    channel: 'stable',
  },
}

const LEGACY_DOWNLOADS = {
  'legacy-downloads-total': {
    platform: 'legacy',
    version: 'history',
    label: '历史下载总量',
    href: '/#/download',
    channel: 'stable',
  },
  'android-3.5.2': {
    platform: 'android',
    version: '3.5.2',
    label: 'Android 3.5.2 APK',
    href: '/#/download',
    channel: 'stable',
  },
  'android-3.5.1': {
    platform: 'android',
    version: '3.5.1',
    label: 'Android 3.5.1 APK',
    href: '/#/download',
    channel: 'stable',
  },
  'android-3.2-beta': {
    platform: 'android',
    version: '3.2 Beta',
    label: 'Android 3.2 Beta APK',
    href: '/#/download',
    channel: 'beta',
  },
  'android-3.1': {
    platform: 'android',
    version: '3.1',
    label: 'Android 3.1 APK',
    href: '/#/download',
    channel: 'stable',
  },
  'android-3.0': {
    platform: 'android',
    version: '3.0',
    label: 'Android 3.0 APK',
    href: '/#/download',
    channel: 'stable',
  },
  'macos-3.5.2': {
    platform: 'macos',
    version: '3.5.2',
    label: 'macOS 3.5.2 DMG',
    href: '/#/download',
    channel: 'stable',
  },
  'windows-exe-3.5.2': {
    platform: 'windows',
    version: '3.5.2',
    label: 'Windows 3.5.2 EXE',
    href: '/#/download',
    channel: 'stable',
  },
  'windows-msi-3.5.2': {
    platform: 'windows',
    version: '3.5.2',
    label: 'Windows 3.5.2 MSI',
    href: '/#/download',
    channel: 'stable',
  },
  'windows-portable-3.5.2': {
    platform: 'windows',
    version: '3.5.2',
    label: 'Windows 3.5.2 Portable',
    href: '/#/download',
    channel: 'stable',
  },
  'macos-3.0.0': {
    platform: 'macos',
    version: '3.0.0',
    label: 'macOS 3.0.0 DMG',
    href: '/#/download',
    channel: 'stable',
  },
  'windows-exe-3.0.0': {
    platform: 'windows',
    version: '3.0.0',
    label: 'Windows 3.0.0 EXE',
    href: '/#/download',
    channel: 'stable',
  },
  'windows-msi-3.0.0': {
    platform: 'windows',
    version: '3.0.0',
    label: 'Windows 3.0.0 MSI',
    href: '/#/download',
    channel: 'stable',
  },
  'windows-portable-3.0.0': {
    platform: 'windows',
    version: '3.0.0',
    label: 'Windows 3.0.0 Portable',
    href: '/#/download',
    channel: 'stable',
  },
  'desktop-macos-3.0.0': {
    platform: 'macos',
    version: '3.0.0',
    label: 'macOS 3.0.0 DMG',
    href: '/#/download',
    channel: 'stable',
  },
  'desktop-windows-exe-3.0.0': {
    platform: 'windows',
    version: '3.0.0',
    label: 'Windows 3.0.0 EXE',
    href: '/#/download',
    channel: 'stable',
  },
  'desktop-windows-msi-3.0.0': {
    platform: 'windows',
    version: '3.0.0',
    label: 'Windows 3.0.0 MSI',
    href: '/#/download',
    channel: 'stable',
  },
  'desktop-windows-portable-3.0.0': {
    platform: 'windows',
    version: '3.0.0',
    label: 'Windows 3.0.0 Portable',
    href: '/#/download',
    channel: 'stable',
  },
}

const DOWNLOAD_META = {
  ...LEGACY_DOWNLOADS,
  ...DOWNLOADS,
}

function chunkedParts(folder, fileName, count) {
  return Array.from(
    { length: count },
    (_, index) => `/downloads/chunks/${folder}/${fileName}.part${String(index).padStart(2, '0')}`
  )
}

const UPDATE_PLATFORM_ALIASES = {
  android: 'android',
  apk: 'android',
  windows: 'windows',
  win: 'windows',
  win32: 'windows',
  mac: 'macos',
  macos: 'macos',
  darwin: 'macos',
  ios: 'ios',
  iphone: 'ios',
  ipad: 'ios',
}

const DEFAULT_UPDATE_CHANNEL = 'stable'
const ANDROID_STABLE_LATEST_VERSION = '3.5.3'
const ANDROID_STABLE_LATEST_VERSION_CODE = 10

const DEFAULT_RELEASES = {
  android: {
    stable: releaseFromDownload('android-3.5.3', {
      versionCode: ANDROID_STABLE_LATEST_VERSION_CODE,
      releaseDate: '2026-06-09',
      notes: '3.5.3 正式版：统一 CPE加加 / CPE++ 品牌和新图标，修复混淆后 release / portable 更新检查异常，并同步烽火后台重登录优化。',
    }),
  },
  windows: {
    stable: releaseFromDownload('windows-portable-3.5.3', {
      versionCode: 353,
      releaseDate: '2026-06-09',
      notes: '3.5.3 Windows 桌面版：统一 CPE加加 / CPE++ 品牌和新图标，修复更新检查字段混淆问题，默认推荐 Portable 免安装包，EXE 和 MSI 作为备选。',
      alternatives: ['windows-exe-3.5.3', 'windows-msi-3.5.3'].map((id) =>
        releaseDownloadPayload(id)
      ),
    }),
  },
  macos: {
    stable: releaseFromDownload('macos-3.5.3', {
      versionCode: 353,
      releaseDate: '2026-06-09',
      notes: '3.5.3 macOS 桌面版：统一 CPE加加 / CPE++ 品牌和新图标，修复更新检查字段混淆问题，并同步烽火后台重登录优化。',
    }),
  },
  ios: {
    stable: {
      platform: 'ios',
      channel: 'stable',
      version: 'coming-soon',
      versionCode: 0,
      title: 'iOS 版本正在路上',
      notes: 'iOS 版本正在推进，预计很快就能和大家见面。',
      releaseDate: '',
      publishedAt: '',
      mandatory: false,
      minSupportedVersion: '',
      download: null,
      alternatives: [],
    },
  },
}

function normalizeUpdatePlatform(value) {
  const key = String(value || '')
    .trim()
    .toLowerCase()
  return UPDATE_PLATFORM_ALIASES[key] || ''
}

function normalizeUpdateChannel(value) {
  const key =
    String(value || DEFAULT_UPDATE_CHANNEL)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '') || DEFAULT_UPDATE_CHANNEL
  return key.slice(0, 32)
}

function splitVersion(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/^v/, '')
    .split(/[^0-9a-z]+/)
    .filter(Boolean)
}

function compareVersions(a, b) {
  const left = splitVersion(a)
  const right = splitVersion(b)
  const length = Math.max(left.length, right.length)
  for (let i = 0; i < length; i += 1) {
    const l = left[i] || '0'
    const r = right[i] || '0'
    const ln = /^\d+$/.test(l) ? Number(l) : NaN
    const rn = /^\d+$/.test(r) ? Number(r) : NaN
    if (Number.isFinite(ln) && Number.isFinite(rn)) {
      if (ln !== rn) return ln > rn ? 1 : -1
      continue
    }
    if (l !== r) return l > r ? 1 : -1
  }
  return 0
}

function normalizeUpdateRelease(release) {
  if (
    release &&
    release.platform === 'android' &&
    release.channel === 'stable' &&
    compareVersions(release.version, ANDROID_STABLE_LATEST_VERSION) === 0
  ) {
    return {
      ...release,
      version: ANDROID_STABLE_LATEST_VERSION,
      versionCode: ANDROID_STABLE_LATEST_VERSION_CODE,
    }
  }
  return release
}

function releaseDownloadPayload(fileId) {
  const item = DOWNLOADS[fileId]
  if (!item) return null
  return {
    fileId,
    platform: item.platform || '',
    version: item.version || '',
    label: item.label || '',
    fileName: item.fileName || '',
    mode: item.chunks?.length ? 'chunked' : 'single',
    href: item.href || '',
    chunks: Array.isArray(item.chunks) ? item.chunks : [],
    chunkBytes: Array.isArray(item.chunkBytes) ? item.chunkBytes : [],
    size: item.size || '',
    checksum: item.checksum || '',
  }
}

function releaseFromDownload(fileId, extra = {}) {
  const item = DOWNLOADS[fileId] || {}
  return {
    platform: item.platform || '',
    channel: extra.channel || item.channel || DEFAULT_UPDATE_CHANNEL,
    version: extra.version || item.version || '',
    versionCode: Number(extra.versionCode || 0) || 0,
    title: extra.title || item.label || '',
    notes: extra.notes || '',
    releaseDate: extra.releaseDate || '',
    publishedAt: extra.publishedAt || '',
    mandatory: Boolean(extra.mandatory),
    minSupportedVersion: extra.minSupportedVersion || '',
    download: releaseDownloadPayload(fileId),
    alternatives: Array.isArray(extra.alternatives) ? extra.alternatives.filter(Boolean) : [],
  }
}

function absoluteUrl(request, href) {
  if (!href) return ''
  try {
    return new URL(href, request.url).toString()
  } catch {
    return href
  }
}

function trackedDownloadUrl(request, fileId, options = {}) {
  if (!fileId) return ''
  const url = new URL('/api/download', request.url)
  url.searchParams.set('file', fileId)
  url.searchParams.set('source', options.source || 'app-update')
  if (Number.isInteger(options.part)) url.searchParams.set('part', String(options.part))
  return url.toString()
}

function trackedPrimaryDownloadUrl(request, download) {
  if (!download?.fileId) return ''
  return Array.isArray(download.chunks) && download.chunks.length
    ? trackedDownloadUrl(request, download.fileId, { part: 0 })
    : trackedDownloadUrl(request, download.fileId)
}

function withAbsoluteDownloadUrls(download, request) {
  if (!download) return null
  const chunks = Array.isArray(download.chunks)
    ? download.chunks.map((href, index) => ({
        index,
        href,
        url:
          index === 0
            ? trackedDownloadUrl(request, download.fileId, { part: index })
            : absoluteUrl(request, href),
        directUrl: absoluteUrl(request, href),
        tracked: index === 0,
        bytes: Number(download.chunkBytes?.[index] || 0) || 0,
      }))
    : []
  return {
    ...download,
    url: trackedPrimaryDownloadUrl(request, download),
    directUrl: absoluteUrl(request, download.href),
    chunks,
  }
}

function serializeRelease(release, request) {
  if (!release) return null
  return normalizeUpdateRelease({
    platform: release.platform || '',
    channel: release.channel || DEFAULT_UPDATE_CHANNEL,
    version: release.version || release.versionName || '',
    versionCode: Number(release.versionCode || 0) || 0,
    title: release.title || '',
    notes: release.notes || '',
    releaseDate: release.releaseDate || '',
    publishedAt: release.publishedAt || '',
    mandatory: Boolean(release.mandatory),
    minSupportedVersion: release.minSupportedVersion || '',
    download: withAbsoluteDownloadUrls(release.download, request),
    alternatives: Array.isArray(release.alternatives)
      ? release.alternatives.map((item) => withAbsoluteDownloadUrls(item, request)).filter(Boolean)
      : [],
  })
}

function emptyUpdateStore() {
  return {
    version: UPDATE_STORE_VERSION,
    updatedAt: '',
    releases: JSON.parse(JSON.stringify(DEFAULT_RELEASES)),
  }
}

async function readUpdateStore(kv) {
  const defaults = emptyUpdateStore()
  const str = await kvGetText(kv, UPDATES_KEY)
  if (!str) return defaults
  try {
    const parsed = JSON.parse(str)
    if (Number(parsed?.version || 0) < UPDATE_STORE_VERSION) return defaults
    const releases = { ...defaults.releases }
    for (const [platform, channels] of Object.entries(parsed?.releases || {})) {
      const normalizedPlatform = normalizeUpdatePlatform(platform)
      if (!normalizedPlatform || !channels || typeof channels !== 'object') continue
      releases[normalizedPlatform] = { ...(releases[normalizedPlatform] || {}) }
      for (const [channel, release] of Object.entries(channels || {})) {
        const normalizedChannel = normalizeUpdateChannel(channel)
        if (!release || typeof release !== 'object') continue
        releases[normalizedPlatform][normalizedChannel] = normalizeUpdateRelease({
          ...release,
          platform: release.platform || normalizedPlatform,
          channel: release.channel || normalizedChannel,
          version: release.version || release.versionName || '',
        })
      }
    }
    return {
      version: UPDATE_STORE_VERSION,
      updatedAt: parsed?.updatedAt || '',
      releases,
    }
  } catch {
    return defaults
  }
}

async function writeUpdateStore(kv, store) {
  store.version = UPDATE_STORE_VERSION
  store.updatedAt = new Date().toISOString()
  await kvPutText(kv, UPDATES_KEY, JSON.stringify(store))
}

function normalizePublishedRelease(body) {
  const platform = normalizeUpdatePlatform(body.platform)
  const channel = normalizeUpdateChannel(body.channel)
  if (!platform) return { error: 'Unknown platform' }

  const fileId = String(body.fileId || body.downloadId || body.file || '').trim()
  const knownDownload = fileId ? releaseDownloadPayload(fileId) : null
  const customDownload =
    body.download && typeof body.download === 'object'
      ? {
          fileId: String(body.download.fileId || fileId || '').trim(),
          platform,
          version: String(body.download.version || body.version || '').trim(),
          label: String(body.download.label || body.title || '').trim(),
          fileName: String(body.download.fileName || '').trim(),
          mode: Array.isArray(body.download.chunks) && body.download.chunks.length ? 'chunked' : 'single',
          href: String(body.download.href || '').trim(),
          chunks: Array.isArray(body.download.chunks) ? body.download.chunks.map(String) : [],
          chunkBytes: Array.isArray(body.download.chunkBytes)
            ? body.download.chunkBytes.map((value) => Number(value) || 0)
            : [],
          size: String(body.download.size || '').trim(),
          checksum: String(body.download.checksum || '').trim(),
        }
      : null
  const download = customDownload || knownDownload
  const version = String(body.version || body.versionName || download?.version || '').trim()
  if (!version) return { error: 'Missing version' }

  const alternatives = Array.isArray(body.alternatives)
    ? body.alternatives
        .map((item) => {
          if (typeof item === 'string') return releaseDownloadPayload(item)
          if (item && typeof item === 'object') {
            const altId = String(item.fileId || item.downloadId || '').trim()
            return releaseDownloadPayload(altId) || item
          }
          return null
        })
        .filter(Boolean)
    : []

  return {
    release: normalizeUpdateRelease({
      platform,
      channel,
      version,
      versionCode: Number(body.versionCode || 0) || 0,
      title: String(body.title || download?.label || `${platform} ${version}`).trim(),
      notes: body.notes || '',
      releaseDate: String(body.releaseDate || '').trim(),
      publishedAt: new Date().toISOString(),
      mandatory: Boolean(body.mandatory || body.force),
      minSupportedVersion: String(body.minSupportedVersion || body.minimumVersion || '').trim(),
      download,
      alternatives,
    }),
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token, X-CPE-Stats-Token',
    'Access-Control-Max-Age': '86400',
  }
}

function readEnv(name) {
  try {
    const value = globalThis?.[name]
    return value ? String(value).trim() : ''
  } catch {
    return ''
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...corsHeaders(),
    },
  })
}

function edgeKv(namespace = KV_NAMESPACE) {
  const kv = new EdgeKV({ namespace })
  KV_INSTANCE_NAMESPACES.set(kv, namespace)
  return kv
}

function legacyEdgeKvs() {
  return LEGACY_KV_NAMESPACES.map((namespace) => edgeKv(namespace))
}

function kvNamespace(kv) {
  return KV_INSTANCE_NAMESPACES.get(kv) || KV_NAMESPACE
}

function getTodayKey() {
  const now = new Date()
  const offset = now.getTimezoneOffset() + 480
  const local = new Date(now.getTime() + offset * 60000)
  return local.toISOString().slice(0, 10)
}

function recentDateKeys(days = PUBLIC_DAYS) {
  const safeDays = Math.min(Math.max(Number(days) || PUBLIC_DAYS, 1), 31)
  const dates = []
  for (let i = 0; i < safeDays; i += 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const offset = d.getTimezoneOffset() + 480
    const local = new Date(d.getTime() + offset * 60000)
    dates.push(local.toISOString().slice(0, 10))
  }
  return dates
}

function normalizeIP(value) {
  if (!value) return ''
  let ip = String(value).trim().replace(/^"|"$/g, '')
  if (!ip || ip.toLowerCase() === 'unknown') return ''
  if (ip.startsWith('[')) {
    const end = ip.indexOf(']')
    if (end > 0) ip = ip.slice(1, end)
  } else if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(ip)) {
    ip = ip.replace(/:\d+$/, '')
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) return ip
  if (/^[0-9a-f:.]+$/i.test(ip) && ip.includes(':')) return ip
  return ''
}

function readHeaderIPs(request, header) {
  const value = request.headers.get(header)
  if (!value) return []
  if (header === 'forwarded') {
    return String(value)
      .split(',')
      .map((part) => normalizeIP(part.match(/(?:^|;)\s*for="?([^";,]+)"?/i)?.[1]))
      .filter(Boolean)
  }
  return String(value).split(',').map(normalizeIP).filter(Boolean)
}

function getClientIP(request) {
  const headers = [
    'ali-real-client-ip',
    'ali-cdn-real-ip',
    'cf-connecting-ip',
    'x-real-ip',
    'x-client-ip',
    'x-forwarded-for',
    'forwarded',
  ]
  for (const header of headers) {
    const [ip] = readHeaderIPs(request, header)
    if (ip) return ip
  }
  return '0.0.0.0'
}

function ipBucket(ip) {
  if (!ip || ip === '0.0.0.0') return 'unknown'
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) return `${ip.split('.').slice(0, 3).join('.')}.0`
  if (ip.includes(':')) return `${ip.toLowerCase().split(':').slice(0, 3).join(':')}::`
  return 'unknown'
}

function safeKey(value) {
  return (
    String(value || 'unknown')
      .replace(/[^a-z0-9_-]/gi, '_')
      .slice(0, 160) || 'unknown'
  )
}

function kvKey(...parts) {
  return parts.map((part) => safeKey(part)).join('__')
}

function legacyKey(...parts) {
  return parts.map((part) => String(part || 'unknown')).join(':')
}

async function kvGetText(kv, key) {
  try {
    const value = await kv.get(key, { type: 'text' })
    if (!value || typeof value === 'string') return value || ''
    if (typeof value.text === 'function') return value.text()
    return String(value || '')
  } catch {
    try {
      const value = await kv.get(key)
      if (!value || typeof value === 'string') return value || ''
      if (typeof value.text === 'function') return value.text()
      return ''
    } catch {
      return ''
    }
  }
}

async function kvPutText(kv, key, value) {
  await kv.put(key, String(value))
}

function normalizeConfig(raw = {}) {
  const writeToken =
    raw.CPE_STATS_TOKEN ||
    raw.STATS_WRITE_TOKEN ||
    raw.statsToken ||
    raw.writeToken ||
    BUILD_WRITE_TOKEN
  const readToken =
    raw.CPE_ANALYTICS_TOKEN ||
    raw.ANALYTICS_READ_TOKEN ||
    raw.analyticsToken ||
    raw.readToken ||
    BUILD_READ_TOKEN ||
    writeToken
  const amapKey =
    raw.AMAP_WEB_SERVICE_KEY ||
    raw.AMAP_WEB_KEY ||
    raw.VITE_AMAP_WEB_KEY ||
    raw.AMAP_KEY ||
    raw.amapKey ||
    BUILD_AMAP_WEB_SERVICE_KEY

  return {
    writeToken: String(writeToken || '').trim(),
    readToken: String(readToken || '').trim(),
    amapWebServiceKey: String(amapKey || '').trim(),
  }
}

async function readRuntimeConfig(kv = edgeKv()) {
  const runtime = runtimeState()
  const cacheAge = Date.now() - runtime.configLoadedAt
  if (runtime.config && cacheAge < CONFIG_CACHE_TTL_MS) return runtime.config

  const raw = {}
  try {
    const configText = await kvGetText(kv, CONFIG_KEY)
    if (configText) Object.assign(raw, JSON.parse(configText))
  } catch {
    /* keep per-key fallback */
  }

  const keys = [
    'CPE_STATS_TOKEN',
    'STATS_WRITE_TOKEN',
    'CPE_ANALYTICS_TOKEN',
    'ANALYTICS_READ_TOKEN',
    'AMAP_WEB_SERVICE_KEY',
    'AMAP_WEB_KEY',
    'VITE_AMAP_WEB_KEY',
    'AMAP_KEY',
  ]
  await Promise.all(
    keys.map(async (key) => {
      if (raw[key]) return
      const value = await kvGetText(kv, key)
      if (value) raw[key] = value
    })
  )

  runtime.config = normalizeConfig(raw)
  runtime.configLoadedAt = Date.now()
  return runtime.config
}

function trimRateBuckets(buckets) {
  if (buckets.size <= RATE_BUCKET_MAX_ENTRIES) return
  const now = Date.now()
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now || buckets.size > RATE_BUCKET_MAX_ENTRIES) buckets.delete(key)
  }
}

async function consumeRate(key, limit, windowSeconds) {
  try {
    const runtime = runtimeState()
    const now = Date.now()
    const rateKey = `${safeKey(key)}:${windowSeconds}`
    const current = runtime.rateBuckets.get(rateKey)
    const bucket =
      current && current.resetAt > now ? current : { count: 0, resetAt: now + windowSeconds * 1000 }
    if (bucket.count >= limit) return false
    bucket.count += 1
    runtime.rateBuckets.set(rateKey, bucket)
    trimRateBuckets(runtime.rateBuckets)
    return true
  } catch {
    return true
  }
}

function normalizePage(page = '/') {
  let value = String(page || '/').slice(0, 180)
  if (value.startsWith('#/')) value = value.slice(1)
  if (!value.startsWith('/')) value = `/${value}`
  return value
}

function normalizeReferrer(value) {
  const raw = String(value || '')
    .slice(0, 260)
    .trim()
  if (!raw) return 'direct'
  try {
    return new URL(raw).hostname.slice(0, 120) || 'direct'
  } catch {
    return raw === 'direct' ? 'direct' : raw.replace(/[^\w:./-]/g, '').slice(0, 120) || 'direct'
  }
}

function parseUserAgent(ua = '') {
  const raw = String(ua).slice(0, 260)
  if (!raw) return { device: '未知设备', browser: '', os: '' }
  if (/bot|spider|crawler|slurp|bingpreview/i.test(raw))
    return { device: '爬虫', browser: 'Bot', os: '' }

  let os = ''
  if (/Android/i.test(raw)) os = 'Android'
  else if (/iPhone|iPad|iPod/i.test(raw)) os = 'iOS'
  else if (/Windows NT/i.test(raw)) os = 'Windows'
  else if (/Macintosh|Mac OS X/i.test(raw)) os = 'macOS'
  else if (/Linux|X11/i.test(raw)) os = 'Linux'

  let browser = ''
  if (/Edg\//.test(raw)) browser = 'Edge'
  else if (/OPR\//.test(raw)) browser = 'Opera'
  else if (/Firefox\//.test(raw)) browser = 'Firefox'
  else if (/Chrome\//.test(raw) || /CriOS\//.test(raw)) browser = 'Chrome'
  else if (/Safari\//.test(raw)) browser = 'Safari'

  const form = /Mobile|Android|iPhone|iPad|iPod/i.test(raw) ? '移动端' : '桌面'
  return {
    device: [os, browser || form].filter(Boolean).join(' · ') || '未知设备',
    browser,
    os,
  }
}

function sameSiteRequest(request, options = {}) {
  const allowNoOrigin = Boolean(options.allowNoOrigin)
  const origin = request.headers.get('Origin')
  const referer = request.headers.get('Referer')
  const fetchSite = String(request.headers.get('Sec-Fetch-Site') || '').toLowerCase()
  if (['same-origin', 'same-site'].includes(fetchSite)) return true
  if (fetchSite && !['none', 'same-origin', 'same-site'].includes(fetchSite)) return false

  const targetHost = new URL(request.url).hostname.toLowerCase()
  const localHosts = new Set(['localhost', '127.0.0.1', '::1'])
  const isLocalTarget = localHosts.has(targetHost)
  const isAllowed = (value) => {
    if (!value) return false
    try {
      const host = new URL(value).hostname.toLowerCase()
      return host === targetHost || (isLocalTarget && localHosts.has(host))
    } catch {
      return false
    }
  }

  if (!origin && !referer) return allowNoOrigin
  return isAllowed(origin) || isAllowed(referer)
}

async function verifyWriteToken(request, body = {}, config = null) {
  const runtimeConfig = config || (await readRuntimeConfig())
  const writeToken = runtimeConfig.writeToken
  if (!writeToken) return true
  const auth = request.headers.get('Authorization') || ''
  const headerToken = request.headers.get('X-CPE-Stats-Token') || ''
  const adminToken = request.headers.get('X-Admin-Token') || ''
  const bodyToken = body && typeof body === 'object' ? String(body.token || '') : ''
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : ''
  return [headerToken, adminToken, bodyToken, bearer].some((token) => token && token === writeToken)
}

async function hasConfiguredWriteToken(request, body = {}, config = null) {
  const runtimeConfig = config || (await readRuntimeConfig())
  return Boolean(runtimeConfig.writeToken) && (await verifyWriteToken(request, body, runtimeConfig))
}

function isUpdateDownloadRequest(request) {
  if (request.method !== 'GET') return false
  const url = new URL(request.url)
  return ['app-update', 'update-check', 'updates'].includes(
    String(url.searchParams.get('source') || '').toLowerCase()
  )
}

async function guardWriteRequest(request, body = {}) {
  const sameSite = sameSiteRequest(request)
  if (sameSite) return null
  const hasToken = await hasConfiguredWriteToken(request, body)
  if (!sameSite && !hasToken) return json({ error: 'Access denied' }, 403)
  return null
}

async function verifyReadToken(request, config = null) {
  const runtimeConfig = config || (await readRuntimeConfig())
  const readToken = runtimeConfig.readToken
  if (!readToken) return false
  const url = new URL(request.url)
  const auth = request.headers.get('Authorization') || ''
  const headerToken = request.headers.get('X-CPE-Stats-Token') || ''
  const adminToken = request.headers.get('X-Admin-Token') || ''
  const queryToken = url.searchParams.get('token') || ''
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : ''
  return [headerToken, adminToken, queryToken, bearer].some((token) => token && token === readToken)
}

async function guardAnalyticsRead(request) {
  const config = await readRuntimeConfig()
  if (!config.readToken) return json({ ok: false, error: 'Analytics token is not configured' }, 403)
  if (!(await verifyReadToken(request, config))) return json({ ok: false, error: 'Access denied' }, 403)
  return null
}

async function readJsonLimited(request) {
  const len = Number(request.headers.get('content-length') || '0')
  if (len > MAX_JSON_BYTES) throw new Error('Request body too large')
  return request.json()
}

async function incrementCounter(kv, baseKey, todayKey) {
  const current = await readCounter(kv, baseKey, todayKey)
  const base = safeKey(baseKey)
  const [totalStr, storedDate, todayStr] = await Promise.all([
    Promise.resolve(String(current.total || 0)),
    Promise.resolve(todayKey),
    Promise.resolve(String(current.today || 0)),
  ])
  const total = parseInt(totalStr || '0', 10) + 1
  const today = storedDate === todayKey ? parseInt(todayStr || '0', 10) + 1 : 1
  await Promise.all([
    kvPutText(kv, kvKey(base, 'total'), total),
    kvPutText(kv, kvKey(base, 'today_date'), todayKey),
    kvPutText(kv, kvKey(base, 'today_count'), today),
  ])
  return { total, today }
}

async function readCounterTotalOnly(kv, baseKey) {
  const base = safeKey(baseKey)
  const totalStr = await kvGetText(kv, kvKey(base, 'total'))
  if (totalStr) return parseInt(totalStr, 10) || 0
  return parseInt((await kvGetText(kv, legacyKey(baseKey, 'total'))) || '0', 10) || 0
}

async function readCounterTodayOnly(kv, baseKey, todayKey) {
  const base = safeKey(baseKey)
  const [storedDate, todayStr] = await Promise.all([
    kvGetText(kv, kvKey(base, 'today_date')),
    kvGetText(kv, kvKey(base, 'today_count')),
  ])
  if (storedDate || todayStr) {
    return storedDate === todayKey ? parseInt(todayStr || '0', 10) || 0 : 0
  }
  const [legacyDate, legacyToday] = await Promise.all([
    kvGetText(kv, legacyKey(baseKey, 'today_date')),
    kvGetText(kv, legacyKey(baseKey, 'today_count')),
  ])
  return legacyDate === todayKey ? parseInt(legacyToday || '0', 10) || 0 : 0
}

async function readCounter(kv, baseKey, todayKey) {
  const [total, today] = await Promise.all([
    readCounterTotalOnly(kv, baseKey),
    readCounterTodayOnly(kv, baseKey, todayKey),
  ])
  return {
    total,
    today,
  }
}

async function readCounterAcrossKvs(kvs, baseKey, todayKey) {
  const counters = await Promise.all(kvs.map((kv) => safeReadCounter(kv, baseKey, todayKey)))
  return counters.reduce(
    (best, counter) => ({
      total: Math.max(best.total, counter.total),
      today: Math.max(best.today, counter.today),
    }),
    { total: 0, today: 0 }
  )
}

async function readCounterTotalAcrossKvs(kvs, baseKey) {
  let total = 0
  for (const kv of kvs) {
    total += await readCounterTotalOnly(kv, baseKey).catch(() => 0)
  }
  return total
}

async function readCounterTodayAcrossKvs(kvs, baseKey, todayKey) {
  let today = 0
  for (const kv of kvs) {
    today += await readCounterTodayOnly(kv, baseKey, todayKey).catch(() => 0)
  }
  return today
}

async function readCounterSumAcrossKvs(kvs, baseKey, todayKey) {
  const [total, today] = await Promise.all([
    readCounterTotalAcrossKvs(kvs, baseKey),
    readCounterTodayAcrossKvs(kvs, baseKey, todayKey),
  ])
  return { total, today }
}

async function appendDailyEvent(kv, event) {
  const date = getTodayKey()
  const key = kvKey('events', date)
  const fallbackKey = legacyKey('events', date)
  let str = ''

  try {
    str = (await kvGetText(kv, key)) || ''
    if (!str) str = (await kvGetText(kv, fallbackKey)) || ''
  } catch {
    str = ''
  }

  let events = []
  try {
    const parsed = str ? JSON.parse(str) : []
    events = Array.isArray(parsed) ? parsed : []
  } catch {
    events = []
  }

  try {
    events.push(event)
    if (events.length > MAX_DAILY_EVENTS) events = events.slice(events.length - MAX_DAILY_EVENTS)
    await kvPutText(kv, key, JSON.stringify(events))
    return true
  } catch {
    return false
  }
}

async function readRecentEvents(kv) {
  const events = []
  for (const date of recentDateKeys()) {
    try {
      const str =
        (await kvGetText(kv, kvKey('events', date))) ||
        (await kvGetText(kv, legacyKey('events', date)))
      if (!str) continue
      const parsed = JSON.parse(str)
      if (Array.isArray(parsed)) events.push(...parsed)
    } catch {
      /* ignore unavailable or corrupt day */
    }
  }
  return events.sort((a, b) => String(b.time || '').localeCompare(String(a.time || '')))
}

async function safeReadCounter(kv, baseKey, todayKey) {
  try {
    return await readCounter(kv, baseKey, todayKey)
  } catch {
    return { total: 0, today: 0 }
  }
}

function numberOrZero(value) {
  const next = Number(value)
  return Number.isFinite(next) && next > 0 ? next : 0
}

function topBreakdown(items, keyFn, limit = 8) {
  const map = new Map()
  for (const item of items) {
    const key = keyFn(item) || 'Unknown'
    map.set(key, (map.get(key) || 0) + 1)
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}

function emptySummary() {
  return {
    visits: { total: 0, today: 0 },
    downloadsTotal: 0,
    downloadsByFile: {},
    pages: [],
    referrers: [],
    devices: [],
    recent: [],
    hourly: buildHourlyBars([]),
    downloadHourly: buildHourlyBars([]),
  }
}

function emptyAnalyticsStore() {
  return {
    version: 2,
    updatedAt: '',
    counters: {
      visits: { total: 0, today: 0, todayKey: '' },
      downloads: {},
    },
    events: [],
    geo: { countries: {}, cities: {} },
    dailyVisits: [],
  }
}

function normalizeStoredCounter(counter = {}, todayKey) {
  return {
    total: parseInt(counter.total || '0', 10) || 0,
    today: counter.todayKey === todayKey ? parseInt(counter.today || '0', 10) || 0 : 0,
    todayKey,
  }
}

function humanizeDownloadId(id) {
  return String(id || 'unknown')
    .replace(/^download[:_-]?/i, '')
    .split(/[-_:]+/)
    .filter(Boolean)
    .map((part) => {
      const upper = part.toUpperCase()
      if (['APK', 'DMG', 'EXE', 'MSI', 'ZIP'].includes(upper)) return upper
      if (upper === 'MACOS') return 'macOS'
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(' ')
}

function downloadMetaForId(id) {
  const item = DOWNLOAD_META[id]
  if (item) return item
  const key = String(id || '').toLowerCase()
  const platform = key.includes('android')
    ? 'android'
    : key.includes('mac') || key.includes('dmg')
      ? 'macos'
      : key.includes('win') || key.includes('exe') || key.includes('msi')
        ? 'windows'
        : ''
  const version = key.match(/(?:v)?(\d+(?:\.\d+){1,2}(?:[-_]?(?:beta|alpha|rc)\d*)?)/)?.[1] || ''
  return {
    platform,
    version,
    label: humanizeDownloadId(id),
    href: '/#/download',
    channel: key.includes('beta') ? 'beta' : 'stable',
  }
}

function knownDownloadIds(extraIds = []) {
  return Array.from(new Set([...Object.keys(DOWNLOAD_META), ...extraIds].filter(Boolean)))
}

function legacyDownloadIdsForPublicStats(extraIds = []) {
  return Array.from(new Set([...Object.keys(DOWNLOAD_META), ...extraIds].filter(Boolean)))
}

function serializeDownloadCounter(id, counter) {
  const item = downloadMetaForId(id)
  return {
    total: counter.total,
    today: counter.today,
    label: item.label || humanizeDownloadId(id),
    href: item.href || '/#/download',
    platform: item.platform || '',
    version: item.version || '',
    channel: item.channel || '',
  }
}

function mergeDownloadSummaries(primary, fallback) {
  const downloadsByFile = { ...(primary.downloadsByFile || {}) }
  for (const [id, stats] of Object.entries(fallback.downloadsByFile || {})) {
    const current = downloadsByFile[id]
    if (!current || Number(stats.total || 0) > Number(current.total || 0)) {
      downloadsByFile[id] = stats
    } else if (Number(stats.today || 0) > Number(current.today || 0)) {
      downloadsByFile[id] = { ...current, today: stats.today }
    }
  }
  return {
    downloadsByFile,
    downloadsByVersion: buildDownloadsByVersion(downloadsByFile, true),
    downloadsTotal: Object.values(downloadsByFile).reduce(
      (sum, item) => sum + (Number(item.total) || 0),
      0
    ),
  }
}

function combineDownloadSummaries(...summaries) {
  const downloadsByFile = {}
  for (const summary of summaries) {
    for (const [id, stats] of Object.entries(summary?.downloadsByFile || {})) {
      const current = downloadsByFile[id]
      downloadsByFile[id] = {
        ...serializeDownloadCounter(id, { total: 0, today: 0 }),
        ...current,
        ...stats,
        total: (Number(current?.total) || 0) + (Number(stats.total) || 0),
        today: (Number(current?.today) || 0) + (Number(stats.today) || 0),
      }
    }
  }
  return {
    downloadsByFile,
    downloadsByVersion: buildDownloadsByVersion(downloadsByFile, true),
    downloadsTotal: Object.values(downloadsByFile).reduce(
      (sum, item) => sum + (Number(item.total) || 0),
      0
    ),
  }
}

function combineBreakdowns(...groups) {
  const map = new Map()
  for (const group of groups) {
    for (const item of group || []) {
      const name = item?.name || 'Unknown'
      map.set(name, (map.get(name) || 0) + (Number(item?.count) || 0))
    }
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }))
}

function combineGeoSummaries(...summaries) {
  const countries = new Map()
  const cityCountries = new Map()
  const cities = new Map()
  for (const summary of summaries) {
    for (const item of summary?.geo?.countries || []) {
      const normalized = normalizeChinaGeoFields({ country: item.name })
      countries.set(
        normalized.country,
        (countries.get(normalized.country) || 0) + (Number(item.count) || 0)
      )
    }
    for (const item of summary?.geo?.cities || []) {
      const normalized = normalizeChinaGeoFields(item)
      const key = `${normalized.country}|${normalized.region}|${normalized.city}`
      const current = cities.get(key) || {
        country: normalized.country,
        countryCode: normalized.countryCode,
        city: normalized.city,
        region: normalized.region,
        lat: item.lat || 0,
        lon: item.lon || 0,
        count: 0,
      }
      current.count += Number(item.count) || 0
      if (!current.lat && item.lat) current.lat = item.lat
      if (!current.lon && item.lon) current.lon = item.lon
      cities.set(key, current)
      cityCountries.set(
        normalized.country,
        (cityCountries.get(normalized.country) || 0) + (Number(item.count) || 0)
      )
    }
  }
  for (const [name, count] of cityCountries.entries()) {
    if (!countries.get(name)) countries.set(name, count)
  }
  return {
    countries: Array.from(countries.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    cities: Array.from(cities.values()).sort((a, b) => b.count - a.count),
  }
}

function combineHourlySummaries(...hourlyItems) {
  const bars = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }))
  let currentHour = 0
  for (const hourly of hourlyItems) {
    if (!hourly?.bars) continue
    currentHour = Number(hourly.currentHour) || currentHour
    for (const bar of hourly.bars) {
      const hour = Number(bar.hour)
      if (hour >= 0 && hour < 24) bars[hour].count += Number(bar.count) || 0
    }
  }
  const total = bars.reduce((sum, item) => sum + item.count, 0)
  const max = Math.max(1, ...bars.map((item) => item.count))
  return { bars, total, max, currentHour }
}

function combineAnalyticsSummaries(...summaries) {
  const source = summaries.filter(Boolean)
  const downloads = combineDownloadSummaries(...source)
  const recent = source
    .flatMap((summary) => summary.recent || [])
    .sort((a, b) => String(b.time || '').localeCompare(String(a.time || '')))
    .slice(0, 18)
  return {
    visits: {
      total: source.reduce((sum, summary) => sum + (Number(summary.visits?.total) || 0), 0),
      today: source.reduce((sum, summary) => sum + (Number(summary.visits?.today) || 0), 0),
    },
    ...downloads,
    pages: combineBreakdowns(...source.map((summary) => summary.pages)),
    referrers: combineBreakdowns(...source.map((summary) => summary.referrers)),
    devices: combineBreakdowns(...source.map((summary) => summary.devices)),
    recent,
    geo: combineGeoSummaries(...source),
    hourly: combineHourlySummaries(...source.map((summary) => summary.hourly)),
    downloadHourly: combineHourlySummaries(...source.map((summary) => summary.downloadHourly)),
  }
}

function normalizeDownloadStats(id, stats = {}) {
  const meta = downloadMetaForId(id)
  return {
    total: numberOrZero(stats.total),
    today: numberOrZero(stats.today),
    label: String(stats.label || meta.label || humanizeDownloadId(id)).trim(),
    href: String(stats.href || meta.href || '/#/download').trim(),
    platform: String(stats.platform || meta.platform || '').trim(),
    version: String(stats.version || meta.version || '').trim(),
    channel: String(stats.channel || meta.channel || '').trim(),
  }
}

function normalizeBaseline(raw = {}) {
  const visitsRaw = raw.visits && typeof raw.visits === 'object' ? raw.visits : raw
  const downloadsByFile = {}
  const sourceDownloads =
    raw.downloadsByFile && typeof raw.downloadsByFile === 'object'
      ? raw.downloadsByFile
      : raw.downloads && typeof raw.downloads === 'object'
        ? raw.downloads
        : {}

  for (const [id, value] of Object.entries(sourceDownloads)) {
    if (!id) continue
    const stats =
      value && typeof value === 'object'
        ? value
        : {
            total: value,
            today: 0,
          }
    const normalized = normalizeDownloadStats(id, stats)
    if (normalized.total > 0 || normalized.today > 0) downloadsByFile[id] = normalized
  }

  const fileTotal = Object.values(downloadsByFile).reduce(
    (sum, item) => sum + (Number(item.total) || 0),
    0
  )
  const explicitDownloadsTotal = numberOrZero(raw.downloadsTotal)
  if (explicitDownloadsTotal > fileTotal) {
    downloadsByFile['legacy-downloads-total'] = normalizeDownloadStats('legacy-downloads-total', {
      total: explicitDownloadsTotal - fileTotal,
      today: numberOrZero(raw.downloadsToday),
      label: '历史下载总量',
      platform: 'legacy',
      version: 'history',
    })
  }

  return {
    visits: {
      total: numberOrZero(visitsRaw?.total ?? raw.visitsTotal ?? raw.total),
      today: numberOrZero(visitsRaw?.today ?? raw.visitsToday ?? raw.today),
    },
    downloadsByFile,
    downloadsByVersion: buildDownloadsByVersion(downloadsByFile, true),
    downloadsTotal: Math.max(numberOrZero(raw.downloadsTotal), fileTotal),
    updatedAt: String(raw.updatedAt || '').trim(),
    note: String(raw.note || '').slice(0, 160),
  }
}

async function readStatsBaseline(kv = edgeKv(), todayKey = getTodayKey()) {
  const runtime = runtimeState()
  const cacheKey = `${kvNamespace(kv)}:${todayKey}`
  if (
    runtime.statsBaseline &&
    runtime.statsBaselineKey === cacheKey &&
    Date.now() - runtime.statsBaselineLoadedAt < CONFIG_CACHE_TTL_MS
  ) {
    return runtime.statsBaseline
  }

  let parsed = {}
  try {
    const text = await kvGetText(kv, BASELINE_KEY)
    if (text) parsed = JSON.parse(text)
  } catch {
    parsed = {}
  }

  runtime.statsBaseline = normalizeBaseline(parsed)
  runtime.statsBaselineKey = cacheKey
  runtime.statsBaselineLoadedAt = Date.now()
  return runtime.statsBaseline
}

function mergeBaselineIntoSummary(summary, baseline) {
  if (!baseline || (baseline.visits.total <= 0 && baseline.downloadsTotal <= 0)) return summary
  const downloads = combineDownloadSummaries(summary, baseline)
  return {
    ...summary,
    visits: {
      total: (Number(summary?.visits?.total) || 0) + baseline.visits.total,
      today: (Number(summary?.visits?.today) || 0) + baseline.visits.today,
    },
    ...downloads,
  }
}

function baselineFromSummary(summary) {
  return normalizeBaseline({
    visits: summary?.visits || {},
    downloadsByFile: summary?.downloadsByFile || {},
  })
}

function addBaselines(primary, incoming) {
  const downloads = combineDownloadSummaries(primary, incoming)
  return normalizeBaseline({
    visits: {
      total: (Number(primary?.visits?.total) || 0) + (Number(incoming?.visits?.total) || 0),
      today: (Number(primary?.visits?.today) || 0) + (Number(incoming?.visits?.today) || 0),
    },
    downloadsByFile: downloads.downloadsByFile,
    downloadsTotal: downloads.downloadsTotal,
    updatedAt: new Date().toISOString(),
    note: incoming?.note || primary?.note || '',
  })
}

async function readAnalyticsStore(kv) {
  const runtime = runtimeState()
  const namespace = kvNamespace(kv)
  const cached = runtime.analyticsStores.get(namespace)
  const cacheAge = cached ? Date.now() - cached.loadedAt : Infinity
  if (
    cached?.store &&
    (runtime.dirtyEvents > 0 || cacheAge < ANALYTICS_READ_CACHE_TTL_MS)
  ) {
    return cached.store
  }

  const str = await kvGetText(kv, ANALYTICS_KEY)
  if (!str) {
    const store = emptyAnalyticsStore()
    runtime.analyticsStores.set(namespace, { store, loadedAt: Date.now() })
    return store
  }

  try {
    const parsed = JSON.parse(str)
    const store = {
      ...emptyAnalyticsStore(),
      ...parsed,
      counters: {
        visits: parsed?.counters?.visits || { total: 0, today: 0, todayKey: '' },
        downloads: parsed?.counters?.downloads || {},
      },
      events: Array.isArray(parsed?.events) ? parsed.events : [],
      geo: {
        countries: parsed?.geo?.countries || {},
        cities: parsed?.geo?.cities || {},
      },
      dailyVisits: Array.isArray(parsed?.dailyVisits) ? parsed.dailyVisits : [],
    }
    runtime.analyticsStores.set(namespace, { store, loadedAt: Date.now() })
    return store
  } catch {
    const store = emptyAnalyticsStore()
    runtime.analyticsStores.set(namespace, { store, loadedAt: Date.now() })
    return store
  }
}

async function readSummaryFromKv(kv, todayKey) {
  return summaryFromStore(await readAnalyticsStore(kv), todayKey)
}

async function readLegacyStoreSummaries(todayKey) {
  const summaries = []
  for (const kv of legacyEdgeKvs()) {
    try {
      const summary = await readSummaryFromKv(kv, todayKey)
      if (
        summary.visits.total > 0 ||
        summary.downloadsTotal > 0 ||
        summary.recent.length > 0 ||
        summary.geo.countries.length > 0
      ) {
        summaries.push(summary)
      }
    } catch {
      /* ignore unavailable legacy namespace */
    }
  }
  return summaries
}

async function writeAnalyticsStore(kv, store) {
  store.updatedAt = new Date().toISOString()
  await kvPutText(kv, ANALYTICS_KEY, JSON.stringify(store))
  const runtime = runtimeState()
  runtime.analyticsStores.set(kvNamespace(kv), { store, loadedAt: Date.now() })
  runtime.dirtyEvents = 0
  runtime.lastFlushAt = Date.now()
}

function incrementStoredCounter(store, group, id, todayKey) {
  if (group === 'visits') {
    const current = normalizeStoredCounter(store.counters.visits, todayKey)
    current.total += 1
    current.today += 1
    store.counters.visits = current
    return { total: current.total, today: current.today }
  }

  const current = normalizeStoredCounter(store.counters.downloads[id], todayKey)
  current.total += 1
  current.today += 1
  store.counters.downloads[id] = current
  return { total: current.total, today: current.today }
}

function appendStoredEvent(store, event) {
  store.events.push(event)
  const maxEvents = Math.max(MAX_DAILY_EVENTS * PUBLIC_DAYS, MAX_DAILY_EVENTS)
  if (store.events.length > maxEvents) {
    store.events = store.events.slice(store.events.length - maxEvents)
  }
}

function appendStoredDailyVisit(store, event) {
  store.dailyVisits.push({
    time: event.time,
    page: event.page,
    country: event.country || '',
    city: event.city || '',
    device: event.device,
    referrer: event.referrer,
  })
  const dates = new Set(recentDateKeys())
  store.dailyVisits = store.dailyVisits
    .filter((visit) => visit.time && dates.has(String(visit.time).slice(0, 10)))
    .slice(-MAX_DAILY_EVENTS * PUBLIC_DAYS)
}

function incrementStoredGeo(store, geo) {
  if (!geo || !geo.city || geo.city === '未知') return
  const countryKey = geo.country || '未知'
  if (!store.geo.countries[countryKey]) store.geo.countries[countryKey] = { count: 0 }
  store.geo.countries[countryKey].count += 1

  const cityKey = `${countryKey}|${geo.city}`
  if (!store.geo.cities[cityKey]) {
    store.geo.cities[cityKey] = {
      country: geo.country || '',
      countryCode: geo.countryCode || '',
      city: geo.city || '',
      region: geo.region || '',
      lat: geo.lat || 0,
      lon: geo.lon || 0,
      count: 0,
    }
  }
  store.geo.cities[cityKey].count += 1
}

function geoFromStore(store) {
  const countryCounts = new Map()
  const cityCountryCounts = new Map()
  const cityCounts = new Map()

  for (const [name, data] of Object.entries(store.geo?.countries || {})) {
    const normalized = normalizeChinaGeoFields({ country: name })
    countryCounts.set(
      normalized.country,
      (countryCounts.get(normalized.country) || 0) + (Number(data.count) || 0)
    )
  }

  for (const data of Object.values(store.geo?.cities || {})) {
    const normalized = normalizeChinaGeoFields(data)
    const key = `${normalized.country}|${normalized.region}|${normalized.city}`
    const current = cityCounts.get(key) || {
      country: normalized.country,
      countryCode: normalized.countryCode,
      city: normalized.city,
      region: normalized.region,
      lat: data.lat || 0,
      lon: data.lon || 0,
      count: 0,
    }
    current.count += Number(data.count) || 0
    if (!current.lat && data.lat) current.lat = data.lat
    if (!current.lon && data.lon) current.lon = data.lon
    cityCounts.set(key, current)
    cityCountryCounts.set(
      normalized.country,
      (cityCountryCounts.get(normalized.country) || 0) + (Number(data.count) || 0)
    )
  }

  for (const [name, count] of cityCountryCounts.entries()) {
    if (!countryCounts.get(name)) countryCounts.set(name, count)
  }

  return {
    countries: Array.from(countryCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    cities: Array.from(cityCounts.values())
      .sort((a, b) => b.count - a.count),
  }
}

function buildHourlyBars(visits) {
  const now = new Date()
  const offset = now.getTimezoneOffset() + 480
  const localNow = new Date(now.getTime() + offset * 60000)
  const currentHour = localNow.getUTCHours()
  const todayDate = localNow.toISOString().slice(0, 10)
  const bars = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }))

  for (const visit of visits || []) {
    if (!visit.time) continue
    const d = new Date(visit.time)
    const local = new Date(d.getTime() + offset * 60000)
    if (local.toISOString().slice(0, 10) !== todayDate) continue
    const hour = local.getUTCHours()
    if (hour >= 0 && hour < 24) bars[hour].count += 1
  }

  const total = bars.reduce((sum, item) => sum + item.count, 0)
  const max = Math.max(1, ...bars.map((item) => item.count))
  return { bars, total, max, currentHour }
}

function shouldFlushAnalytics(runtime, flushNow) {
  if (flushNow) return true
  if (runtime.dirtyEvents >= ANALYTICS_FLUSH_EVENT_THRESHOLD) return true
  return Date.now() - runtime.lastFlushAt >= ANALYTICS_FLUSH_INTERVAL_MS
}

async function trackInAnalyticsStore(kv, mutator) {
  const runtime = runtimeState()
  const pending = runtime.mutationQueue.then(async () => {
    const store = await readAnalyticsStore(kv)
    const result = mutator(store)
    runtime.analyticsStores.set(kvNamespace(kv), { store, loadedAt: Date.now() })
    runtime.dirtyEvents += 1
    if (shouldFlushAnalytics(runtime, result.flushNow)) await writeAnalyticsStore(kv, store)
    const publicResult = { ...result }
    delete publicResult.flushNow
    return publicResult
  })
  runtime.mutationQueue = pending.catch(() => undefined)
  return pending
}

function summaryFromStore(store, todayKey) {
  const downloadsByFile = {}
  const storedDownloadIds = Object.keys(store.counters?.downloads || {})

  for (const id of knownDownloadIds(storedDownloadIds)) {
    const counter = normalizeStoredCounter(store.counters.downloads[id], todayKey)
    if (counter.total <= 0 && !DOWNLOADS[id]) continue
    downloadsByFile[id] = serializeDownloadCounter(id, counter)
  }
  const downloadsByVersion = buildDownloadsByVersion(downloadsByFile, true)
  const downloadsTotal = Object.values(downloadsByFile).reduce(
    (sum, item) => sum + (Number(item.total) || 0),
    0
  )

  const events = [...(store.events || [])].sort((a, b) =>
    String(b.time || '').localeCompare(String(a.time || ''))
  )
  const dailyVisits = [...(store.dailyVisits || [])].sort((a, b) =>
    String(b.time || '').localeCompare(String(a.time || ''))
  )

  return {
    visits: normalizeStoredCounter(store.counters.visits, todayKey),
    downloadsByFile,
    downloadsByVersion,
    downloadsTotal,
    pages: topBreakdown(
      events.filter((event) => event.kind === 'view'),
      (event) => event.page
    ),
    referrers: topBreakdown(events, (event) => event.referrer),
    devices: topBreakdown(events, (event) => event.device),
    recent: events.slice(0, 18),
    geo: geoFromStore(store),
    hourly: buildHourlyBars(dailyVisits),
    downloadHourly: buildHourlyBars(events.filter((event) => event.kind === 'download')),
  }
}

function downloadVersionKey(download) {
  return `${String(download.platform || '').toLowerCase()}-${download.version}`
}

function displayDownloadPlatform(platform) {
  return {
    android: 'Android',
    macos: 'macOS',
    windows: 'Windows',
    ios: 'iOS',
  }[platform] || platform || 'Unknown'
}

function buildDownloadsByVersion(downloadsByFile, includeLegacy = false) {
  const downloadsByVersion = {}
  const source = includeLegacy ? DOWNLOAD_META : DOWNLOADS
  for (const id of Object.keys(source)) {
    const download = source[id]
    const key = downloadVersionKey(download)
    const stats = downloadsByFile[id] || { total: 0, today: 0 }
    if (!includeLegacy && !DOWNLOADS[id]) continue
    if (includeLegacy && !DOWNLOADS[id] && Number(stats.total || 0) <= 0) continue
    const current =
      downloadsByVersion[key] || {
        id: key,
        platform: displayDownloadPlatform(download.platform),
        version: download.version,
        label: `${displayDownloadPlatform(download.platform)} ${download.version}`,
        total: 0,
        today: 0,
        fileIds: [],
      }
    current.total += Number(stats.total) || 0
    current.today += Number(stats.today) || 0
    current.fileIds.push(id)
    downloadsByVersion[key] = current
  }
  return downloadsByVersion
}

function routePath(url) {
  const path = url.pathname.replace(/^\/api(?=\/|$)/, '') || '/'
  return path === '' ? '/' : path
}

function downloadRedirectHref(fileId, request) {
  const url = new URL(request.url)
  const item = DOWNLOADS[fileId]
  const part = Number(url.searchParams.get('part'))
  if (
    Number.isInteger(part) &&
    part >= 0 &&
    Array.isArray(item?.chunks) &&
    item.chunks[part]
  ) {
    return item.chunks[part]
  }
  return item?.href || '/#/download'
}

function redirectToDownload(request, fileId) {
  return Response.redirect(new URL(downloadRedirectHref(fileId, request), request.url).toString(), 302)
}

async function handleCounter(request) {
  const kv = edgeKv()
  const todayKey = getTodayKey()
  const url = new URL(request.url)
  const readOnly = url.searchParams.get('skip') === '1' || url.searchParams.get('increment') === '0'
  try {
    const allowed = await consumeRate(`counter:${ipBucket(getClientIP(request))}`, 240, 3600)
    if (!allowed) return json({ error: 'Too many requests', build: EDGE_BUILD }, 429)

    if (!readOnly) {
      if (!sameSiteRequest(request)) return json({ error: 'Access denied' }, 403)
      const writeAllowed = await consumeRate(`counter-write:${ipBucket(getClientIP(request))}`, 60, 3600)
      if (!writeAllowed) return json({ error: 'Too many requests', build: EDGE_BUILD }, 429)
      const result = await trackInAnalyticsStore(kv, (store) => ({
        ...incrementStoredCounter(store, 'visits', 'visits', todayKey),
        flushNow: false,
      }))
      return json({ ...result, build: EDGE_BUILD })
    }

    const primarySummary = await readSummaryFromKv(kv, todayKey)
    const legacyStoreSummaries = await readLegacyStoreSummaries(todayKey)
    return json({
      ...(await readPublicVisits(kv, todayKey, primarySummary, legacyStoreSummaries)),
      build: EDGE_BUILD,
    })
  } catch {
    return json({ ...(await safeReadCounter(kv, 'visits', todayKey)), build: EDGE_BUILD })
  }
}

async function guardReadRequest(request, name, limit = 360, windowSeconds = 300) {
  const allowed = await consumeRate(`${name}:${ipBucket(getClientIP(request))}`, limit, windowSeconds)
  if (!allowed) return json({ error: 'Too many requests', build: EDGE_BUILD }, 429)
  return null
}

function consumeRecentDownload(fileId, bucket) {
  const runtime = runtimeState()
  const now = Date.now()
  const recent = runtime.recentDownloadKeys
  for (const [key, expiresAt] of recent.entries()) {
    if (expiresAt <= now || recent.size > RATE_BUCKET_MAX_ENTRIES) recent.delete(key)
  }
  const key = `${safeKey(fileId)}:${safeKey(bucket)}`
  if (recent.has(key)) return false
  recent.set(key, now + DOWNLOAD_DEDUPE_TTL_MS)
  return true
}

async function handleTrack(request) {
  const kv = edgeKv()
  const ip = getClientIP(request)
  const bucket = ipBucket(ip)
  const allowed = await consumeRate(`track:${bucket}`, 240, 3600)
  if (!allowed) return json({ error: 'Too many requests', build: EDGE_BUILD }, 429)

  let body = {}
  try {
    body = await readJsonLimited(request)
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400)
  }

  const blocked = await guardWriteRequest(request, body)
  if (blocked) return blocked

  try {
    const ua = parseUserAgent(body.ua || request.headers.get('User-Agent') || '')
    const todayKey = getTodayKey()
    const page = normalizePage(body.page || '/')
    const geo = normalizeGeo(await fetchGeo(ip).catch(() => null), ip)
    const event = {
      kind: 'view',
      time: new Date().toISOString(),
      page,
      referrer: normalizeReferrer(body.referrer || request.headers.get('Referer') || ''),
      device: ua.device,
      browser: ua.browser,
      os: ua.os,
      country: geo.country || '',
      countryCode: geo.countryCode || '',
      city: geo.city || '',
      region: geo.region || '',
      lat: geo.lat || 0,
      lon: geo.lon || 0,
    }
    const visits = await trackInAnalyticsStore(kv, (store) => {
      const counter = incrementStoredCounter(store, 'visits', 'visits', todayKey)
      appendStoredEvent(store, event)
      appendStoredDailyVisit(store, event)
      incrementStoredGeo(store, geo)
      return { ...counter, flushNow: false }
    })
    return json({ ok: true, visits, eventStored: true, build: EDGE_BUILD })
  } catch (error) {
    return json({ ok: false, error: 'Failed to track visit', build: EDGE_BUILD }, 500)
  }
}

function sumVisitsFromSummaries(summaries) {
  return summaries.reduce(
    (sum, summary) => ({
      total: sum.total + (Number(summary?.visits?.total) || 0),
      today: sum.today + (Number(summary?.visits?.today) || 0),
    }),
    { total: 0, today: 0 }
  )
}

async function readPublicVisits(kv, todayKey, primarySummary = null, legacyStoreSummaries = null) {
  const primary = primarySummary || (await readSummaryFromKv(kv, todayKey))
  const legacySummaries = legacyStoreSummaries || (await readLegacyStoreSummaries(todayKey))
  const baseline = await readStatsBaseline(kv, todayKey)
  const [currentDirect, legacyDirect] = await Promise.all([
    safeReadCounter(kv, 'visits', todayKey),
    readCounterSumAcrossKvs(legacyEdgeKvs(), 'visits', todayKey),
  ])
  const legacyStoreVisits = sumVisitsFromSummaries(legacySummaries)
  return {
    total:
      Math.max(Number(primary.visits?.total) || 0, currentDirect.total) +
      Math.max(legacyStoreVisits.total, legacyDirect.total) +
      baseline.visits.total,
    today:
      Math.max(Number(primary.visits?.today) || 0, currentDirect.today) +
      Math.max(legacyStoreVisits.today, legacyDirect.today) +
      baseline.visits.today,
    todayKey,
  }
}

async function readCounterDownloads(kvs, todayKey, extraIds = []) {
  const downloadsByFile = {}
  for (const id of legacyDownloadIdsForPublicStats(extraIds)) {
    const total = await readCounterTotalAcrossKvs(kvs, `download:${id}`)
    if (total <= 0 && !DOWNLOADS[id]) continue
    const today = total > 0 ? await readCounterTodayAcrossKvs(kvs, `download:${id}`, todayKey) : 0
    downloadsByFile[id] = serializeDownloadCounter(id, { total, today })
  }
  return combineDownloadSummaries({ downloadsByFile })
}

async function readDownloads(kv, todayKey, baseSummary = null, legacySummaries = null) {
  const runtime = runtimeState()
  const baseline = await readStatsBaseline(kv, todayKey)
  const cacheKey = `${todayKey}:${baseline.updatedAt}:${baseline.downloadsTotal}`
  if (
    runtime.publicDownloadsCache &&
    runtime.publicDownloadsCacheKey === cacheKey &&
    Date.now() - runtime.publicDownloadsCacheLoadedAt < PUBLIC_DOWNLOADS_CACHE_TTL_MS
  ) {
    return runtime.publicDownloadsCache
  }

  const primarySummary = baseSummary || (await readSummaryFromKv(kv, todayKey))
  const legacyStoreSummaries = legacySummaries || (await readLegacyStoreSummaries(todayKey))
  const legacyKvs = legacyEdgeKvs()
  const extraIds = [
    ...Object.keys(primarySummary.downloadsByFile || {}),
    ...legacyStoreSummaries.flatMap((summary) => Object.keys(summary.downloadsByFile || {})),
  ]
  const [currentCounters, legacyCounters] = await Promise.all([
    readCounterDownloads([kv], todayKey, extraIds),
    readCounterDownloads(legacyKvs, todayKey, extraIds),
  ])
  const currentDownloads = mergeDownloadSummaries(primarySummary, currentCounters)
  const legacyDownloads = mergeDownloadSummaries(
    combineDownloadSummaries(...legacyStoreSummaries),
    legacyCounters
  )
  const downloads = combineDownloadSummaries(currentDownloads, legacyDownloads, baseline)
  runtime.publicDownloadsCache = downloads
  runtime.publicDownloadsCacheKey = cacheKey
  runtime.publicDownloadsCacheLoadedAt = Date.now()
  return downloads
}

async function handleDownload(request) {
  const url = new URL(request.url)
  const kv = edgeKv()
  let fileId = url.searchParams.get('file') || ''
  let body = {}

  if (request.method === 'POST') {
    try {
      body = await readJsonLimited(request)
      const blocked = await guardWriteRequest(request, body)
      if (blocked) return blocked
      fileId = body.file || fileId
    } catch {
      return json({ ok: false, error: 'Invalid JSON' }, 400)
    }
  }

  if (!DOWNLOADS[fileId]) return json({ ok: false, error: 'Unknown download file' }, 404)

  if (
    request.method === 'GET' &&
    !sameSiteRequest(request) &&
    !(await hasConfiguredWriteToken(request)) &&
    !isUpdateDownloadRequest(request)
  ) {
    return redirectToDownload(request, fileId)
  }

  const allowed = await consumeRate(`download:${fileId}:${ipBucket(getClientIP(request))}`, 90, 3600)
  if (!allowed) return json({ error: 'Too many requests', build: EDGE_BUILD }, 429)

  try {
    const todayKey = getTodayKey()
    const bucket = ipBucket(getClientIP(request))
    if (!consumeRecentDownload(fileId, bucket)) {
      if (request.method === 'GET') {
        return redirectToDownload(request, fileId)
      }
      const store = await readAnalyticsStore(kv)
      const counter = normalizeStoredCounter(store.counters.downloads[fileId], todayKey)
      return json({
        ok: true,
        file: fileId,
        eventStored: false,
        duplicate: true,
        ...counter,
        build: EDGE_BUILD,
      })
    }

    const ua = parseUserAgent(body.ua || request.headers.get('User-Agent') || '')
    const event = {
      kind: 'download',
      time: new Date().toISOString(),
      file: fileId,
      fileLabel: DOWNLOADS[fileId].label,
      page: normalizePage(body.page || '/'),
      referrer: normalizeReferrer(body.referrer || request.headers.get('Referer') || ''),
      device: ua.device,
      browser: ua.browser,
      os: ua.os,
    }
    const counter = await trackInAnalyticsStore(kv, (store) => {
      const next = incrementStoredCounter(store, 'downloads', fileId, todayKey)
      appendStoredEvent(store, event)
      return { ...next, flushNow: true }
    })

    if (request.method === 'GET') {
      return redirectToDownload(request, fileId)
    }

    return json({ ok: true, file: fileId, eventStored: true, ...counter, build: EDGE_BUILD })
  } catch (error) {
    if (request.method === 'GET') {
      return redirectToDownload(request, fileId)
    }
    return json({ ok: false, error: 'Failed to track download', build: EDGE_BUILD }, 500)
  }
}

async function handleDownloads(request) {
  const blocked = await guardReadRequest(request, 'downloads-read')
  if (blocked) return blocked

  try {
    const kv = edgeKv()
    const todayKey = getTodayKey()
    const summary = await readSummaryFromKv(kv, todayKey)
    const downloads = await readDownloads(kv, todayKey, summary)
    return json({ ...downloads, build: EDGE_BUILD })
  } catch {
    return json({ downloadsByFile: {}, downloadsByVersion: {}, downloadsTotal: 0, build: EDGE_BUILD })
  }
}

async function handlePublicStats(request) {
  const blocked = await guardReadRequest(request, 'public-stats-read')
  if (blocked) return blocked

  const kv = edgeKv()
  const todayKey = getTodayKey()
  const summary = await readSummaryFromKv(kv, todayKey).catch(() => emptySummary())
  const legacyStoreSummaries = await readLegacyStoreSummaries(todayKey).catch(() => [])
  const [visits, downloads] = await Promise.all([
    readPublicVisits(kv, todayKey, summary, legacyStoreSummaries).catch(() => ({
      total: summary.visits.total || 0,
      today: summary.visits.today || 0,
      todayKey,
    })),
    readDownloads(kv, todayKey, summary, legacyStoreSummaries).catch(() => ({
      downloadsByFile: {},
      downloadsByVersion: {},
      downloadsTotal: 0,
    })),
  ])

  return json({
    visits,
    total: visits.total,
    today: visits.today,
    todayKey,
    downloadsByFile: downloads.downloadsByFile,
    downloadsByVersion: downloads.downloadsByVersion,
    downloadsTotal: downloads.downloadsTotal,
    build: EDGE_BUILD,
  })
}

async function handleUpdateLatest(request) {
  const blocked = await guardReadRequest(request, 'updates-latest', 240, 300)
  if (blocked) return blocked

  const url = new URL(request.url)
  const platform = normalizeUpdatePlatform(url.searchParams.get('platform'))
  const requestedChannel = url.searchParams.has('channel')
  const channel = normalizeUpdateChannel(url.searchParams.get('channel'))
  const kv = edgeKv()
  const store = await readUpdateStore(kv)

  if (platform) {
    const release =
      store.releases?.[platform]?.[channel] ||
      (!requestedChannel
        ? store.releases?.[platform]?.[DEFAULT_UPDATE_CHANNEL] ||
          Object.values(store.releases?.[platform] || {})[0]
        : null) ||
      null
    return json({
      ok: true,
      platform,
      channel,
      latest: serializeRelease(release, request),
      updatedAt: store.updatedAt,
      build: EDGE_BUILD,
    })
  }

  const releases = {}
  for (const [platformName, channels] of Object.entries(store.releases || {})) {
    releases[platformName] = {}
    for (const [channelName, release] of Object.entries(channels || {})) {
      releases[platformName][channelName] = serializeRelease(release, request)
    }
  }

  return json({
    ok: true,
    releases,
    updatedAt: store.updatedAt,
    build: EDGE_BUILD,
  })
}

async function handleUpdateCheck(request) {
  const blocked = await guardReadRequest(request, 'updates-check', 360, 300)
  if (blocked) return blocked

  let body = {}
  if (request.method === 'POST') {
    try {
      body = await readJsonLimited(request)
    } catch {
      return json({ ok: false, error: 'Invalid JSON' }, 400)
    }
  }

  const url = new URL(request.url)
  const platform = normalizeUpdatePlatform(
    body.platform || url.searchParams.get('platform') || url.searchParams.get('os')
  )
  if (!platform) return json({ ok: false, error: 'Unknown platform', build: EDGE_BUILD }, 400)

  const requestedChannel =
    Object.prototype.hasOwnProperty.call(body, 'channel') || url.searchParams.has('channel')
  const channel = normalizeUpdateChannel(body.channel || url.searchParams.get('channel'))
  const currentVersion = String(
    body.currentVersion ||
      body.versionName ||
      body.version ||
      url.searchParams.get('currentVersion') ||
      url.searchParams.get('versionName') ||
      url.searchParams.get('version') ||
      ''
  ).trim()
  const currentVersionCode =
    Number(
      body.currentVersionCode ||
        body.versionCode ||
        body.buildNumber ||
        url.searchParams.get('currentVersionCode') ||
        url.searchParams.get('versionCode') ||
        url.searchParams.get('buildNumber') ||
        0
    ) ||
    0

  const kv = edgeKv()
  const store = await readUpdateStore(kv)
  const release =
    store.releases?.[platform]?.[channel] ||
    (!requestedChannel
      ? store.releases?.[platform]?.[DEFAULT_UPDATE_CHANNEL] ||
        Object.values(store.releases?.[platform] || {})[0]
      : null) ||
    null
  const latest = serializeRelease(release, request)
  const versionUpdate =
    latest && currentVersion
      ? compareVersions(latest.version, currentVersion) > 0
      : false
  const sameVersionName =
    latest && currentVersion ? compareVersions(latest.version, currentVersion) === 0 : false
  const codeUpdate =
    latest && latest.versionCode && currentVersionCode && !sameVersionName
      ? latest.versionCode > currentVersionCode
      : false
  const belowMin =
    latest?.minSupportedVersion && currentVersion
      ? compareVersions(currentVersion, latest.minSupportedVersion) < 0
      : false

  return json({
    ok: true,
    platform,
    channel,
    current: {
      version: currentVersion,
      versionCode: currentVersionCode,
    },
    updateAvailable: Boolean(latest && (codeUpdate || versionUpdate || belowMin)),
    mandatory: Boolean(latest?.mandatory || belowMin),
    latest,
    updatedAt: store.updatedAt,
    build: EDGE_BUILD,
  })
}

async function handleUpdatePublish(request) {
  const config = await readRuntimeConfig()
  if (!config.writeToken) return json({ ok: false, error: 'Publish token is not configured' }, 403)

  let body = {}
  try {
    body = await readJsonLimited(request)
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400)
  }

  if (!(await verifyWriteToken(request, body, config)))
    return json({ ok: false, error: 'Access denied' }, 403)

  const allowed = await consumeRate(`updates-publish:${ipBucket(getClientIP(request))}`, 30, 3600)
  if (!allowed) return json({ error: 'Too many requests', build: EDGE_BUILD }, 429)

  const normalized = normalizePublishedRelease(body)
  if (normalized.error) return json({ ok: false, error: normalized.error, build: EDGE_BUILD }, 400)

  const kv = edgeKv()
  const store = await readUpdateStore(kv)
  const { platform, channel } = normalized.release
  store.releases[platform] = store.releases[platform] || {}
  store.releases[platform][channel] = normalized.release
  await writeUpdateStore(kv, store)

  return json({
    ok: true,
    platform,
    channel,
    latest: serializeRelease(normalized.release, request),
    updatedAt: store.updatedAt,
    build: EDGE_BUILD,
  })
}

async function handleSummary(request) {
  const protectedRead = await guardAnalyticsRead(request)
  if (protectedRead) return protectedRead

  const blocked = await guardReadRequest(request, 'summary-read')
  if (blocked) return blocked

  const kv = edgeKv()
  const todayKey = getTodayKey()
  const storeSummary = await readSummaryFromKv(kv, todayKey)
  const legacyStoreSummaries = await readLegacyStoreSummaries(todayKey)
  const visits = await readPublicVisits(kv, todayKey, storeSummary, legacyStoreSummaries)
  const downloads = await readDownloads(kv, todayKey, storeSummary, legacyStoreSummaries).catch(() => ({
    downloadsByFile: {},
    downloadsByVersion: {},
    downloadsTotal: 0,
  }))
  const baseline = await readStatsBaseline(kv, todayKey)
  const combinedSummary = mergeBaselineIntoSummary(
    combineAnalyticsSummaries(storeSummary, ...legacyStoreSummaries),
    baseline
  )
  if (
    visits.total > 0 ||
    downloads.downloadsTotal > 0 ||
    storeSummary.recent.length > 0
  ) {
    return json({ ...combinedSummary, visits, ...downloads, build: EDGE_BUILD })
  }

  const events = await readRecentEvents(kv).catch(() => [])
  return json({
    visits,
    ...downloads,
    pages: topBreakdown(
      events.filter((event) => event.kind === 'view'),
      (event) => event.page
    ),
    referrers: topBreakdown(events, (event) => event.referrer),
    devices: topBreakdown(events, (event) => event.device),
    recent: events.slice(0, 18),
    geo: storeSummary.geo,
    hourly: buildHourlyBars(events.filter((event) => event.kind === 'view')),
    downloadHourly: buildHourlyBars(events.filter((event) => event.kind === 'download')),
    build: EDGE_BUILD,
  })
}

async function readDiagnosticsForKv(kv, todayKey, options = {}) {
  const deep = Boolean(options.deep)
  const namespace = kvNamespace(kv)
  const analyticsText = await kvGetText(kv, ANALYTICS_KEY).catch(() => '')
  const baselineText = await kvGetText(kv, BASELINE_KEY).catch(() => '')
  let parsedAnalytics = null
  if (analyticsText) {
    try {
      parsedAnalytics = JSON.parse(analyticsText)
    } catch {
      parsedAnalytics = null
    }
  }
  const summary = deep
    ? await readSummaryFromKv(kv, todayKey).catch(() => emptySummary())
    : emptySummary()
  const directVisits = await safeReadCounter(kv, 'visits', todayKey)
  const eventKeys = deep ? recentDateKeys(1) : []
  const eventCounts = {}
  for (const date of eventKeys) {
    const text =
      (await kvGetText(kv, kvKey('events', date)).catch(() => '')) ||
      (await kvGetText(kv, legacyKey('events', date)).catch(() => ''))
    if (!text) {
      eventCounts[date] = 0
      continue
    }
    try {
      const parsed = JSON.parse(text)
      eventCounts[date] = Array.isArray(parsed) ? parsed.length : 0
    } catch {
      eventCounts[date] = -1
    }
  }

  const knownIds = (
    deep
      ? knownDownloadIds(Object.keys(summary.downloadsByFile || {}))
      : [
          'android-3.5.3',
          'android-3.5',
          'android-3.2-beta',
          'android-3.1',
          'windows-portable-3.5.3',
          'macos-3.5.3',
        ]
  ).slice(0, deep ? 24 : 6)
  const directDownloads = {}
  for (const id of knownIds) {
    const counter = await safeReadCounter(kv, `download:${id}`, todayKey)
    if (counter.total > 0 || counter.today > 0 || summary.downloadsByFile?.[id]?.total > 0) {
      directDownloads[id] = {
        total: counter.total,
        today: counter.today,
        storeTotal: numberOrZero(summary.downloadsByFile?.[id]?.total),
        storeToday: numberOrZero(summary.downloadsByFile?.[id]?.today),
      }
    }
  }

  return {
    namespace,
    analyticsExists: Boolean(analyticsText),
    analyticsBytes: analyticsText.length,
    baselineExists: Boolean(baselineText),
    baselineBytes: baselineText.length,
    analyticsPreview: parsedAnalytics
      ? {
          version: parsedAnalytics.version || 0,
          visits: parsedAnalytics.counters?.visits || null,
          downloadIds: Object.keys(parsedAnalytics.counters?.downloads || {}).slice(0, 24),
          downloadTotal: Object.values(parsedAnalytics.counters?.downloads || {}).reduce(
            (sum, item) => sum + (Number(item?.total) || 0),
            0
          ),
          events: Array.isArray(parsedAnalytics.events) ? parsedAnalytics.events.length : 0,
          dailyVisits: Array.isArray(parsedAnalytics.dailyVisits)
            ? parsedAnalytics.dailyVisits.length
            : 0,
        }
      : null,
    summary: {
      visits: summary.visits,
      downloadsTotal: summary.downloadsTotal,
      downloadIds: Object.keys(summary.downloadsByFile || {}).filter(
        (id) => Number(summary.downloadsByFile[id]?.total) > 0
      ),
      recent: summary.recent.length,
      countries: summary.geo?.countries?.length || 0,
      cities: summary.geo?.cities?.length || 0,
    },
    directVisits,
    directDownloads,
    events: eventCounts,
  }
}

async function handleAnalyticsDebug(request) {
  const protectedRead = await guardAnalyticsRead(request)
  if (protectedRead) return protectedRead

  const url = new URL(request.url)
  const deep = url.searchParams.get('deep') === '1'
  const todayKey = getTodayKey()
  const kvs = [edgeKv(), ...legacyEdgeKvs()]
  const namespaces = []
  for (const kv of kvs) {
    namespaces.push(await readDiagnosticsForKv(kv, todayKey, { deep }))
  }
  const current = deep ? await readSummaryFromKv(kvs[0], todayKey).catch(() => emptySummary()) : emptySummary()
  const legacy = deep ? await readLegacyStoreSummaries(todayKey).catch(() => []) : []
  const baseline = await readStatsBaseline(kvs[0], todayKey)
  const publicVisits = deep
    ? await readPublicVisits(kvs[0], todayKey, current, legacy)
    : {
        total:
          numberOrZero(namespaces[0]?.analyticsPreview?.visits?.total) +
          numberOrZero(namespaces[0]?.directVisits?.total) +
          baseline.visits.total,
        today:
          numberOrZero(namespaces[0]?.analyticsPreview?.visits?.today) +
          numberOrZero(namespaces[0]?.directVisits?.today) +
          baseline.visits.today,
        todayKey,
      }
  const publicDownloads = deep
    ? await readDownloads(kvs[0], todayKey, current, legacy).catch(() => ({
        downloadsByFile: {},
        downloadsByVersion: {},
        downloadsTotal: 0,
      }))
    : {
        downloadsByFile: {},
        downloadsByVersion: {},
        downloadsTotal: 0,
      }

  return json({
    ok: true,
    build: EDGE_BUILD,
    todayKey,
    mode: deep ? 'deep' : 'light',
    namespaces,
    baseline,
    public: {
      visits: publicVisits,
      downloadsTotal: publicDownloads.downloadsTotal,
      downloadIds: Object.keys(publicDownloads.downloadsByFile || {}).filter(
        (id) => Number(publicDownloads.downloadsByFile[id]?.total) > 0
      ),
    },
  })
}

async function handleAnalyticsBaseline(request) {
  const config = await readRuntimeConfig()
  if (!config.writeToken && !config.readToken) {
    return json({ ok: false, error: 'Admin token is not configured', build: EDGE_BUILD }, 403)
  }

  let body = {}
  if (request.method === 'POST') {
    try {
      body = await readJsonLimited(request)
    } catch {
      return json({ ok: false, error: 'Invalid JSON', build: EDGE_BUILD }, 400)
    }
  }

  const canRead = await verifyReadToken(request, config)
  const canWrite = Boolean(config.writeToken) && (await verifyWriteToken(request, body, config))
  if (!canRead && !canWrite) return json({ ok: false, error: 'Access denied', build: EDGE_BUILD }, 403)

  const kv = edgeKv()
  const todayKey = getTodayKey()
  if (request.method === 'GET') {
    return json({ ok: true, baseline: await readStatsBaseline(kv, todayKey), build: EDGE_BUILD })
  }

  const incoming = normalizeBaseline(body.baseline && typeof body.baseline === 'object' ? body.baseline : body)
  if (body.mode === 'add') {
    const current = await readStatsBaseline(kv, todayKey)
    const merged = addBaselines(current, incoming)
    await kvPutText(kv, BASELINE_KEY, JSON.stringify(merged))
    const runtime = runtimeState()
    runtime.statsBaseline = merged
    runtime.statsBaselineLoadedAt = 0
    runtime.publicDownloadsCache = null
    return json({ ok: true, mode: 'add', baseline: merged, build: EDGE_BUILD })
  }

  const next = {
    ...incoming,
    updatedAt: new Date().toISOString(),
  }
  await kvPutText(kv, BASELINE_KEY, JSON.stringify(next))
  const runtime = runtimeState()
  runtime.statsBaseline = next
  runtime.statsBaselineLoadedAt = 0
  runtime.publicDownloadsCache = null
  return json({ ok: true, mode: 'replace', baseline: next, build: EDGE_BUILD })
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() })
    }

    const url = new URL(request.url)
    const path = routePath(url)

    if (path === '/health') {
      return json({
        ok: true,
        service: 'cpe-plus-plus-web',
        namespace: KV_NAMESPACE,
        build: EDGE_BUILD,
      })
    }

    if (path === '/counter') {
      if (request.method !== 'GET') return json({ error: 'Use GET' }, 405)
      return handleCounter(request)
    }

    if (path === '/track') {
      if (request.method !== 'POST') return json({ error: 'Use POST' }, 405)
      return handleTrack(request)
    }

    if (path === '/download') {
      if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Use GET or POST' }, 405)
      return handleDownload(request)
    }

    if (path === '/downloads') {
      if (request.method !== 'GET') return json({ error: 'Use GET' }, 405)
      return handleDownloads(request)
    }

    if (path === '/public-stats') {
      if (request.method !== 'GET') return json({ error: 'Use GET' }, 405)
      return handlePublicStats(request)
    }

    if (path === '/updates/latest') {
      if (request.method !== 'GET') return json({ error: 'Use GET' }, 405)
      return handleUpdateLatest(request)
    }

    if (path === '/updates/check') {
      if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Use GET or POST' }, 405)
      return handleUpdateCheck(request)
    }

    if (path === '/updates/publish') {
      if (request.method !== 'POST') return json({ error: 'Use POST' }, 405)
      return handleUpdatePublish(request)
    }

    if (path === '/analytics/summary') {
      if (request.method !== 'GET') return json({ error: 'Use GET' }, 405)
      return handleSummary(request)
    }

    if (path === '/analytics/debug') {
      if (request.method !== 'GET') return json({ error: 'Use GET' }, 405)
      return handleAnalyticsDebug(request)
    }

    if (path === '/analytics/baseline') {
      if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Use GET or POST' }, 405)
      return handleAnalyticsBaseline(request)
    }

    return json({ error: 'Not found' }, 404)
  },
}
