// 'use strict';
// import { Cookie } from '@ali/lzdmod-common-info/index';
// import $ from '@ali/mui-zepto/zepto';
// import $i18n from '@ali/lzdmod-smart-banner/i18n';

// const iosStore = "//itunes.apple.com/app/id785385147";
// const iosApp = "lazada://";

// const androidStore = "https://play.google.com/store/apps/details?id=com.lazada.android";
// const androidApp =  'http://info.lazada.co';

// class SmartBanner {
//   constructor (box) {
//     this.bindEvents();
//     this.goToStore();
//     this.initDemo(box);
//   }

//   goToStore() {
//     const country = window.g_config.regionID.toLocaleLowerCase();
//     const user = window.sBannerConfig.detector;
//     const aTag = document.getElementById('J_Tag');

//     if(user.os.fullVersion === 'ios') {
//       aTag.setAttribute("href", iosApp)
//       setTimeout(function(){
//         aTag.setAttribute("href", iosStore)
//       }, 500);
//     } else if (user.os.fullVersion === 'android') {
//       aTag.setAttribute("href", androidApp)
//       setTimeout(function(){
//         aTag.setAttribute("href", androidStore)
//       }, 500);
//     }
//   }

//   bindEvents () {
//     const $close = document.getElementById('J_SMBColose');
//     const $banner = document.getElementById('J_SMBBanner');

//     // Cookie.set('smart_banner', null)
//     var today = new Date();
//     var expire = new Date();
//     expire.setTime(today.getTime() + 3600000*24*7);

//     // reset Cookie
//     if(expire.getTime() <= new Date().getTime()) {
//       Cookie.set('smart_banner', null)
//     }

//     if (Cookie.get('smart_banner') !== 'checked') {
//       $banner.style.display = 'inline-block';
//     }

//     $close.onclick = () => {
//       Cookie.set('smart_banner', 'checked')
//       $banner.style.display = 'none';
//     }
//   }
// }

// export default (box) => {
//   new SmartBanner(box)
// }
