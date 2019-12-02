<template>
  <div id="app">
    <keep-alive>
      <router-view />
    </keep-alive>
    <!-- Loading -->
    <div v-transfer-dom>
      <loading :show="loadingShow"></loading>
    </div>
    <!-- 查看REX锁定详情 -->
    <div class="custom-alert" v-transfer-dom>
      <alert
        v-model="isShowBucket"
        :button-text="$t('got-it')"
        :title="$t('maturity_title')"
      >
        <table class="buckets">
          <tr>
            <th>{{ $t("maturity_time") }}</th>
            <th>{{ $t("maturity_amount") }}</th>
          </tr>
          <!-- 依次解锁的数量 -->
          <template v-for="(rex_maturity, index) in rex_maturities">
            <tr :key="index">
              <td>
                {{ rex_maturity.first | formatTime({ format: "MM-DD HH:mm" }) }}
              </td>
              <td>
                {{
                  (rex_maturity.second / 10000)
                    | formatAssert({ symbol: "REX" })
                }}
              </td>
            </tr>
          </template>
          <tr>
            <td>{{ $t("rex-savings") }}</td>
            <td>{{ unmaturedRexForever | formatAssert({ symbol: "REX" }) }}</td>
          </tr>
          <tr>
            <td>{{ $t("maturity") }}</td>
            <td>{{ maturedRex | formatAssert({ symbol: "REX" }) }}</td>
          </tr>
        </table>
      </alert>
    </div>
    <div class="custom-alert" v-transfer-dom>
      <confirm
        v-model="isShowVoteRequire"
        @on-confirm="$store.dispatch('voteUs')"
        :confirm-text="$t('vote_confirm')"
        :title="$t('vote_title')"
      >
        <div>
          {{ $t("vote_body") }}
        </div>
      </confirm>
    </div>
  </div>
</template>

<script>
import { Loading, TransferDom, Alert, Confirm } from "vux";
import { mapState } from "vuex";
export default {
  components: {
    Loading,
    Alert,
    Confirm
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
    // REX储蓄桶的数量
    unmaturedRexForever() {
      if (this.rexBal) {
        let { rex_maturities = [] } = this.rexBal;
        let unmaturedRexForeverIndex = rex_maturities.length - 1;
        if (unmaturedRexForeverIndex >= 0) {
          // 有这个记录的话
          let maturedTime = rex_maturities[unmaturedRexForeverIndex].first;
          // 随便取个 10天 ，反正这个时候早就他妈的matured了
          if (
            new Date(maturedTime).getTime() - new Date().getTime() >
            864000000
          ) {
            const result =
              rex_maturities[unmaturedRexForeverIndex].second / 10000;
            return result;
          }
        }
      }
      // REX储蓄桶
      return 0;
    },
    // REX已经解锁的数量
    maturedRex() {
      // 已经成熟的REX数量（可以出售的数量）
      return this.rexBal && this.rexBal.matured_rex / 10000;
    },
    rex_maturities() {
      return (
        this.rexBal &&
        this.rexBal.rex_maturities.length > 0 &&
        this.rexBal.rex_maturities.filter(item => {
          return (
            new Date(item.first).getTime() - new Date().getTime() < 864000000
          );
        })
      );
    },
    isShowBucket: {
      get() {
        return this.$store.state.isShowBucket;
      },
      set(val) {
        this.$store.commit("setIsShowBucket", { isShowBucket: val });
      }
    },
    isShowVoteRequire: {
      get() {
        return this.$store.state.isShowVoteRequire;
      },
      set(val) {
        this.$store.commit("setIsShowVoteRequire", { isShowVoteRequire: val });
      }
    },
    ...mapState(["scatter", "account", "loadingShow", "rexBal"])
  },
  async created() {
    await this.$store.dispatch("initScatter");
  },
  mounted() {
    // 获取rexpool信息
    this.$store.dispatch("getRexPool");
    // 获取REX收益来源
    this.$store.dispatch("getRexProfits");
    this.$store.dispatch("queryRexqueue");
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

// 全局超链接使用颜色 `3E688F`
a {
  color: #3e688f;
  text-decoration: none;
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
// buckets table styles
.buckets {
  width: 100%;
  th {
    color: #323232;
  }

  tr {
    line-height: 1.7em;
    th,
    td {
      &:first-child {
        text-align: left;
      }
      &:last-child {
        text-align: right;
      }
    }
  }
}
</style>
