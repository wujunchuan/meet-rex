import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import http from "./http";
import "lib-flexible"; // 利用手淘flexible布局，字体需要根据dpr看来改变大小

// lodash
import loadsh from "lodash";
// import Lodash
Object.defineProperty(Vue.prototype, "$_", { value: loadsh });

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
Vue.use(ToastPlugin, { position: "bottom", type: "text", width: "10.6em" });

/**
 *  移除移动端点击延迟
 */
import FastClick from "fastclick";
FastClick.attach(document.body);

Vue.config.productionTip = false;

if (process.env.NODE_ENV === "development") {
  // Only the development env will dynamic import
  Vue.config.productionTip = true;
  import("eruda").then(module => {
    module.default.init();
  });
}

Vue.prototype.$http = http;

// import moment from "moment";
import { toAssertSymbol, getAssertCount, toFixed, numberComma } from "./util";

// moment.locale("zh-cn");

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

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
