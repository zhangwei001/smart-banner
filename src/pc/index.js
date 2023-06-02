'use strict';

import $ from '@ali/mui-zepto/zepto';
import $i18n from '@ali/lzdmod-smart-banner/i18n';

class Module {
  constructor(box) {
    this.initView();
    this.bindEvents();
    this.initDemo(box);
  }
  initView() {}

  bindEvents() {}

  initDemo(box) {
    console.log($i18n('hello, my name is %s', 'smart-banner'));
    console.log($i18n('current language: %s', window.g_config.language));
    console.log("I'm a pc module");
    console.log($(box).html());
  }
}

export default (box) => {
  new Module(box);
};
