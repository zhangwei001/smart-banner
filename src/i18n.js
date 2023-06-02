
    'use strict';
    var languageData = {
  "en": {
    "Install Lazada App To get exclusive deals and daily Flash Sale": "Install Lazada App To get exclusive deals and daily Flash Sale",
    "Shop Now": "Shop Now",
    "title": "Lazada App",
    "subTitle": "Register on App to enjoy discount!",
    "button": "Open"
  },
  "id": {
    "Install Lazada App To get exclusive deals and daily Flash Sale": "Download Aplikasi Lazada untuk mendapatkan promosi menarik dari kami!",
    "Shop Now": "Beli Sekarang!",
    "title": "Aplikasi Lazada",
    "subTitle": "Daftar di aplikasi untuk dapatkan diskon Rp20.000",
    "button": "Buka"
  },
  "ms": {
    "Install Lazada App To get exclusive deals and daily Flash Sale": "Guna LZVGEN10, jimat 10% utk belian min. RM150. Terhad RM30 & App shj!",
    "Shop Now": "Beli Sekarang!",
    "title": "Lazada App",
    "subTitle": "Register in Lazada App to get discount",
    "button": "Open"
  },
  "th": {
    "Install Lazada App To get exclusive deals and daily Flash Sale": "ติดตั้งแอพพลิเคชั่นลาซาด้าเพื่อรับข้อเสนอพิเศษเฉพาะคุณเท่านั้น!",
    "Shop Now": "ร้านค้าตอนนี้!",
    "title": "Lazada App",
    "subTitle": "ลงทะเบียนผ่านแอปเพื่อรับส่วนลดสูงสุด 50%",
    "button": "เปิด"
  },
  "vi": {
    "Install Lazada App To get exclusive deals and daily Flash Sale": "Tải Lazada App để nhận thông tin khuyến mãi độc quyền và Flash Sale mỗi ngày",
    "Shop Now": "Mua Ngay!",
    "title": "Ứng dụng Lazada",
    "subTitle": "Đăng ký trên app Lazada để nhận ngay Freeship giảm giá",
    "button": "Mở"
  }
};
    var language = (window.g_config && window.g_config.language) || 'en';
    if (!languageData[language]) {
      language = language.split('-', 1).join('-');
    }
    module.exports = require('@ali/mui-i18n/index').init(languageData[language] || {});
  