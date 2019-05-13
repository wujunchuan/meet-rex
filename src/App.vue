<template>
  <div id="app">
    <keep-alive>
      <router-view />
    </keep-alive>
    <!-- Loading -->
    <div v-transfer-dom>
      <loading :show="loadingShow" :text="'Loading'"></loading>
    </div>
  </div>
</template>

<script>
import { Loading, TransferDom } from "vux";
import { mapState } from "vuex";
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
    // 获取rexpool信息
    this.$store.dispatch("getRexPool");
    // 获取REX收益来源
    this.$store.dispatch("getRexProfits");
    this.intervalId = window.setInterval(async () => {
      if (!this.scatter) {
        return;
      } else {
        window.clearInterval(this.intervalId);
        try {
          if (window.scatter.isInject) {
            // 如果是客户端内，设置全局变量 `isInject: true`
            this.$store.commit("setIsInject", { isInject: true });
          }
          try {
            await this.$store.dispatch("login");
          } catch (error) {
            alert("Login failed");
          }
        } catch (error) {
          console.log("error for request data");
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

.touchable {
  &:active {
    opacity: 0.7;
  }
}
</style>
