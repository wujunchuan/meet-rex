<template>
  <div id="app">
    <keep-alive>
      <router-view />
    </keep-alive>
    <!-- Loading -->
    <div v-transfer-dom>
      <loading :show="loadingShow" text="Loading"></loading>
    </div>
  </div>
</template>

<script>
import { Loading, TransferDom } from "vux";
export default {
  components: {
    Loading
  },
  directives: {
    TransferDom
  },
  data() {
    return {
      intervalId: null,
      voteProxy: null
    };
  },
  computed: {},
  async created() {},
  mounted() {
    this.intervalId = window.setInterval(async () => {
      if (!this.scatter) {
        return;
      } else {
        try {
          window.clearInterval(this.intervalId);
          // 获取当前帐号
          await this.$store.dispatch("getIdentity");
          // // 获取帐号代理人详情
          // await this.$store.dispatch("updateVoteAccountStatus", {
          //   account: this.account && this.account.name,
          //   invitecode: this.$route.query.invitecode || "",
          //   redirect: "home"
          // });
          // // 获取代理投票人列表
          // this.voteProxy = await this.$store.dispatch("updateVoteProxy");
          // // 获取帐号余额
          // await this.$store.dispatch("getAccountBalance");
        } finally {
          this.$store.commit("setLoadingShow", { loadingShow: false });
        }
      }
    }, 100);
  }
};
</script>

<style lang="less">
@import "~vux/src/styles/reset.less";

#app {
  font-family: Helvetica, Tahoma, Arial, STXihei, "华文细黑", "Microsoft YaHei",
    "微软雅黑", SimSun, "宋体", Heiti, "黑体", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@font-face {
  font-family: "DIN-Bold";
  src: url("./assets/DIN-Bold.otf");
}

@font-face {
  font-family: "DIN-Medium";
  src: url("./assets/DIN-Medium.otf");
}

@font-face {
  font-family: "DIN-Regular";
  src: url("./assets/DIN-Regular.otf");
}

.number-bold {
  font-family: "DIN-Bold";
}

.number-medium {
  font-family: "DIN-Medium";
}

.number-regular {
  font-family: "DIN-Regular";
}

.hide {
  display: none !important;
}
</style>
