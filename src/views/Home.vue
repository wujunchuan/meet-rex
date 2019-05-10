<template>
  <div class="home">
    <!-- 切换语系 -->
    <div class="locale" @click="handleLocale">
      {{ $i18n.locale() === "zh-CN" ? "En" : "中文" }}
    </div>
    <div class="entry" v-if="!isInject">
      <span v-if="account" class="logout" @click="logout">{{
        $t("logout")
      }}</span>
      <span v-else class="login" @click="login">{{ $t("login") }}</span>
    </div>
    <div class="header">
      <div class="profits-container">
        <div class="profits" @click="isShowQA = true">
          <span class="title touchable">
            {{ $t("profit_7") }}
          </span>
          <div class="question touchable">
            <img src="../assets/icon-question.png" alt="" />
          </div>
        </div>
        <span class="profits-count number-medium">
          {{ recentProfit | toFixed(2) }}
          <span>%</span>
        </span>
      </div>
      <div class="echart" v-if="chartOptions">
        <chart
          class="price-chart"
          :options="chartOptions"
          ref="chart"
          auto-resize
        ></chart>
      </div>
      <div class="infomation">
        <!-- 租赁比 -->
        <div class="percentage">
          <span class="title"
            >{{ $t("percentage") }}（{{ lentableRate | toFixed }}%）</span
          >
          <vux-progress
            class="vux-progress"
            :percent="lentableRate"
          ></vux-progress>
          <div class="percentage-detail number-medium">
            {{ rexPool && rexPool.total_lent | toFixed | comma }} /
            {{ rexPool && rexPool.total_lendable | toFixed | comma }} EOS
          </div>
        </div>

        <!-- 收入来源 -->
        <div class="income-from">
          <div class="fee-wrapper">
            <div class="title">{{ $t("rent-income") }}</div>
            <div class="fee number-medium">
              {{ rentFee | toFixed | comma }} EOS
            </div>
          </div>
          <div class="fee-wrapper">
            <div class="title">{{ $t("name-income") }}</div>
            <div class="fee number-medium">
              {{ nameFee | toFixed | comma }} EOS
            </div>
          </div>
          <div class="fee-wrapper">
            <div class="title">{{ $t("ram-income") }}</div>
            <div class="fee number-medium">
              {{ ramFee | toFixed | comma }} EOS
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="main">
      <div class="card" v-if="account">
        <div class="info-wrapper">
          <div class="title">{{ $t("current-account") }}</div>
          <template v-if="account">
            <span class="number-medium">
              {{ account.name }}
            </span>
          </template>
        </div>
        <div class="info-wrapper">
          <div class="title">{{ $t("rex-balance") }}</div>
          <span class="number-medium">{{
            rexBalance | formatAssert({ symbol: "REX" })
          }}</span>
        </div>
        <div class="info-wrapper">
          <div class="title">{{ $t("rex-values") }}</div>
          <span class="number-medium">{{
            rexValue | formatAssert({ decimal: 4 })
          }}</span>
        </div>
      </div>
      <div class="form-container">
        <div class="card card-half touchable" @click="navto('lent')">
          <div class="title">{{ $t("rex-price") }}</div>
          <span class="price number-medium">{{ rexRate }}</span>
          <div class="nav">{{ $t("buy-sell-rex") }}</div>
        </div>
        <div class="card card-half touchable" @click="navto('rent')">
          <div class="title">{{ $t("resource-price") }}</div>
          <span class="price number-medium">{{ rentRate }}</span>
          <div class="nav">{{ $t("rent-resource") }}</div>
        </div>
        <div class="card card-half touchable" v-if="false">
          <div class="title">REX池余额</div>
          <span class="price number-medium">0.0001000190</span>
          <div class="nav">充提</div>
        </div>
        <div class="card card-half touchable" v-if="false">
          <div class="title">续租租金</div>
          <span class="price number-medium">0.0001000190</span>
          <div class="nav">充提</div>
        </div>
      </div>

      <div class="form-container full">
        <div
          v-if="account"
          class="card small item touchable"
          @click="$router.push({ name: 'fund' })"
        >
          <div class="title">{{ $t("rex-fund") }}</div>
          <div class="nav number-medium">
            <template v-if="rexFund">
              {{ rexFund.balance }}
            </template>
            <template v-else>
              {{ $t("is-null") }}
            </template>
          </div>
        </div>
        <div class="card small item  touchable" v-if="false">
          <div class="title">租赁记录</div>
          <div class="nav number-medium"></div>
        </div>
        <div class="card small item  touchable" v-if="false">
          <div class="title">待成交订单(sell queue)</div>
          <div class="nav number-medium">无</div>
        </div>
      </div>
    </div>
    <div class="custom-alert" v-transfer-dom>
      <alert
        v-model="isShowQA"
        :button-text="$t('got-it')"
        :title="$t('description')"
      >
        <div class="detail">
          {{ $t("description-detail") }}
        </div>
        <div class="notes">
          {{ $t("description-notes") }}
        </div>
      </alert>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getAssertCount, toFixed } from "../util.js";
