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
      component: Home,
      meta: {
        title: "route_home"
      }
    },
    {
      path: "/demo",
      name: "demo",
      component: () => import("./views/Demo.vue")
    },
    {
      path: "/fund",
      name: "fund",
      component: () => import("./views/Fund.vue"),
      meta: {
        title: "route_fund"
      }
    },
    {
      path: "/savings",
      name: "savings",
      component: () => import("./views/Savings.vue"),
      meta: {
        title: "route_savings"
      }
    },
    {
      path: "/rex",
      name: "rex",
      component: () => import("./views/Rex.vue"),
      meta: {
        title: "route_rex"
      }
    },
    {
      path: "/rent",
      name: "rent",
      component: () => import("./views/Rent.vue"),
      meta: {
        title: "route_rent"
      }
    },
    {
      path: "/loans",
      name: "loans",
      component: () => import("./views/Loans.vue"),
      meta: {
        // TODO: i18n
        title: "route_loans"
      }
    },
    {
      path: "/loans/detail",
      name: "loans-detail",
      component: () => import("./views/LoansDetail.vue"),
      props: true, // 设置这个为`true`时，路由的参数会当作组件的props传递给视图
      meta: {
        // TODO: i18n
        title: "route_loans_detail"
      }
    }
  ]
});
