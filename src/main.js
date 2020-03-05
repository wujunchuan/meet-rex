import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

/**
 * inject http to vue global
 */
import http from "./http";
Vue.prototype.$http = http;

/**
 * I18n begin here
 */
import vuexI18n from "vuex-i18n";
import LocalePlugin from "vux/src/plugins/locale";
Vue.use(LocalePlugin);
Vue.use(vuexI18n.plugin, store, {
  moduleName: "i18n",
  onTranslationNotFound(locale, key) {
    console.warn(`i18n :: Key '${key}' not found for locale '${locale}'`);
  }
});
/**
 * 单页面应用中js获取url中的参数
 * @param {String} name 需要查询的queryParams[name]
 */
function getQueryString(name) {
  var reg = new RegExp("[?&]" + name + "=([^&#]*)", "i");
  var res = window.location.href.match(reg);

  if (res && res.length > 1) {
    return decodeURIComponent(res[1]);
  }
  return "";
}
const storage = window.localStorage;
/*
获取语系优先级:
  1. URL
  2. localstorage
*/
let lang = getQueryString("lang");

if (lang === '') {
  lang = storage["lang"] || "en";
} else {
  storage.setItem("lang", lang);
}


/* 加载语系 */
Vue.i18n.add("en", require("../src/locale/en"));
Vue.i18n.add("zh-CN", require("../src/locale/zh-CN"));
import objectAssign from "object-assign";
import vuxLocales from "./locale/all.yml";
const finalLocales = {
  en: objectAssign(vuxLocales["en"], require("../src/locale/en")),
  "zh-CN": objectAssign(vuxLocales["zh-CN"], require("../src/locale/zh-CN"))
};
for (let i in finalLocales) {
  Vue.i18n.add(i, finalLocales[i]);
}

/* 根据参数设置初始化语系 */
if (/zh/.test(lang)) {
  Vue.i18n.set("zh-CN");
} else if (/en/.test(lang)) {
  Vue.i18n.set("en");
} else {
  Vue.i18n.set("en");
}

/**
 * I18n End here
 */

import "lib-flexible"; // 利用手淘flexible布局，字体需要根据dpr看来改变大小

// lodash
// import loadsh from "lodash";
// import Lodash
// Object.defineProperty(Vue.prototype, "$_", { value: loadsh });

// Echarts
import ECharts from "vue-echarts/components/ECharts.vue";
// 手动引入 ECharts 各模块来减小打包体积
import "echarts/lib/component/tooltip";
import "echarts/lib/component/legend";
import "echarts/lib/chart/line";
import "echarts/lib/component/dataZoom";
import "echarts/lib/chart/candlestick";
// regist components
Vue.component("chart", ECharts);

// import { LoadingPlugin } from "vux";
// notice: 不要使用解构语法,否则打包会全部打包进去(BUG)
import ToastPlugin from "vux/src/plugins/toast";
Vue.use(ToastPlugin, { position: "bottom", type: "text", width: "14.6em" });

/**
 *  移除移动端点击延迟
 */
// import FastClick from "fastclick";
// FastClick.attach(document.body);

Vue.config.productionTip = false;

if (process.env.NODE_ENV === "development") {
  // Only the development env will dynamic import
  Vue.config.productionTip = true;
  // import("eruda").then(module => {
  //   module.default.init();
  // });
}

import moment from "moment";
// moment.locale("de");
Vue.filter("formatTime", function(value, { format = "YYYY-MM-DD" } = {}) {
  try {
    return moment(new Date(value + "Z")).format(format);
  } catch (error) {
    console.log(error);
    return "";
  }
});

import { toAssertSymbol, getAssertCount, toFixed, numberComma } from "./util";
Vue.filter("formatAssert", function(
  value,
  { decimal = 4, symbol = "EOS" } = {}
) {
  if (typeof value !== "number") {
    value = getAssertCount(value);
    value = Number(value);
  }
  return toAssertSymbol(value, decimal, symbol);
});
Vue.filter("toFixed", function(value, decimal = 4) {
  if (typeof value === "string") {
    value = getAssertCount(value);
  }
  return toFixed(value, decimal);
});
Vue.filter("comma", function(value) {
  if (typeof value === "string") {
    value = getAssertCount(value);
  }
  return numberComma(value);
});

// 路由钩子配置
router.beforeEach((to, from, next) => {
  // 动态设置标题
  document.title = Vue.i18n.translate(to.meta.title);
  next();
});

router.afterEach(to => {
  if (window.ga) {
    console.info(to.fullPath);
    window.ga("set", "page", "rex" + to.fullPath); // 你可能想根据请求参数添加其他参数，可以修改这里的 to.fullPath
    window.ga("send", "pageview");
  }
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
