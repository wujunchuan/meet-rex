import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    // 首页
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/invite",
      name: "invite",
      component: () => import("./views/Invite.vue")
    },

    // 累计收益 cumulative
    {
      path: "/cumulative",
      name: "cumulative",
      component: () => import("./views/Cumulative.vue")
    },

    // 年化 annualized
    {
      path: "/annualized",
      name: "annualized",
      component: () => import("./views/Annualized")
    },

    // 记录列表 record
    {
      path: "/record",
      name: "record",
      component: () => import("./views/Record")
    },

    // 记录详情 record-detail
    {
      path: "/record/detail",
      name: "record-detail",
      props: true,
      component: () => import("./views/RecordDetail")
    },

    // 抵押资源页
    {
      path: "/delegate",
      name: "delegate",
      props: true,
      component: () => import("./views/Delegate")
    }
  ]
});
