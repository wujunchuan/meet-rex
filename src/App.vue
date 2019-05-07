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
import { mapState } from "vuex";
import { Promise } from "q";
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
  computed: {
    ...mapState(["scatter", "account", "loadingShow"])
  },
  async created() {
    await this.$store.dispatch("initScatter");
  },
  mounted() {
    this.intervalId = window.setInterval(async () => {
      if (!this.scatter) {
        return;
      } else {
        try {
          window.clearInterval(this.intervalId);
          // 获取当前帐号
          await this.$store.dispatch("getIdentity");
          try {
            await Promise.all([
              // // 获取帐号余额
              this.$store.dispatch("getAccountBalance"),
              // 获取rexpool信息
              this.$store.dispatch("getRexPool"),
              // 获取rexbal信息
              this.$store.dispatch("getRexBal"),
              // 获取REX收益来源
              this.$store.dispatch("getRexProfits")
            ]);
          } catch (error) {
            console.log("error for request data");
          }
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

html {
  box-sizing: border-box;
  background: #f8f9fa;
}

*,
*:before,
*:after {
  box-sizing: inherit;
}

@font-face {
  font-family: "MarkPro-Medium";
  src: url("./assets/MarkPro-Medium.otf");
}

@font-face {
  font-family: "MarkPro";
  src: url("./assets/MarkPro.otf");
}

.number-medium {
  font-family: "MarkPro-Medium";
}

.number-regular {
  font-family: "MarkPro";
}

.hide {
  display: none !important;
}
</style>