import { TransferDom, Alert } from "vux";
import VuxProgress from "../components/VuxProgress";
import MeetBridge from "meet-bridge";
const meetBridge = new MeetBridge();

export default {
  name: "home",
  directives: {
    TransferDom
  },

  components: {
    VuxProgress,
    Alert
  },
  async mounted() {
    // 获取最近七天的收益
    let rexPrices = await this.$http.get(
      "/eos_api/price/token/6?token=eos_rex"
    );
    this.rexPrices = rexPrices;
  },
  data() {
    return {
      rexPrices: [],
      profitDatas: [],
      isShowQA: false
    };
  },
  computed: {
    recentProfit() {
      // 最近七日年化
      // profit = ((lastPrice - before7Price) / before7Price / 7) * 365 * 100
      let rexPrices = this.rexPrices;
      if (rexPrices.length < 7) return 0;
      try {
        let lastPrice = Number(rexPrices[rexPrices.length - 1].c);
        let before7Price = Number(rexPrices[0].o);
        let profit =
          ((lastPrice - before7Price) / before7Price / 7) * 365 * 100;
        return profit;
      } catch (error) {
        return 0;
      }
    },
    chartOptions() {
      if (this.profitDatas.length === 0) return null;
      return {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            animation: false
          }
        },
        // grid: {
        //   x: 50,
        //   y: 30,
        //   x2: 15,
        //   y2: 50
        // },
        xAxis: {
          type: "time",
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: "value",
          name: "EOS/REX",
          scale: true,
          splitLine: {
            show: true,
            lineStyle: {
              type: "dotted"
            }
          },
          axisLabel: {
            formatter: function(value) {
              return ".." + value.toFixed(10).slice(5);
            },
            margin: 2
          }
        },
        series: [
          {
            type: "line",
            showSymbol: false,
            hoverAnimation: false,
            data: []
          }
        ]
      };
    },
    // 租赁比例
    lentableRate() {
      if (!this.rexPool) return;
      let {
        total_lendable = "0.0000 EOS",
        total_lent = "1.0000 REX"
      } = this.rexPool;
      total_lendable = getAssertCount(total_lendable);
      total_lent = getAssertCount(total_lent);
      let result = toFixed(total_lent / total_lendable, 5) * 100;
      return result;
    },
    rexBalance() {
      return getAssertCount(this.rexBal && this.rexBal.rex_balance);
    },
    rexValue() {
      let rexValue = this.rexBalance * this.rexRate;
      return rexValue;
    },
    // REX价格
    rexRate() {
      if (!this.rexPool) return;
      // total_lendable/total_rex = EOS/REX
      // 单位 EOS/REX
      let {
        total_lendable = "0.0000 EOS",
        total_rex = "1.0000 REX"
      } = this.rexPool;
      total_lendable = getAssertCount(total_lendable);
      total_rex = getAssertCount(total_rex);
      let result = toFixed(total_lendable / total_rex, 10);
      return result;
    },
    // 资源价格
    rentRate() {
      if (!this.rexPool) return;
      // 单位: EOS * 30天 / EOS
      // total_rent/total_unlent
      let {
        total_rent = "0.0000 EOS",
        total_unlent = "1.0000 EOS"
      } = this.rexPool;
      total_rent = getAssertCount(total_rent);
      total_unlent = getAssertCount(total_unlent);
      let result = toFixed(total_unlent / total_rent, 4);
      return result;
    },
    // 租赁收入
    rentFee() {
      if (!this.rexProfits) return;
      return getAssertCount(this.rexProfits.rent);
    },
    // 帐号拍卖收入
    nameFee() {
      if (!this.rexProfits) return;
      return getAssertCount(this.rexProfits.namebid);
    },
    // RAMfee
    ramFee() {
      if (!this.rexProfits) return;

      return getAssertCount(this.rexProfits.ramfee);
    },
    ...mapState([
      "isInject",
      "account",
      "liquidBalance",
      "rexPool",
      "rexBal",
      "rexProfits",
      "rexFund"
    ])
  },
  methods: {
    logout() {
      this.$store.dispatch("logout");
    },
    async login() {
      try {
        await this.$store.dispatch("login");
      } catch (error) {
        alert("Login failed");
      }
    },
    handleLocale() {
      const locale = this.$i18n.locale();
      if (locale === "zh-CN") {
        this.$i18n.set("en");
      } else {
        this.$i18n.set("zh-CN");
      }
    },
    navto(target = "rent") {
      if (!(window.scatter && window.scatter.isInject)) {
        window.location.href = "https://m.oheos.com/download/?source=theme";
        return;
      }
      switch (target) {
        case "rent":
          // 买卖REX
          meetBridge.invokeNavigate({
            target: "EOSResourcesPage",
            options: {
              tab: 2
            }
          });
          break;
        case "lent":
          // 租赁资源
          meetBridge.invokeNavigate({
            target: "REXExchangePage"
          });
          break;

        case "fund":
          console.log("fund");
          break;
        default:
          break;
      }
      console.log(target);
    }
  }
};
</script>

