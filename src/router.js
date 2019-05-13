import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";

Vue.use(Router);

export default new Router({
  mode: "hash",
  base: process.env.BASE_URL,
  routes: [
    // 首页
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/demo",
      name: "demo",
      component: () => import("./views/Demo.vue")
    },
    {
      path: "/fund",
      name: "fund",
      component: () => import("./views/Fund.vue")
    },
    {
      path: "/savings",
      name: "savings",
      component: () => import("./views/Savings.vue")
    }
  ]
});
