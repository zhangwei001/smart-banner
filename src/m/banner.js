(function () {
  function LazadaSmartBanner() {
    this.init = function () {
      this.customConfig = {};
      const smartbannerConfig = document.getElementById('smartbanner-config').text;
      try {
        this.customConfig = JSON.parse(smartbannerConfig);
      } catch (e) {
        console.log(e);
      }
      const channleType = window.lzdGlobalConfigOption && window.lzdGlobalConfigOption.wh_channel;
      const pageType = this.customConfig.pageType || channleType || 'default';
      const region = (
        (window.lzdGlobalConfigOption && window.lzdGlobalConfigOption.wh_site) ||
        (window.sBannerConfig && window.sBannerConfig.wh_site) ||
        'sg'
      ).toLowerCase();
      const applink = getApplink(pageType, region);
      this.callApp = new window.LzdCallApp({
        from: pageType,
        deeplink: applink.deeplink,
        intent: applink.intent,
      });
      window.__lzdCallApp = this.callApp;
      const { disableSmb, autoOpen, autoDownloadAfterAutoOpen } = this.callApp.strategy || {};
      const isInNativeApp = /lazada|AliApp/i.test(navigator.userAgent);
      const isDana = /Skywalker/i.test(navigator.userAgent);

      // disable smb
      if (isInNativeApp || isDana || disableSmb) {
        const smartBanner = document.getElementById('J_Banner');
        if (smartBanner) {
          smartBanner.style.display = 'none';
        }
        const smartBannerSlot = document.getElementById('smartbanner-slot');
        if (smartBannerSlot) {
          smartBannerSlot.style.display = 'none';
        }
        const smartBannerHolder = document.querySelector('.smart-banner-holder');
        if (smartBannerHolder) {
          smartBannerHolder.style.display = 'none';
        }
        return;
      }

      // launch app automatically
      if (autoOpen) {
        this.callApp.evokeApp({
          autoType: 1,
          needDownloadOnce: autoDownloadAfterAutoOpen,
        });
      }

      this.renderUI();
    };

    this.renderUI = () => {
      this.$smartBanner = document.getElementById('J_Banner');
      if (this.$smartBanner) {
        if (this.customConfig.bannerImage) {
          let imgSrc = this.customConfig.bannerImage;
          imgSrc = imgSrc.replace(
            '//icms-image.slatic.net/',
            '//lzd-img-global.slatic.net/g/icms/'
          );
          imgSrc = imgSrc.replace(
            '//laz-img-cdn.alicdn.com/',
            '//lzd-img-global.slatic.net/g/tps/'
          );
          this.$smartBanner.style.backgroundImage = `url(${imgSrc})`;
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
      this.getBannerPositioned();
      this.initTopFixedBanner();
    };

    this.bindEvents = () => {
      const $button = document.getElementById('J_SmartButton');
      if ($button) {
        $button.onclick = throttle(() => {
          this.callApp.evokeApp({
            autoType: 0,
            needDownloadOnce: true,
          });
        }, 2000);
      }

      const $close = document.getElementById('J_SMBColose');
      if ($close) {
        $close.onclick = () => {
          this.$smartBanner.style.display = 'none';
        };
      }

      const $newBanner = document.getElementById('J_Smart_Banner_Bottom');
      if ($newBanner) {
        $newBanner.onclick = () => {
          this.callApp.evokeApp({
            autoType: 0,
            needDownloadOnce: true,
          });
        };
      }
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
        } else {
          const scrollHandler = () => {
            if (window.scrollY >= 88 && !expLock) {
              expLock = true;
              window.removeEventListener('scroll', scrollHandler);
            }
          };
          window.addEventListener('scroll', scrollHandler);
        }
      } catch (e) {
        console.log(e);
      }
    };
  }

  function getApplink(type, region) {
    const deeplink = formatDeeplink(type, region);
    return {
      deeplink,
      intent: `${deeplink.replace('lazada://', 'intent://')}#Intent;scheme=lazada;end`,
    };
  }

  function formatDeeplink(type, region) {
    const { url, sellerKey, itemId, skuId, url_key, extraParams } = formatOptions(type);
    if (type === 'hp' && location.pathname === '/') {
      return `lazada://${region}`;
    }
    if (type === 'shop' && sellerKey) {
      return `lazada://${region}/shop/${sellerKey}`;
    }
    if (type === 'pdp' && itemId) {
      return `lazada://${region}/d?itemId=${itemId}&skuId=${skuId || ''}`;
    }
    if (type === 'search' && url_key) {
      return `lazada://${region}/page?url_key=${url_key}&${extraParams}`;
    }

    return `lazada://${region}/web?url=${url}`;
  }

  function formatOptions(type) {
    const options = {};
    options.url = encodeURIComponent(window.location.href);
    if (type === 'shop') {
      options.sellerKey = getSellerKey();
    } else if (type === 'pdp') {
      const { itemId, skuId } = getPdpData();
      options.itemId = itemId;
      options.skuId = skuId;
    } else if (type === 'search') {
      options.url_key = getSearchUrlkey();
      options.extraParams = getExtraParams();
    }
    return options;
  }

  function getSellerKey() {
    const pathname = window.location.pathname;
    // ignore special path
    if (pathname.indexOf('/shop/i/landing_page/') > -1) {
      return;
    }
    const arr = pathname.split('/');
    if (arr[1] === 'shop' && arr[2]) {
      return arr[2];
    }
  }

  function getExtraParams() {
    const paramsArr = [
      'categoryAsc',
      'category',
      'brand',
      'brandAsc',
      'shop_category_ids',
      'price',
      'rating',
      'ppath',
      'service',
      'tab',
      'pfilter',
      'promotion_tag',
      'sb_sv_f',
      'lel_level3_ids_filter',
      'location',
    ];
    return paramsArr.map((str) => {
      const params = getQuery(str);
      return params ? `${str}=${encodeURIComponent(params)}` : '';
    }).filter((str) => {
      return str;
    }).join('&');
  }

  function getSearchUrlkey() {
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
      const keyword = getQuery('q');
      if (keyword) {
        arr.push(`q=${keyword}`);
      }
      const wangpu = getQuery('from') === 'wangpu';
      if (wangpu) {
        arr.push('from=wangpu');
      }
      if (arr.length) {
        key += `?${arr.join('&')}`;
      }
    }
    return encodeURIComponent(key);
  }

  function getPdpData() {
    let itemId;
    let skuId;
    if (
      window.pdpTrackingData &&
      window.pdpTrackingData.page &&
      window.pdpTrackingData.page.xParams
    ) {
      const xParams = window.pdpTrackingData.page.xParams;
      itemId = getQuery('_p_prod', xParams);
      skuId = getQuery('_p_sku', xParams);
    }
    return {
      itemId,
      skuId,
    };
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

  function init() {
    const smartBanner = new LazadaSmartBanner();
    smartBanner.init();
  }

  console.log('smartbanner init');
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    window.addEventListener('DOMContentLoaded', init);
  }
}());
