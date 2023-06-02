'use strict';

/* hack flag for build pure js */
if (typeof require !== 'undefined') {
  // eslint-disable-next-line
  const r = require;
}

const iosStore = 'https://itunes.apple.com/app/id785385147?mt=8';
const androidStore = 'https://play.google.com/store/apps/details?id=com.lazada.android';

const APP_DOWNLOAD_LINK = {
  id: 'https://c.lazada.co.id/t/traceAndDownload?mkttid={mkttid}&lpUrl={lp}',
  th: 'https://c.lazada.co.th/t/traceAndDownload?mkttid={mkttid}&lpUrl={lp}',
  my: 'https://c.lazada.com.my/t/traceAndDownload?mkttid={mkttid}&lpUrl={lp}',
  ph: 'https://c.lazada.com.ph/t/traceAndDownload?mkttid={mkttid}&lpUrl={lp}',
  sg: 'https://c.lazada.sg/t/traceAndDownload?mkttid={mkttid}&lpUrl={lp}',
  vn: 'https://c.lazada.vn/t/traceAndDownload?mkttid={mkttid}&lpUrl={lp}',
};

const regionID = (
  (window.lzdGlobalConfigOption.wh_site && window.lzdGlobalConfigOption.wh_site) ||
  (window.sBannerConfig && window.sBannerConfig.wh_site) ||
  'sg'
).toLowerCase();

const DEEP_LINK = {
  default: 'lazada://{venture}/web?url={url}',
  hp: 'lazada://{venture}',
  shop: 'lazada://{venture}/shop/{sellerKey}',
  pdp: 'lazada://{venture}/d?p={innerId}',
  search: 'lazada://{venture}/page?url_key={url_key}',
  campaign: 'lazada://{venture}/web/{subdomain}{path}',
  storestreet: 'lazada://{venture}/store_street',
};

const DEEP_LINK_REG = /(\{[a-zA-Z]\w+\})/g;

const UA = navigator.userAgent;
const iOS = /iPad|iPhone|iPod/i.test(UA) && !window.MSStream;
const isAndroid = UA.toLowerCase().indexOf('android') > -1;
const EXTERNAL_KEYS = [
  'campaign',
  'adgroup',
  'creative',
  'deep_link',
  'adjust_t',
  'adjust_campaign',
  'adjust_adgroup',
  'adjust_creative',
  'url_key',
  'extra',
  'adjust_network',
  'laz_share_info',
];

const DEBUG = false;

function debugLog(...args) {
  if (DEBUG) {
    console.log(...args); // eslint-disable-line no-console
  }
}

let deviceType = '';
const osSystem = getOsSystem();
if (osSystem.isAndroid) {
  deviceType = 'Android';
} else if (osSystem.isIOS) {
  deviceType = 'iOS';
}

function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function (...args) {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

function fragmentFromString(strHTML) {
  return document.createRange().createContextualFragment(strHTML);
}

function isShareUrl() {
  return location.search.indexOf('laz_share_info') > -1;
}

// function isGoogleBot(ua) {
//   const googleBots = [
//     'AdsBot-Google',
//     'Googlebot',
//     'APIs-Google',
//     'Mediapartners-Google',
//     'AdsBot-Google-Mobile-Apps',
//     'FeedFetcher-Google',
//     'Google-Read-Aloud',
//     'DuplexWeb-Google',
//     'Google Favicon',
//     'Googlebot-Image',
//     'Googlebot-News',
//     'Googlebot-Video',
//     'googleweblight'
//   ];
//   const googleBotReg = new RegExp(googleBots.join('|'));
//   const matchs = googleBotReg.exec(ua);
//   if (matchs && matchs.length) {
//     return matchs[0];
//   }
//   return false;
// }

function getOMFlag() {
  const s = location.search;
  let ret;
  if (s.indexOf('exlaz') > -1) {
    ret = 'exlaz';
  } else if (s.indexOf('laz_trackid') > -1) {
    ret = 'laz_trackid';
  } else {
    ret = 'none';
  }
  return ret;
}

function getDefaultExlaz() {
  const map = {
    id: 'd_1:mm_166120307_52100908_2011250917:id2210017:01:',
    my: 'd_1:mm_161240527_52101050_2011101081:my2070045:01:',
    th: 'd_1:mm_164891117_52302566_2011402551:th2885232:01:',
    ph: 'd_1:mm_159770615_52401914_2011551929:ph2404104:01:',
    vn: 'd_1:mm_159761210_51953185_2010953208:vn2696068:01:',
    sg: 'd_1:mm_156610926_51952176_2010902382:sg2068070:01:',
  };
  return map[regionID];
}

function isSEO() {
  return /google/.test(document.referrer) && !isPaidTraffic();
}

function isSearchBots() {
  const SEARCH_BOTS = [
    'Googlebot',
    'slurp',
    'Bingbot',
    'Baiduspider',
    'YandexBot',
    'Teoma',
    'NaverBot',
  ];
  let isBots = false;
  const ua = navigator.userAgent.toLowerCase();

  SEARCH_BOTS.forEach((bot) => {
    if (ua.indexOf(bot.toLowerCase()) >= 0) {
      isBots = true;
    }
  });
  return isBots;
}

function isPaidTraffic() {
  const url = location.href;
  return ['exlaz', 'laz_trackid', 'c.lazada', 'c.lzd', 'gclid', '/marketing/'].some(str => url.indexOf(str) > -1);
}

function getSmbStrategy() {
  // read from cookie
  const cookie = getCookie('smb_strategy');
  if (cookie) {
    const [disableSmb, smbAutoOpen, smbAutoDownload] = cookie.split('_').map((s) => {
      if (s === '1') {
        return true;
      }
      return false;
    });
    return {
      disableSmb,
      smbAutoOpen,
      smbAutoDownload,
    };
  }

  // default
  const defaultStrategy = {
    disableSmb: false,
    smbAutoOpen: false,
    smbAutoDownload: false,
  };
  if (isPaidTraffic()) {
    defaultStrategy.smbAutoOpen = true;
  }
  if (isShareUrl()) {
    defaultStrategy.smbAutoOpen = true;
  }
  return defaultStrategy;
}

function getAbTestingBucket() {
  return getCookie('smb_ab') || '';
}

// simple util for goldlog
// usualy we have two kinds of data report requirments

// 1. for exposure
const queue = window.goldlog_queue || (window.goldlog_queue = []);

// 2. for clk and other kind of report

/**
 * @param {string} logkey
 * @param {'EXP' | 'CLK' | 'SLD' | 'OTHER'} gmkey
 * @param {string} gokey - url param like string, eg. a=1&b=2
 * @param {'POST' | 'GET'} reqMethod  - 'GET' is the default value
 */
function record(logkey, gmkey = 'CLK', gokey = '', reqMethod = 'GET') {
  // see https://yuque.antfin-inc.com/aplusjs/docs/js.manual#bnmrdl
  if (!window.goldlog || typeof window.goldlog.record !== 'function') {
    return;
  }
  window.goldlog.record(logkey, gmkey, gokey, reqMethod);
}

// goldlog new version
/**
 * @param {string} logKey
 * @param {'EXP' | 'CLK'} type
 * @param {Object} data
 */
function _goldlog(logKey, type = 'EXP', data = {}) {
  if (!logKey) {
    console.trace('hehe');
    throw new Error('logKey is required');
  }
  const q = window.goldlog_queue || (window.goldlog_queue = []);
  const keys = Object.keys(data);
  const gokey = [];
  keys.forEach((k) => {
    const key = encodeURIComponent(k);
    const value = encodeURIComponent(data[key]);
    gokey.push(`${key}=${value}`);
  });
  q.push({
    action: 'goldlog.record',
    arguments: [logKey, type, gokey.join('&')],
  });
}

/**
 * @param {string} logKey
 * @param {Object} data
 */
function exposure(logKey, data = {}) {
  _goldlog(logKey, 'EXP', data);
}

/**
 * @param {string} logKey
 * @param {Object} data
 */
function click(logKey, data = {}) {
  _goldlog(logKey, 'CLK', data);
}

const gd = {
  queue,
  record,
  exposure,
  click,
};

// see https://stackoverflow.com/a/8809472
function generateUUID() {
  // Public Domain/MIT
  let d = Date.now(); // Timestamp
  // Time in microseconds since page-load or 0 if unsupported
  let d2 = (window.performance && performance.now && performance.now() * 1000) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16; // random number between 0 and 16
    if (d > 0) {
      // Use timestamp until depleted
      r = ((d + r) % 16) | 0; // eslint-disable-line no-bitwise
      d = Math.floor(d / 16);
    } else {
      // Use microseconds since page-load if supported
      r = ((d2 + r) % 16) | 0; // eslint-disable-line no-bitwise
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16); // eslint-disable-line no-bitwise, no-mixed-operators
  });
}