<style lang="less" scoped>
.header {
  padding: 15px 15px 12px;
  background: #00baff; /* Old browsers */
  background: linear-gradient(to bottom, #00baff 0%, #177cda 100%);
  &::before {
    content: "";
    width: 100%;
    height: 45%;
    position: absolute;
    top: 0;
    left: 0;
    background-size: 100% 100%;
    background-position: contain;
    background-image: url("../assets/bg-header.png");
  }

  // 七日年化收益率
  .profits-container {
    margin-top: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .profits-count {
      font-size: 40px;
      color: #ffffff;
      text-align: center;
      span {
        position: relative;
        font-size: 18px;
        left: -5px;
      }
    }
    .profits {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #ffffff;
      text-align: center;
      .title {
        opacity: 0.5;
        padding-right: 6px;
      }
      .question {
        display: inline-block;
        color: #ffffff;
        width: 16px;
        height: 16px;
        img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
  // 图表
  .echart {
    width: 100%;
  }

  .price-chart {
    width: 100%;
  }

  .vux-progress {
    margin: 6px 0;
  }

  // REX市场的信息
  .infomation {
    color: #ffffff;
    .title {
      opacity: 0.5;
      font-size: 12px;
      color: #ffffff;
    }
    .fee {
      font-size: 18px;
    }
    // 租赁比
    .percentage {
      padding-top: 20px;
      padding-bottom: 20px;
      .percentage-detail {
        font-size: 14px;
      }
    }
    // 收入来源
    .income-from {
      display: flex;
      flex-wrap: wrap;
      .fee-wrapper {
        padding-bottom: 10px;
        width: 50%;
      }
    }
  }
}

.main {
  margin: 20px 15px;
  padding-bottom: 20px;

  .form-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-bottom: 10px;
    .price {
      margin: 0;
    }
  }

  .card {
    display: flex;
    flex-direction: column;
    padding: 22px 0 22px 11px;
    .title {
      font-size: 12px;
      color: #999999;
    }
    span {
      font-size: 16px;
      color: #323232;
      margin-left: 10px;
    }
    .info-wrapper {
      display: flex;
      align-items: center;
      &:nth-child(2) {
        margin: 12px 0;
      }
    }
  }

  .item {
    border-radius: 0;
    padding-left: 10px;
    border-bottom: 1px solid #e8e8e8;
    &:last-of-type {
      border-bottom: 0;
    }
  }

  .card.small {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 14px 9px 14px 10px;
    .title {
      font-size: 16px;
      color: #323232;
    }
    .nav {
      margin: 0;
      font-size: 14px;
      color: #323232;
      text-align: right;
    }
  }

  .card-half {
    padding: 15px 10px;
    .title {
      font-size: 12px;
      color: #999999;
    }
    .price {
      font-size: 18px;
      color: #323232;
    }
  }
}

.card {
  width: 100%;
  background-color: #fff;
  border-radius: 6px;
  .nav {
    margin-top: 11px;
    font-size: 14px;
    color: #323232;
    display: flex;
    justify-content: flex-end;
    &::after {
      background-image: url("../assets/icon-nav.png");
      background-size: 22px 22px;
      display: inline-block;
      width: 22px;
      height: 22px;
      position: relative;
      content: "";
    }
  }
}

.card-half {
  width: 165px;
  margin-top: 10px;
}

.custom-alert {
  .detail {
    text-align: justify;
    line-height: 21px;
    color: #323232;
    margin-top: 10px;
    margin-bottom: 20px;
  }
  .notes {
    text-align: justify;
    font-size: 10px;
  }
}

.locale {
  position: absolute;
  font-size: 15px;
  color: #fff;
  top: 15px;
  left: 20px;
  z-index: 1;
}
.entry {
  position: absolute;
  font-size: 15px;
  color: #fff;
  top: 15px;
  right: 20px;
  z-index: 1;
}
</style>
