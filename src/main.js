import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import http from "./http";
import "lib-flexible"; // 利用手淘flexible布局，字体需要根据dpr看来改变大小

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

import moment from "moment";

moment.locale("zh-cn");

/**
 * 关于时间格式的过滤器
 */
Vue.filter("formatDate", function(value) {
  if (value) {
    return moment(value).format("YYYY-MM-DD");
  }
});

Vue.filter("formatDateWithTime", function(value) {
  if (value) {
    return moment(value).format("YYYY/MM/DD HH:mm");
  }
});

Vue.filter("formatDateWithWeek", function(value) {
  if (value) {
    return moment(value).format("YYYY/MM/DD HH:mm dddd");
  }
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
