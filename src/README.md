# Lazada Smart Banner

<a name="ot5JK"></a>
# 背景
打开 Web 页面，顶部有一个全局的 Smart Banner，背景是一整张图片<br />其中左边 10% 的区域是关闭按钮，右边 90% 是唤醒App<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/143206/1590546031306-c7e11a72-f759-4e3c-999e-96abab88907f.png#align=left&display=inline&height=414&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1334&originWidth=750&size=337497&status=done&style=none&width=233)  ![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/143206/1590564800602-092ece2c-eee2-41db-ba19-8e9870d56c37.png#align=left&display=inline&height=419&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1588&originWidth=1888&size=1824394&status=done&style=none&width=498)<br />
<br />新版本的 Smart Banner 会在页面滚动至Global Header 吸顶的时候出现在页面顶部<br />由于吸顶逻辑判断比较复杂，所以一期只在 PDP 上线<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/143206/1590548769201-2a9b7f07-f1fc-49c1-a763-0086258f2f33.png#align=left&display=inline&height=409&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1338&originWidth=756&size=319641&status=done&style=none&width=231) <br />

<a name="3xGYn"></a>
# 唤醒逻辑

<br />在 Window 的 load 事件触发时开始渲染 Smart Banner （当一个资源及其依赖资源已完成加载时，将触发load 事件）<br />
<br />
<br />

<a name="xyXk6"></a>
# 运营配置