function getUUID() {
  return generateUUID();
}

function getMkttidWithEffect() {
  let mkttid;
  const q = getQuery('mkttid');
  if (q) {
    mkttid = q;
  } else if (window.__mkttid) {
    mkttid = window.__mkttid;
  } else {
    mkttid = getUUID();
    window.__mkttid = mkttid;
  }
  return mkttid;
}

/**
 * set cookie
 * @param {string} key
 * @param {string} value
 * @param {object} attributes
 */
function setCookie(key, value, attributes) {
  const defaults = {};
  attributes = Object.assign(
    {
      path: '/',
    },
    defaults,
    attributes
  );

  if (typeof attributes.expires === 'number') {
    const expires = new Date();
    expires.setTime(expires.getTime() + attributes.expires * 1000);
    attributes.expires = expires;
  }
  let result;
  // We're using "expires" because "max-age" is not supported by IE
  attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

  try {
    result = JSON.stringify(value);
    // eslint-disable-next-line
    if (/^[\{\[]/.test(result)) {
      value = result;
    }
  } catch (e) {
    console.log(e);
  }

  let stringifiedAttributes = '';

  for (const attributeName in attributes) {
    if (!attributes[attributeName]) {
      // eslint-disable-next-line
      continue;
    }
    stringifiedAttributes += `; ${attributeName}`;
    if (attributes[attributeName] === true) {
      // eslint-disable-next-line
      continue;
    }
    stringifiedAttributes += `=${attributes[attributeName]}`;
  }
  return (document.cookie = `${key}=${value}${stringifiedAttributes}`);
}

/**
 * get cookie
 * @param {string} key , the key of cookie , if not set, will return all the cookie
 */

function getCookie(key, options = {}) {
  let result = key ? null : {};
  const cookies = document.cookie ? document.cookie.split('; ') : [];

  for (let i = 0; i < cookies.length; i++) {
    const parts = cookies[i].split('=');
    let cookie = parts.slice(1).join('=');

    if (!options.json && cookie.charAt(0) === '"') {
      cookie = cookie.slice(1, -1);
    }

    const name = parts[0];

    if (options.json) {
      try {
        cookie = JSON.parse(cookie);
      } catch (e) {
        console.error(e);
      }
    }

    if (key === name) {
      result = cookie;
      break;
    }

    if (!key) {
      result[name] = cookie;
    }
  }
  return result;
}

function removeCookie(key, attributes) {
  setCookie(
    key,
    '',
    Object.assign(attributes, {
      expires: -1,
    })
  );
}

function appendQueriesForAppTracking(url, options) {
  const queryUrl = (url || '').split('?')[1] || '';
  const queryKeyArr = queryUrl.split('&').map(kv => kv.split('=')[0]);
  let newUrl = url;
  if (options.isDownload && queryKeyArr.indexOf('deferred') < 0) {
    const now = Date.now();
    newUrl += `&deferred=1&dexpire=${now + 3600000}`;
  }
  newUrl += `${parseExternalLinkParams(newUrl)}`;
  // append cookie from Click-Server
  const cstd = getClickServerTrackingData();
  Object.keys(cstd).forEach((key) => {
    if (cstd[key] && queryKeyArr.indexOf(key) < 0) {
      newUrl += `&${key}=${encodeURIComponent(cstd[key])}`;
    }
  });
  return newUrl;
}

function sendGoldlog(goldlogType, clickType = null) {
  window.goldlog.record(
    '/smb.delivery.main-lzd',
    goldlogType,
    `pageType=${
      window.sBannerConfig.wh_channel
    }&clickType=${clickType}&deviceType=${deviceType}&country=${window.sBannerConfig.wh_site}`,
    'GET'
  );
}

function exposeGoldlog() {
  const mainBanner = document.getElementById('J_Banner');
  if (mainBanner && window.goldlog) {
    setTimeout(() => {
      sendGoldlog('EXP');
    }, 3000);
  }
}

function clickGoldlog(clickType) {
  const mainBanner = document.getElementById('J_Banner');
  if (mainBanner && window.goldlog) {
    sendGoldlog('CLK', clickType);
  }
}

/**
 * Shortcut for goldlog
 * @param {string} logkey goldlog logkey, start with `/`
 * @param {String} gmkey goldlog gmkey
 * @param {object} params goldlog customizaion params
 * @param {string} [method=POST] goldlog request method
 */
function log(logkey, gmkey, params, method) {
  if (logkey.indexOf('/') !== 0) {
    logkey = `/${logkey}`;
  }
  const BASE_LOG_PARAMS = {
    region: window.location.hostname.split('.').pop(),
  };
  const kvs = Object.assign({}, BASE_LOG_PARAMS, params);
  if (window.goldlog) {
    const gokey = Object.keys(kvs)
      .map(k => `${k}=${typeof kvs[k] === 'string' ? kvs[k] : JSON.stringify(kvs[k])}`)
      .join('&');
    window.goldlog.record(logkey, gmkey, gokey, method === 'POST' ? 'POST' : 'GET');
  } else {
    const logger = console;
    logger.info(logkey, gmkey, kvs);
  }
}

// new banner's log
function revampGoldLog(goldlogType, clickType = null) {
  log('/smb.delivery.top', goldlogType, {
    pageType: window.sBannerConfig.wh_channel,
    clickType,
    deviceType,
    country: window.sBannerConfig.wh_site,
  });
}

/**
 * @type {Object}
 * @memberof lib.env
 * @property {String} name - UC/QQ/Firefox/Chrome/Android/Safari/iOS Webview/Chrome Webview/IE/IEMobile/unknown
 * @property {lib.env~Version} version
 * @property {Boolean} isUC
 * @property {Boolean} isQQ
 * @property {Boolean} isIE
 * @property {Boolean} isIEMobile
 * @property {Boolean} isIELikeWebkit
 * @property {Boolean} isChrome
 * @property {Boolean} isSamsung
 * @property {Boolean} isFirefox
 * @property {Boolean} isAndroid
 * @property {Boolean} isSafari
 * @property {Boolean} isWebview
 */
function getBrowser() {
  let matched;
  let browser = {
    name: 'unknown',
    version: '0.0.0',
  };
  if ((matched = UA.match(/(?:UCWEB|UCBrowser\/)([\d\.]+)/))) {
    browser = {
      name: 'UC',
      isUC: true,
      version: matched[1],
    };
  } else if ((matched = UA.match(/MQQBrowser\/([\d\.]+)/))) {
    browser = {
      name: 'QQ',
      isQQ: true,
      version: matched[1],
    };
  } else if ((matched = UA.match(/(?:Firefox|FxiOS)\/([\d\.]+)/))) {
    browser = {
      name: 'Firefox',
      isFirefox: true,
      version: matched[1],
    };
  } else if (
    (matched = UA.match(/MSIE\s([\d\.]+)/)) ||
    (matched = UA.match(/IEMobile\/([\d\.]+)/))
  ) {
    browser = {
      version: matched[1],
    };

    if (UA.match(/IEMobile/)) {
      browser.name = 'IEMobile';
      browser.isIEMobile = true;
    } else {
      browser.name = 'IE';
      browser.isIE = true;
    }

    if (UA.match(/Android|iPhone/)) {
      browser.isIELikeWebkit = true;
    }
  } else if ((matched = UA.match(/(?:Chrome|CriOS)\/([\d\.]+)/))) {
    browser = {
      name: 'Chrome',
      isChrome: true,
      version: matched[1],
    };

    if ((matched = UA.match(/Opera|OPR\//))) {
      browser = {
        name: 'Opera',
        isOpera: true,
        version: matched[1],
      };
    }

    if ((matched = UA.match(/SAMSUNG|Samsung|samsung/))) {
      browser.isSamsung = true;
    }

    if (UA.match(/Version\/[\d+\.]+\s*Chrome/)) {
      browser.name = 'Chrome_Webview';
      browser.isWebview = true;
    }
  } else if (!!UA.match(/Safari/) && (matched = UA.match(/Android[\s\/]([\d\.]+)/))) {
    browser = {
      name: 'Android',
      isAndroid: true,
      version: matched[1],
    };
  } else if (UA.match(/iPhone|iPad|iPod/)) {
    if (UA.match(/Safari/) && (matched = UA.match(/Version\/([\d\.]+)/))) {
      browser = {
        name: 'Safari',
        isSafari: true,
        version: matched[1],
      };
    } else if ((matched = UA.match(/OS ([\d_\.]+) like Mac OS X/))) {
      browser = {
        name: 'iOS_Webview',
        isWebview: true,
        version: matched[1].replace(/\_/g, '.'),
      };
    }
  }
  return browser;
}

function getAppName() {
  const arr = [
    [/(?:FBAN\/MESSENGERForiOS)|(?:FB_IAB\/MESSENGER)/i, 'MESSENGER'],
    [/FBAN\/MESSENGERLiteForiOS/i, 'MESSENGER_LITE'],
    [/;fbav\/([\w\.]+);/i, 'FB'], // android
    [/FBAN\/FBIOS/, 'FB'], // ios
    [/Zalo/i, 'ZALO'],
    [/WhatsApp/i, 'WHATS_APP'],
    [/Viber/i, 'VIBER'],
    [/Twitter/i, 'TWITTER'],
    [/Snapchat/i, 'SNAPCHAT'],
    [/Line/i, 'LINE'],
    [/Instagram/i, 'INSTAGRAM'],
  ];
  let item;
  let i = 0;
  while ((item = arr[i])) {
    // eslint-disable-line no-cond-assign
    if (UA.match(item[0])) {
      return item[1];
    }
    i += 1;
  }
}

/**
 * @type {Object}
 * @memberof lib.env
 * @property {String} name - Android/AndroidPad/iPhone/iPod/iPad/Windows Phone/unknown
 * @property {lib.env~Version} version
 * @property {Boolean} isWindowsPhone - Windows Phone
 * @property {Boolean} isIPhone - iPhone/iTouch
 * @property {Boolean} isIPad - iPad
 * @property {Boolean} isIOS - iOS
 * @property {Boolean} isAndroid - Android
 * @property {Boolean} isAndroidPad - Android
 */
function getOsSystem() {
  let matched;
  let os = {};

  if ((matched = UA.match(/Windows\sPhone\s(?:OS\s)?([\d\.]+)/))) {
    os = {
      name: 'Windows Phone',
      isWindowsPhone: true,
      version: matched[1],
    };
  } else if (!!UA.match(/Safari/) && (matched = UA.match(/Android[\s\/]([\d\.]+)/))) {
    os = {
      version: matched[1],
    };

    if (UA.match(/Mobile\s+Safari/)) {
      os.name = 'Android';
      os.isAndroid = true;
    } else {
      os.name = 'AndroidPad';
      os.isAndroidPad = true;
    }
  } else if ((matched = UA.match(/(iPhone|iPad|iPod)/))) {
    const name = matched[1];

    if ((matched = UA.match(/OS ([\d_\.]+) like Mac OS X/))) {
      os = {
        name,
        isIPhone: name === 'iPhone' || name === 'iPod',
        isIPad: name === 'iPad',
        isIOS: true,
        version: matched[1].split('_').join('.'),
      };
    }
  }

  if (!os) {
    os = {
      name: 'unknown',
      version: '0.0.0',
    };
  }

  return os;
}

function parseExternalLinkParams(url) {
  const params = window.location.search.slice(1);
  if (params.length > 0) {
    const splitParams = params.split('&');
    const result = splitParams
      .filter(item =>
        EXTERNAL_KEYS.indexOf(item.split('=')[0]) > -1 && url.indexOf(item.split('=')[0]) < 0)
      .join('&');
    if (result.length > 0) {
      return `&${result}`;
    }
  }
  return '';
}

function getSellerKey() {
  const pathName = window.location.pathname;
  // const pathName = '/shop/unilever-malaysia/RedSales2018.htm';
  const splitPath = pathName.split('/');
  let sellerKeyIndex = -1;
  if (splitPath && pathName.indexOf('shop/') > -1) {
    splitPath.forEach((sp, index) => {
      if (sp === 'shop' && sellerKeyIndex === -1) {
        sellerKeyIndex = index + 1;
        return;
      }
    });
    return splitPath[sellerKeyIndex];
    // return pathName.replace('/shop/', '');
  }
  return 'notfound';
}

function getInnerId() {
  if (
    window.pdpTrackingData &&
    window.pdpTrackingData.page &&
    window.pdpTrackingData.page.xParams
  ) {
    const xParams = window.pdpTrackingData.page.xParams;
    const innerParam = xParams.split('&').filter(param => param.indexOf('_p_item') > -1);
    if (innerParam.length < 1) {
      return 'notfound';
    }
    return innerParam[0].split('=')[1].split('-')[0];
  }
  return 'notfound';
}

/**
 * get query param from url
 * @param {string} key - query key
 * @param {string} [url=location.search] - url, default to location.search
 * @return {string} query param value
 */
function getQuery(key, url) {
  url = url || window.location.search;
  const hashIndex = url.indexOf('#');
  if (hashIndex > 0) {
    url = url.substr(0, hashIndex);
  }

  const keyMatches = url.match(new RegExp(`[?|&]${encodeURIComponent(key)}=([^&]*)(&|$)`));
  if (keyMatches && keyMatches[1] === '%s') {
    return keyMatches[1];
  }
  return keyMatches ? decodeURIComponent(keyMatches[1]) : '';
}

function getSearchKeyword() {
  // const search = '?q=samsung&from=input&spm=a2o4m.search.top.1';
  return getQuery('q') || 'notfound';
}

/**
 * Get Tracking Data for Click Server
 */
function getClickServerTrackingData() {
  const o = {};
  let hasTrackParams;
  function getSetKeyToData(key, fn, fnKey) {
    const val = fn(fnKey || key);
    if (val) {
      hasTrackParams = true;
      o[key] = val;
      return true;
    }
    return false;
  }
  // https://aone.alibaba-inc.com/req/23404820
  if (!getSetKeyToData('i_exlaz', getQuery)) {
    if (!getSetKeyToData('exlaz', getQuery)) {
      if (!getSetKeyToData('i_exlaz', getCookie)) {
        getSetKeyToData('exlaz', getCookie);
      }
    }
  }
  getSetKeyToData('click_id', getCookie, 'lzd_click_id');
  getSetKeyToData('gclid', getQuery);

  // add default track param
  // in order to track organic traffic CR
  if (!hasTrackParams) {
    o.exlaz = getDefaultExlaz();
  }

  return o;
}

// TODO: sync up with Xingjue about the rule
function getCampaignQuery() {
  const host = window.location.host;
  const subDomain = host.split('.')[0];
  const pathName = window.location.pathname + window.location.search;
  // const host = 'www.lazada.sg';
  // const pathName = '/pages/payday?hybrid=1';
  if (subDomain && pathName) {
    return {
      pathName,
      subDomain,
    };
  }
  return {
    pathName: 'notfound',
    subDomain: 'notfound',
  };
}

function getQueries() {
  return window.location.search;
}

function formatOptions(type, region) {
  let options = {};
  options.venture = region.toLowerCase();
  options.url = encodeURIComponent(window.location);
  if (type === 'shop') {
    options.sellerKey = getSellerKey() + getQueries();
  } else if (type === 'pdp') {
    options.innerId = getInnerId();
  } else if (type === 'search') {
    options.keyword = getSearchKeyword();
    const p = location.pathname;
    let key = p;
    if (p.startsWith('/tag/')) {
      let arr = [].slice.call(document.head.getElementsByTagName('link'));
      arr = arr.filter(el => el.getAttribute('rel') === 'alternate');
      if (arr.length) {
        const dlink = arr[0];
        const href = dlink.getAttribute('href');
        const url = new URL(href);
        key = url.searchParams.get('url_key');
      }
    } else {
      if (!key.endsWith('/')) {
        key += '/';
      }
      const arr = [];
      if (options.keyword !== 'notfound') {
        arr.push(`q=${options.keyword}`);
      }
      const wangpu = getQuery('from') === 'wangpu';
      if (wangpu) {
        arr.push('from=wangpu');
      }

      if (arr.length) {
        key += `?${arr.join('&')}`;
      }
    }
    options.url_key = encodeURIComponent(key);
  } else if (type === 'campaign') {
    options = Object.assign(options, getCampaignQuery());
  }
  return options;
}

function formatCustomizeUrl(urlMap) {
  if (!(urlMap && urlMap.length)) {
    return '';
  }

  const currentLocation = window.location.href;

  const filterMapUrl = urlMap.filter((urlItem) => {
    const srcUrlSplit = urlItem.srcUrl.split('?');
    const srcUrlPathname = srcUrlSplit[0];
    const srcUrlSearch = srcUrlSplit[1];
    let searchFilter = '';

    if (srcUrlSearch) {
      const srcUrlSearchSplit = srcUrlSearch.split('&');
      searchFilter = `${srcUrlSearchSplit
        .filter(item => item.indexOf('scm') < 0 && item.indexOf('spm') < 0)
        .join('&')}`;
      if (searchFilter) {
        searchFilter = `?${searchFilter}`;
      }
    }
    const srcUrlFormat = `${srcUrlPathname}${searchFilter}`;
    return currentLocation.indexOf(srcUrlFormat) >= 0;
  });

  if (filterMapUrl.length) {
    return filterMapUrl[0].destUrl;
  }
  return '';
}

/**
 * url examples
 * home page
 *   https://www.lazada.sg/shop/james-shop-10086/?langFlag=en&spm=a2o70.store_campaign.categoryBar_123347.0
 * campaign page
 *   https://www.lazada.sg/shop/james-shop-10086/?langFlag=en&path=promotion-23-0.htm&tab=promotion&spm=a2o70.store_hp.categoryBar_123347.2
 * voucher page
 *   https://www.lazada.sg/shop/i/landing_page/voucher?sellerId=213&voucherId=8187641600213&wh_weex=true&scene=store&domain=store&spm=a2o70.store_hp.voucher_15089006.8187641600213
 * custom page
 *   https://www.lazada.com.my/shop/casio-official-store/WSD-F30.htm
 * @param {String} type
 * @returns {Boolean}
 */
function isShopCustomPage(type) {
  const pathSections = window.location.pathname.split('/').filter(s => s !== '' && s !== 'shop');
  return type === 'shop' && pathSections.length > 1;
}

function getFixedType(type) {
  const path = location.pathname;
  const arr = path.split('/');
  // It should be open by default deeplink
  // if it's a shop custom page or voucher page
  if (isShopCustomPage(type)) {
    debugLog('isShopCustomPage: true');
    type = 'default';
  } else if (arr[arr.length - 1] === 'common-error') {
    type = 'common-error';
  }
  return type;
}

function formatDeepIntentLink(type, region) {
  const options = formatOptions(type, region);
  const map = {
    hp: 'intent://{venture}',
    shop: 'intent://{venture}/shop/{sellerKey}',
    pdp: 'intent://{venture}/d?p={innerId}&uri={url}',
    search: 'intent://{venture}/page?url_key={url_key}',
    campaign: 'intent://{venture}/web/{subDomain}{pathName}',
    storestreet: 'intent://{venture}/store_street',
  };
  const intentLink = (map[type] || 'intent://{venture}/web?url={url}').replace(
    /(\{([a-zA-Z]\w+)\})/g,
    (_, __, key) => options[key] || ''
  );
  return intentLink;
}

// eslint-disable-next-line
function formatDeeplink(type, region, urlMap) {
  let newDeepLink = DEEP_LINK[type];

  const customDeepLink = formatCustomizeUrl(urlMap);
  if (customDeepLink.length) {
    newDeepLink = customDeepLink;
  }

  const options = formatOptions(type, region);
  // if it's homepage.
  if (type === 'hp') {
    newDeepLink = `lazada://${region}`;
  } else if (type === 'storestreet') {
    // if it's storestreet.
    newDeepLink = `lazada://${region}/store_street`;
  }

  if (!DEEP_LINK[type]) {
    newDeepLink = `lazada://${region}`;
  }

  newDeepLink = newDeepLink.replace(DEEP_LINK_REG, (matches) => {
    if (matches.indexOf('venture') > -1) {
      return options.venture;
    }
    if (matches.indexOf('url_key') > -1) {
      return options.url_key;
    }
    if (matches.indexOf('url') > -1) {
      return options.url;
    }
    if (matches.indexOf('sellerKey') > -1) {
      return options.sellerKey;
    }
    if (matches.indexOf('innerId') > -1) {
      return options.innerId;
    }
    if (matches.indexOf('keyword') > -1) {
      return options.keyword;
    }
    if (matches.indexOf('subdomain') > -1) {
      return options.subDomain;
    }
    if (matches.indexOf('path') > -1) {
      return options.pathName;
    }
  });

  if (newDeepLink.indexOf('notfound') > -1) {
    newDeepLink = `lazada://${region}`;
  }

  if (type === 'pdp') {
    newDeepLink = `${newDeepLink}&uri=${encodeURIComponent(window.location.href)}`;
  }

  return newDeepLink;
}

const dsource = 'smb';
// eslint-disable-next-line no-nested-ternary
const platform = iOS ? 'ios' : isAndroid ? 'android' : 'unknown';

/* hack flag for build pure js */

function LazadaSmartBanner(globalConfigOption) {
  /**
   * init event binding by checking the header content is ready or not;
   * @method init
   */
  this.init = function () {
    this.autoOpen = false;
    this.autoDownload = false;
    this.inAliApp = this.removeInNativeApp();

    this.isDisabled = false;
    let disabledType;
    if (this.inAliApp) {
      this.isDisabled = true;
      disabledType = 'isAliApp'.toUpperCase();
    }
    if (this.removeIfDisabled()) {
      this.isDisabled = true;
      disabledType = 'disableByUrlParam'.toUpperCase();
    }
    if (this.isSmbDisable() || getSmbStrategy().disableSmb) {
      this.isDisabled = true;
      disabledType = 'disableByHttpCookie'.toUpperCase();
    }
    if (this.shouldDisableSMB()) {
      this.isDisabled = true;
      disabledType = 'disableBySpecialRule'.toUpperCase();
    }

    if (this.isDisabled) {
      gd.exposure('/smb.delivery.disabled', {
        disabledType,
      });
      return;
    }

    this.$smartBanner = document.getElementById('J_Banner');
    this.$close = document.getElementById('J_SMBColose');

    this.region = regionID;
    this.language =
      (globalConfigOption.wh_language && globalConfigOption.wh_language.toLowerCase()) || 'en';
    this.osSystem = getOsSystem();
    this.browser = getBrowser();
    this.position =
      (globalConfigOption.wh_position && globalConfigOption.wh_position.toLowerCase()) || 'top';

    // //TODO: for dev.
    // if (globalConfigOption.pageType) {
    //   this.pageType = globalConfigOption.pageType;
    // }

    this.getBannerPositioned();
    this.initCustomConfig();
    exposeGoldlog();

    // revamp banner init
    this.initTopFixedBanner();

    if (typeof navigator.getInstalledRelatedApps === 'function') {
      gd.exposure('/smb.delivery.app_api_ava');
    }

    // debugLog(`ab=${ab}`);
    // if (ab === 'A' || ab === 'B' && !this.isCookieChecked() && !isGoogleBot(UA)) {
    //   this.setCookieChecked();
    //   gd.exposure('/smb.delivery.modal_exp');
    //   initModalUI(this);
    // }
  };

  // init revamp smart banner (fix on the top of pdp)
  this.initTopFixedBanner = () => {
    try {
      // first phase only display in pdp
      if (window.sBannerConfig && window.sBannerConfig.wh_channel !== 'pdp') {
        return;
      }

      const $globalHeader = document.getElementById('lzd-global-header');
      if (!$globalHeader) {
        return;
      }

      const $backBtn = document.querySelector('a.back');
      const $topFixedBanner = document.getElementById('J_Smart_Banner_Bottom');
      $globalHeader.insertBefore($topFixedBanner, $backBtn);
      if ($topFixedBanner.classList.contains('display-none')) {
        $globalHeader.classList.add('with-smart-banner');
        $topFixedBanner.classList.remove('display-none');
      }

      let expLock = false;
      if (window.scrollY >= 88) {
        expLock = true;
        revampGoldLog('EXP');
      } else {
        const scrollHandler = () => {
          if (window.scrollY >= 88 && !expLock) {
            expLock = true;
            revampGoldLog('EXP'); // TODO: time to send exp need to be polished
            window.removeEventListener('scroll', scrollHandler);
          }
        };
        window.addEventListener('scroll', scrollHandler);
      }
    } catch (e) {
      const logger = console;
      logger.info('top fixed smb init failed', e);
    }
  };

  this.removeIfDisabled = () => {
    const search = window.location.search;
    const matchedDisableDeeplink = /disable\_deeplink\=true/i.test(search);
    if (matchedDisableDeeplink) {
      const mainBanner = document.getElementById('J_Banner');
      mainBanner.style.display = 'none';
      return true;
    }
    return false;
  };

  this.removeInNativeApp = () => {
    const matchedAliApp = /lazada|AliApp/i.test(UA);
    // fixed uc browser windvane's bug
    if (matchedAliApp) {
      let appName = '';
      const matchResult = UA.match(/AliApp\(([a-z-A-Z]{1,20})\/(\d+(\.\d+){0,3})?\)/i);
      if (matchResult && matchResult.length >= 3) {
        appName = matchResult[1];
      }
      if (appName && (appName.toLowerCase() === 'la-android' || appName.toLowerCase() === 'la')) {
        const mainBanner = document.getElementById('J_Banner');
        mainBanner.style.display = 'none';
      }
      return true;
    }

    if (this.isCookieExist()) {
      return true;
    }

    return false;
  };

  this.initCustomConfig = function () {
    this.customConfig = {};
    const smartbannerConfig = document.getElementById('smartbanner-config').text;
    try {
      this.customConfig = JSON.parse(smartbannerConfig);
    } catch (e) {
      gd.exposure('/smb.delivery.error', {
        errorType: 'SmartBannerConfigParseError'.toUpperCase(),
        smartbannerConfig,
      });
      console.error('not able to parse JSON', e);
    }

    const smbStrategy = getSmbStrategy();
    this.autoOpen = smbStrategy.smbAutoOpen;
    this.autoDownload = smbStrategy.smbAutoDownload;

    // disable autoOpen for SEO traffic
    if (isSEO() || isSearchBots()) {
      this.autoOpen = false;
      this.autoDownload = false;
    }

    const channleType = window.lzdGlobalConfigOption && window.lzdGlobalConfigOption.wh_channel;
    let pageType =
      channleType && channleType !== 'default' ? channleType : this.customConfig.pageType;
    if (pageType === 'hp' && location.pathname !== '/') {
      pageType = 'default';
    }
    this.pageType = getFixedType(pageType) || 'default';

    const tryOpenApp = () => {
      // try to open app when configured auto open
      if (this.autoOpen) {
        this.openApp({ isAuto: true, type: 0 });
        if (this.autoDownload) {
          debugLog('#23');
          this.downloadApp();
        }
        const isCookieChecked = this.isCookieChecked();
        debugLog(`#21 isCookieChecked = ${isCookieChecked}`);
        if (this.osSystem.isIPhone && this.browser.isSafari && !isCookieChecked) {
          debugLog('#22');
          this.setCookieChecked();
        } else if (
          this.browser.isChrome &&
          !isCookieChecked &&
          (this.region === 'sg' ||
            this.region === 'ph' ||
            this.region === 'my' ||
            this.region === 'vn')
        ) {
          this.setCookieChecked();
        }
      } else {
        gd.exposure('/smb.delivery.disabled', {
          disabledType: 'disableByTurnOffAutoOpen'.toUpperCase(),
          smartbannerConfig,
        });
      }

      if (this.$smartBanner) {
        if (this.customConfig.bannerImage) {
          this.$smartBanner.style.backgroundImage = `url(${this.customConfig.bannerImage})`;
        } else {
          this.$smartBanner.style.display = 'none';
        }
      }

      if (document.getElementById('J_SMB_Title') && this.customConfig.title) {
        document.getElementById('J_SMB_Title').innerText = this.customConfig.title;
      }
      if (document.getElementById('J_SMB_SubTitle') && this.customConfig.subTitle) {
        document.getElementById('J_SMB_SubTitle').innerText = this.customConfig.subTitle;
      }
      if (document.getElementById('J_SMB_Button') && this.customConfig.button) {
        document.getElementById('J_SMB_Button').innerText = this.customConfig.button;
      }
      this.bindEvents();
    };

    tryOpenApp();
  };

  this.resetDownloadLink = () => {
    if (this.downloadTimer) {
      window.clearTimeout(this.downloadTimer);
      this.downloadTimer = null;
    }
    this.removeCookieChecked();
  };

  // type === 0 : previous top smart banner
  // type === 1 : top fixed smart banner (only in pdp) 2020.05
  this.openApp = (options = { type: 0 }) => {
    debugLog(`dfrom=${this.pageType}, dauto=${options.isAuto}`);

    const major = Number(this.browser.version.split('.')[0]);
    let useIntent = isAndroid && getQuery('useIntent') === 'true';
    if (isAndroid && major >= 25 && this.browser.name === 'Chrome') {
      useIntent = true;
    }

    if (!this.pageType) {
      debugLog('#4.1 no page type');
      gd.exposure('/smb.delivery.disabled', {
        disabledType: 'noSetPageType'.toUpperCase(),
      });
      return;
    } else if (this.pageType !== 'campaign' && this.isCookieChecked() && options.isAuto === true) {
      gd.exposure('/smb.delivery.disabled', {
        disabledType: 'disableByTiredControl'.toUpperCase(),
        disableInFatigue: true,
      });
      debugLog('#4.1 cookie checked');
      return;
    }

    // eslint-disable-next-line max-len
    let deepLink = useIntent
      ? formatDeepIntentLink(this.pageType, this.region)
      : formatDeeplink(this.pageType, this.region, this.customConfig.urlMap);
    const AB = getAbTestingBucket();
    const browser = `${platform}_${getAppName() || this.browser.name}`;
    const omflag = getOMFlag();
    const mkttid = getMkttidWithEffect();
    const dfrom = this.pageType; // 'hp' | 'storestreet' | 'pdp' | 'default'
    const dauto = options.isAuto ? 1 : 0;
    const lazShareInfo = getQuery('laz_share_info') || getCookie('laz_share_info');
    if (deepLink.indexOf('?') === -1) {
      deepLink += '?';
    }
    deepLink = appendQueriesForAppTracking(deepLink, options);

    // eslint-disable-next-line max-len
    deepLink = `${deepLink}&dsource=${dsource}&dauto=${dauto}&dfrom=${dfrom}&omflag=${omflag}&browser=${encodeURIComponent(browser)}&mkttid=${mkttid}`;
    if (lazShareInfo) {
      deepLink = `${deepLink}&laz_share_info=${lazShareInfo}`;
    }
    if (AB) {
      deepLink = `${deepLink}&smb_ab=${AB}`;
    }
    debugLog(`#7 broswer=${this.browser.name}, deepLink=${deepLink}`);

    if (useIntent) {
      // const intent = `${deepLink}#Intent;scheme=lazada;package=com.lazada.android;end`;
      // const fallback = options.isAuto ? '' : 'S.browser_fallback_url=http://www.lazada.sg/;';
      const cstd = getClickServerTrackingData();
      const cstdStr = Object.keys(cstd)
        .map(key => `${key}=${cstd[key]}`)
        .join('&');
      const S = `S.market_referrer=${encodeURIComponent(encodeURIComponent(cstdStr))};`;
      // const fallback = `S.browser_fallback_url=${encodeURIComponent(location.pathname + location.search + location.hash)};`;
      deepLink = `${deepLink}#Intent;scheme=lazada;package=com.lazada.android;${S}end`;
    }

    debugLog(`this.osSystem.isIPhone = ${this.osSystem.isIPhone} && this.browser.name = ${
      this.browser.name
    }`);
    // ios 9.0, need for a tag
    const ios9SafariFix = this.osSystem.isIPhone && this.browser.isSafari;
    if (ios9SafariFix) {
      debugLog('#8 ios9SafariFix = true');
      this.userAnchorLink(deepLink);
    } else if (this.osSystem.isIPhone && this.browser.name === 'iOS_Webview') {
      debugLog('#8 ios webview');
      this.userAnchorLink(deepLink);
    } else if (this.browser.isChrome) {
      debugLog('#9 isChrome');
      if (this.osSystem.isIPhone) {
        debugLog('#10 chrome isIPhone');
        this.userAnchorLink(deepLink);
      } else if (
        this.browser.isSamsung &&
        (this.osSystem.version.indexOf('4.4') === 0 || this.osSystem.version.indexOf('4.3') === 0)
      ) {
        debugLog('#11 chrome isSamsung');
        // for the case of samsung 4.4/4.3
        deepLink = 'intent://#Intent;scheme=lazada;package=com.lazada.android;end';
        this.redirectLocation(deepLink);
      } else {
        debugLog('#12 chrome other');
        this.redirectLocation(deepLink);
      }
    } else if (this.browser.isFirefox) {
      debugLog('#13 firefox');
      if (this.osSystem.isIPhone) {
        debugLog('#13 ios firefox');
        this.userAnchorLink(deepLink);
      } else {
        debugLog('#13 not ios firefox');
        this.callInIframe(deepLink);
      }
    } else if (this.browser.isOpera) {
      debugLog('#14 opera');
      this.callInIframe(deepLink);
    } else {
      debugLog('#15 other');
      this.callInIframe(deepLink);
    }
    if (deepLink) {
      const deepLinkEncoded = encodeURIComponent(deepLink);
      this.deepLinkEncoded = deepLinkEncoded;
      gd.click('/smb.delivery.click', {
        dsource,
        dauto,
        dfrom,
        deviceType,
        deepLink: deepLinkEncoded,
        browser,
        referrer: document.referrer,
        omflag,
        smb_ab: AB,
      });
    }
  };

  this.callInIframe = (url) => {
    if (!this.iframe) {
      this.iframe = document.createElement('iframe');
      this.iframe.id = `callapp_iframe_${Date.now()}`;
      this.iframe.frameborder = '0';
      this.iframe.style.cssText = 'display:none;border:0;width:0;height:0;';
      document.body.appendChild(this.iframe);
    }

    this.iframe.src = url;
  };

  this.redirectLocation = (url) => {
    setTimeout(() => {
      if (this.inAliApp) {
        window.location.replace(url);
      } else {
        window.location.href = url;
      }
    }, 200);
  };

  this.userAnchorLink = (url, blankString) => {
    setTimeout(() => {
      const e = document.createEvent('HTMLEvents');
      e.initEvent('click', false, false);
      let a = document.querySelector('#temp-smb-link');
      if (!a) {
        a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('id', 'temp-smb-link');
        if (blankString) {
          a.setAttribute('target', blankString);
        }
        a.style.display = 'none';
        document.body.appendChild(a);
      }
      a.dispatchEvent(e);
    }, 200);
  };

  // 这里的 type 用来区分埋点
  this.downloadApp = (startTime, type = 0) => {
    // alert('timer');
    // alert(this.downloadTimer);
    if (this.downloadTimer) {
      return;
    }
    const timeout = 1500;
    this.downloadTimer = setTimeout(() => {
      const endTime = Date.now();
      if (!startTime || endTime - startTime < timeout + 300) {
        if (APP_DOWNLOAD_LINK[this.region]) {
          debugLog('use track link to download app');
          const options = {
            // url: this.deepLinkEncoded,
            lp: encodeURIComponent(window.location.href),
            mkttid: getMkttidWithEffect(),
          };
          debugLog(this.deepLinkEncoded);
          // eslint-disable-next-line max-len
          const redirectURL = APP_DOWNLOAD_LINK[this.region].replace(
            /(\{([a-zA-Z]\w+)\})/g,
            (_, __, key) => options[key] || ''
          );
          debugLog(`redirectURL=${redirectURL}`);
          this.redirectLocation(redirectURL);
        } else if (this.osSystem.isIOS) {
          this.redirectLocation(iosStore);
        } else {
          // append cookie from Click-Server to Google Play Referrer
          const cstd = getClickServerTrackingData();
          const cstdStr = Object.keys(cstd)
            .map(key => `${key}=${cstd[key]}`)
            .join('&');
          this.redirectLocation(androidStore + (cstdStr ? `&referrer=${encodeURIComponent(cstdStr)}` : ''));
        }
        this.resetDownloadLink();
        if (type === 1) {
          revampGoldLog('CLK', 'download');
        } else {
          clickGoldlog('download');
        }
      }
    }, timeout);
  };

  this.getBannerPositioned = () => {
    if (!window.sBannerConfig.display) {
      document.body.removeChild(this.$smartBanner);
      return;
    }

    if (window.sBannerConfig.wh_position.toLowerCase() === 'top') {
      const $smartbannerSlot = document.getElementById('smartbanner-slot');
      if ($smartbannerSlot) {
        $smartbannerSlot.appendChild(this.$smartBanner);
      } else {
        const $firstBodyChild = document.body.firstChild;
        document.body.insertBefore(this.$smartBanner, $firstBodyChild);
      }
    } else {
      document.body.appendChild(this.$smartBanner);
      this.$smartBanner.className += ' smart-banner-bottom-fixed';
    }
  };

  this.isCookieChecked = () => getCookie('smart_banner') === 'checked';

  this.setCookieChecked = () => {
    const duration = 60 * 10;
    setCookie('smart_banner', 'checked', { expires: duration });
  };

  this.removeCookieChecked = () => {
    removeCookie('smart_banner', {});
  };

  this.isCookieExist = () => getCookie('smart_banner_exist') === 'checked';

  this.setCookieExist = () => {
    const duration = 60 * 60;
    setCookie('smart_banner_exist', 'checked', { expires: duration });
  };

  this.isSmbDisable = () => getCookie('disable_smb') === 'true';

  this.shouldDisableSMB = () => {
    const h = location.hostname;
    const p = location.pathname;
    const isPDP = p.startsWith('/products');
    if (isPDP && /\-s[0-9]/.test(p) === false) {
      return true;
    }
    if (h.indexOf('redmart') > -1) {
      return true;
    }
  };

  this.bindEvents = () => {
    const $button = document.getElementById('J_SmartButton');

    $button.onclick = throttle(() => {
      this.removeCookieChecked();
      this.openApp({ type: 0 });
      setTimeout(() => {
        const startTime = Date.now();
        this.downloadApp(startTime);
      }, 400);
    }, 2000);

    this.$close.onclick = () => {
      clickGoldlog('close');
      this.setCookieExist();
      this.$smartBanner.style.display = 'none';
    };

    const $newBanner = document.getElementById('J_Smart_Banner_Bottom');
    $newBanner.onclick = () => {
      this.removeCookieChecked();
      this.openApp({ type: 1 }); // type equal 1 means revamp smart banner in pdp 2020.05
      setTimeout(() => {
        const startTime = Date.now();
        this.downloadApp(startTime, 1);
      }, 300);
    };
  };
}

function init() {
  let smartBanner;
  const smartConfig = window.lzdGlobalConfigOption;
  if (smartConfig && smartConfig.specialEntrance && !isShareUrl()) {
    const entranceStr = smartConfig.specialEntrance;
    const entranceArr = entranceStr.split(',');
    let avoidInSpEntrance = false;
    if (UA) {
      const ua = UA.toLowerCase();
      entranceArr.forEach((str) => {
        if (str && ua.indexOf(str.toLowerCase()) >= 0) {
          avoidInSpEntrance = true;
        }
      });
    }
    if (avoidInSpEntrance) {
      gd.exposure('/smb.delivery.disabled', {
        disabledType: 'avoidInSpEntrance'.toUpperCase(),
        specialEntrance: smartConfig.specialEntrance,
      });
      return;
    }
  }
  if (window.mQuery) {
    smartBanner = new LazadaSmartBanner(window.lzdGlobalConfigOption);
  } else {
    smartBanner = new LazadaSmartBanner({ wh_site: window.sBannerConfig.wh_site });
  }
  smartBanner.init();
}

// eslint-disable-next-line no-unused-vars
function initModalUI(smb) {
  const html = `
    <div class="smb-modal-wrap">
      <div class="smb-modal-mask"></div>
      <div class="smb-modal-main">
        <h1 class="smb-modal-title">Want more discounts?</h1>
        <p class="smb-modal-content">Open in Lazada App to get more deals and discounts</p>
        <div class="smb-modal-ft">
          <a class="J_smb_modal_open smb-modal-btn primary" href="javascript:void(0);">Open in Lazada App</a>
          <a class="J_smb_modal_close smb-modal-btn" href="javascript:void(0);">Stay</a>
        </div>
      </div>
    </div>
  `;
  const node = fragmentFromString(html);
  document.body.appendChild(node);

  const $close = document.querySelector('.J_smb_modal_close');
  if ($close) {
    $close.addEventListener(
      'click',
      () => {
        gd.click('/smb.delivery.modal_close');
        closeModal();
      },
      false
    );
  }

  const openApp = function () {
    smb.openApp();
    closeModal();
    gd.click('/smb.delivery.modal_open');
  };

  const $open = document.querySelector('.J_smb_modal_open');
  if ($open) {
    $open.addEventListener('click', openApp, false);
  }

  disableScrolling();
}

function closeModal() {
  enableScrolling();
  const modal = document.querySelector('.smb-modal-wrap');
  if (modal) {
    modal.parentNode.removeChild(modal);
  }
}

function disableScrolling() {
  document.body.style.overflow = 'hidden';
}

function enableScrolling() {
  document.body.style.overflow = 'initial';
}

// query if dom is ready then init the Header component
// const container = document.querySelector('#J_Banner');
// if (container) {
//   init();
// } else {
// window.addEventListener('DOMContentLoaded', init);
// }
console.log('smartbanner init');
gd.exposure('/smb.delivery.lp', {
  smb_ab: getAbTestingBucket(),
});
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
} else {
  // Loading still in progress.
  window.addEventListener('DOMContentLoaded', init);
}