<br />不同于普通的 lzdmod 开发，Smart Banner 的 Schema 的编写以及数据配置全部在 Fragment 上完成<br />
<br />
<br />**六国配置地址：**<br />
<br />sg<br />[https://i-cms.alibaba-inc.com/fragments/design/34481](https://i-cms.alibaba-inc.com/fragments/design/34481)<br />
<br />vn<br />[https://i-cms.alibaba-inc.com/fragments/design/36245](https://i-cms.alibaba-inc.com/fragments/design/36245)<br />
<br />ph<br />[https://i-cms.alibaba-inc.com/fragments/design/36241](https://i-cms.alibaba-inc.com/fragments/design/36241)<br />
<br />id<br />[https://i-cms.alibaba-inc.com/fragments/design/37000](https://i-cms.alibaba-inc.com/fragments/design/37000)<br />
<br />th<br />[https://i-cms.alibaba-inc.com/fragments/design/34680](https://i-cms.alibaba-inc.com/fragments/design/34680)<br />
<br />my<br />[https://i-cms.alibaba-inc.com/fragments/design/36379](https://i-cms.alibaba-inc.com/fragments/design/36379)<br />
<br />
<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/143206/1590567241436-41610868-34bb-4780-b9c8-a7cad1536f59.png#align=left&display=inline&height=1002&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1002&originWidth=2084&size=82976&status=done&style=none&width=2084)<br />
<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/143206/1590567495650-452056c9-b8fb-4139-9e0f-bf7174d2f8cb.png#align=left&display=inline&height=980&margin=%5Bobject%20Object%5D&name=image.png&originHeight=980&originWidth=1860&size=328735&status=done&style=none&width=1860)<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/143206/1590567626347-6953931f-3d0f-43a4-897f-08882cf21e3b.png#align=left&display=inline&height=1812&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1812&originWidth=2714&size=683788&status=done&style=none&width=2714)<br />这个编辑界面跟 DIP 是一样的，Schema 格式跟 其他的 ICMS 一样，具体规范的可以参考：

[https://yuque.antfin-inc.com/ims/gr5pqw/agdovw](https://yuque.antfin-inc.com/ims/gr5pqw/agdovw)<br />
<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/143206/1590567866458-d8c6972f-cb82-46c6-a90e-b5e0174f9039.png#align=left&display=inline&height=208&margin=%5Bobject%20Object%5D&name=image.png&originHeight=486&originWidth=966&size=35647&status=done&style=none&width=414)<br />更改完，点击「发布」上线后生效

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/143206/1590568050042-8d4eca71-5065-4f14-865d-220a59bae139.png#align=left&display=inline&height=313&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1108&originWidth=2104&size=169856&status=done&style=none&width=595)

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/143206/1590568113467-7c88d0d3-6122-4169-bfca-7bf8659c0d63.png#align=left&display=inline&height=343&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1344&originWidth=2374&size=271025&status=done&style=none&width=606)<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/143206/1590568229810-9b35b06a-6ada-4e9b-9d33-ff77a9a7dcc6.png#align=left&display=inline&height=316&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1418&originWidth=2740&size=381817&status=done&style=none&width=610)

点击更改对应的 PageType 的配置

<a name="hCjWI"></a>
# 埋点数据
**<br />~~**logkey  **`/smb.delivery.main`~~<br />**新 smb 的 logkey  **`/smb.delivery.top`<br />新**logkey** `/smb.delivery.main-lzd`<br />
<br />**点击类型(clickType)**：auto_open, close, download, manual_open, 默认值为 null<br />**国家(country)**：id, th, vn, ph, my, sg 等<br />**设备类型(deviceType)：**iOS, Android<br />**页面类型(pageType)：**campaign, home, hp, pdp, search, shop, 默认值为 default<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/143206/1590568792467-3250608f-6bef-4f94-82db-c8a61d337bcd.png#align=left&display=inline&height=1872&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1872&originWidth=2422&size=832267&status=done&style=none&width=2422)<br />
<br />

<a name="8GduZ"></a>
# 关键指标计算
```sql
-- pdp Smart Banner 的整体 UV 点击率 (时间需要自己修改)
SELECT A.cuv, B.euv, A.cuv / B.euv AS click_rate
FROM (
    SELECT COUNT(DISTINCT visitor_id) AS cuv
    FROM alilog.dwd_lzd_log_hjlj_hi
    WHERE ds = '20200528'
    AND logkey = '/smb.delivery.top' AND gmkey = 'CLK'
    AND KEYVALUE(args, '&', '=', 'pageType') = 'pdp'
) AS A
JOIN (
    SELECT COUNT(DISTINCT visitor_id) AS euv
    FROM alilog.dwd_lzd_log_hjlj_hi 
    WHERE ds = '20200528'
    AND logkey = '/smb.delivery.top' AND gmkey = 'EXP'
    AND KEYVALUE(args, '&', '=', 'pageType') = 'pdp'
) AS B
GROUP BY A.cuv, B.euv;
```


<a name="IMQHT"></a>
# 踩坑记录
<a name="QQTds"></a>
## SMB 吸顶
最简单的吸顶只需要设置 `position: fixed; top: 0;` 即可实现，问题是 SMB 作为公共组件是不知道其他页面上会有哪些元素的，很可能吸顶后会覆盖住页面上的其他元素，例如头部导航栏、购物车、电梯导航之类的元素。

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/143206/1590659473187-6a7bffe0-e55e-4218-883e-c099547be249.png#align=left&display=inline&height=652&margin=%5Bobject%20Object%5D&name=image.png&originHeight=652&originWidth=2390&size=479414&status=done&style=none&width=2390)

可以利用页面上的 lzd-global-header 来实现吸顶，我们只需要把 smart banner 插入到 header-wrapper 的最前面，并调整布局和样式。
```javascript
const $globalHeader = document.getElementById('lzd-global-header');

if (!$globalHeader) {
  // 找不到插入点则不展示
  return;
}

const $backBtn = document.querySelector('a.back');
const $topFixedBanner = document.getElementById('J_Smart_Banner_Bottom');
$globalHeader.insertBefore($topFixedBanner, $backBtn);
if ($topFixedBanner.classList.contains('display-none')) {
  $globalHeader.classList.add('with-smart-banner');
  $topFixedBanner.classList.remove('display-none');
}
```
当 lzd-global-header 吸顶后，会多出来一个 fixed-top 的样式，利用这个样式我们就可以避免监听滚动事件动态修改样式，具体操作如下：
```javascript
#lzd-global-header.fixed-top.scrolling.with-smart-banner {
  display: flex;
  flex-wrap: wrap;
  height: calc(13.3vw + 48px); // 加上 smart banner 的高度
}
```
