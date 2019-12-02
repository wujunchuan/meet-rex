<template>
  <div class="rex">
    <div class="container">
      <!-- 顶部买卖按钮 -->
      <div class="button-group">
        <div
          class="button"
          :class="mode === 'buy' ? 'active' : null"
          @click="mode = 'buy'"
        >
          {{ $t("buy_rex") }}
        </div>
        <div
          class="button"
          :class="mode === 'sell' ? 'active' : null"
          @click="mode = 'sell'"
        >
          {{ $t("sell_rex") }}
        </div>
      </div>
    </div>

    <div class="buyrex-container" v-if="mode === 'buy'">
      <!-- 支付方式 -->
      <group class="payment-methods">
        <popup-picker
          :title="$t('buy_rex_payment')"
          :data="buymodeList"
          v-model="buymode"
          :display-format="formatPicker"
        ></popup-picker>
      </group>

      <!-- 金额 | 及预估可换 -->
      <div class="info-container">
        <div class="buy">
          <h1 class="title">{{ $t("buy_rex_amount") }}</h1>
          <div>
            <template v-if="buymode[0] === 'liquid'">
              <input
                class="number-input"
                v-model.number.trim="buyAcount"
                type="number"
                :placeholder="liquidBalance"
              />
            </template>
            <template v-if="buymode[0] === 'rexfund'">
              <input
                class="number-input"
                v-model.number.trim="buyAcount"
                type="number"
                :placeholder="rexFund && rexFund.balance.split(' ')[0]"
              />
            </template>
            <template v-if="buymode[0] === 'stakedcpu'">
              <input
                class="number-input"
                v-model.number.trim="buyAcount"
                type="number"
                :placeholder="userStaked.cpu_weight.split(' ')[0]"
              />
            </template>
            <template v-if="buymode[0] === 'stakednet'">
              <input
                class="number-input"
                v-model.number.trim="buyAcount"
                type="number"
                :placeholder="userStaked.net_weight.split(' ')[0]"
              />
            </template>
            <span class="number-medium unit">EOS</span>
            <!-- 快速选择 -->
            <div class="quick-button-group">
              <div class="quick-button" @click="quick(0.25)">25%</div>
              <div class="quick-button" @click="quick(0.5)">50%</div>
              <div class="quick-button" @click="quick(0.75)">75%</div>
              <div class="quick-button" @click="quick(1)">ALL</div>
            </div>
          </div>
        </div>

        <!-- 预估可换 -->
        <div class="forecast-values">
          <h1 class="title">{{ $t("buy_rex_forecast") }}</h1>
          <div class="number-medium">
            {{ forecast_buy_value }}
          </div>
        </div>
      </div>
    </div>

    <div class="sellrex-container" v-if="mode === 'sell'">
      <!-- REX 余额 -->
      <div class="info-container independent">
        <div
          class="rex-balance"
          @click="$store.commit('setIsShowBucket', { isShowBucket: true })"
        >
          <h1 class="title">
            {{ $t("rex-balance") }}
            <span class="question gray">
              <img src="../assets/icon-question.png" alt="" />
            </span>
          </h1>

          <div class="number-medium">
            <template v-if="rexBal">
              {{ rexBalance | formatAssert({ symbol: "REX" }) }}
            </template>
            <template v-else>
              {{ $t("is-null") }}
            </template>
          </div>
        </div>
        <!-- 排队卖出中的REX -->
        <div class="rex-balance" v-if="userQueue" @click="handleUpdateRex()">
          <h1 class="title">{{ $t("myqueue") }}</h1>
          <div class="number-medium">
            <template v-if="userQueue">
              {{ userQueue.rex_requested }}
            </template>
            <template v-else>
              {{ $t("is-null") }}
            </template>
          </div>
        </div>
      </div>

      <!-- 金额 | 及预估可换 -->
      <div class="info-container">
        <div class="buy">
          <h1 class="title">{{ $t("buy_rex_amount") }}</h1>
          <div>
            <input
              class="number-input"
              v-model.number.trim="sellAcount"
              type="number"
              :placeholder="maturedRex"
            />
            <span class="number-medium unit">REX</span>
            <!-- 快速选择 -->
            <div class="quick-button-group">
              <div class="quick-button" @click="quick(0.25)">25%</div>
              <div class="quick-button" @click="quick(0.5)">50%</div>
              <div class="quick-button" @click="quick(0.75)">75%</div>
              <div class="quick-button" @click="quick(1)">ALL</div>
            </div>
          </div>
        </div>

        <!-- 是否直接出售到LiquidEOS -->
        <div class="forecast-values">
          <h1 class="title">{{ $t("sell_rex_liquid") }}</h1>
          <inline-x-switch v-model="isLiquid"></inline-x-switch>
        </div>
        <!-- 预估可换 -->
        <div class="forecast-values">
          <h1 class="title">{{ $t("buy_rex_forecast") }}</h1>
          <div class="number-medium">
            {{ forecast_sell_value }}
          </div>
        </div>
        <!-- REX卖出排队订单数: 0 -->
        <div class="forecast-values" v-if="sellqueue.length > 0">
          <h1 class="title">{{ $t("sellqueue") }}</h1>
          <div class="number-medium">
            {{ sellqueue.length }}
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="button-confirm touchable" @click="pushTransaction">
        {{ mode === "buy" ? $t("buy_rex_confirm") : $t("sell_rex_confirm") }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { PopupPicker, Group, InlineXSwitch } from "vux";
import {
  getAssertCount,
  toFixed,
  toAssertSymbol,
  toAssertSymbolWithoutComma
} from "../util";
export default {
  data() {
    return {
      mode: "buy",
      buymode: ["liquid"], // 默认使用liquidEOS Balance支付
      buyAcount: null, // 购买的数量
      sellAcount: null, // 出售的数量
      forecast_buy_value: null, // 预估可兑换[buy]
      forecast_sell_value: null, // 预估可兑换[sell]
      isLiquid: true, // 出售REX是否直接进账到LiquidEOS中（如果为true，需要额外的内联交易）
      buymodeList: [
        [
          {
            name: this.$t("buy_rex_by_liquid"),
            value: "liquid"
          },
          {
            name: this.$t("buy_rex_by_fund"),
            value: "rexfund"
          },
          {
            name: this.$t("buy_rex_by_cpu"),
            value: "stakedcpu"
          },
          {
            name: this.$t("buy_rex_by_net"),
            value: "stakednet"
          }
        ]
      ]
    };
  },
  methods: {
    async handleUpdateRex() {
      try {
        // let res = await this.updateRex();
        let res = await this.$store.dispatch("updateRex");
        if (res.transaction_id) {
          this.$vux.toast.show({
            text: this.$t("transaction-success")
          });
        }
      } catch (error) {
        alert(JSON.stringify(error));
      }
    },
    // 确认交易
    async pushTransaction() {
      try {
        if (!this.isVoted) {
          // 如果没满足条件, 提示用户投票
          this.$store.commit("setIsShowVoteRequire", {
            isShowVoteRequire: true
          });
          return;
        }
        let res = null;
        // 区分模式
        if (this.mode === "buy") {
          if (this.buyAcount < 0.0001) {
            this.$vux.toast.show({
              text: this.$t("amount-error")
            });
            return;
          }
          // 买入buy
          res = await this.buyrex({
            assert: toAssertSymbolWithoutComma(this.buyAcount, 4, "EOS"),
            mode: this.buymode[0] || "liquid"
          });
        } else {
          // 卖出sell
          if (this.sellAcount < 1) {
            this.$vux.toast.show({
              text: this.$t("amount-error") + ":(Amount >= 1)"
            });
            return;
          }
          let forecast_sell_value = this.sellAcount * this.rexRate;
          res = await this.sellrex({
            assert: toAssertSymbolWithoutComma(this.sellAcount, 4, "REX"),
            isLiquid: this.isLiquid,
            estimate: toAssertSymbolWithoutComma(forecast_sell_value, 4, "EOS")
          });
        }
        if (res.transaction_id) {
          this.$vux.toast.show({
            text: this.$t("transaction-success")
          });
        }
      } catch (error) {
        alert(JSON.stringify(error));
      }
    },
    // 强制Picker显示数据为name
    formatPicker(value, name) {
      return name;
    },
    // 快速选择
    quick(rate) {
      let balance = 0;
      // 先区分mode
      if (this.mode === "buy") {
        switch (this.buymode[0]) {
          case "liquid":
            balance = this.liquidBalance;
            break;
          case "rexfund":
            balance = this.rexFund && getAssertCount(this.rexFund.balance);
            break;
          case "stakedcpu":
            balance = getAssertCount(this.userStaked.cpu_weight);
            break;
          case "stakednet":
            balance = getAssertCount(this.userStaked.net_weight);
            break;
          default:
            break;
        }
        // 买入buy
        this.buyAcount = toFixed(balance * rate);
        console.log(this.buyAcount);
      } else {
        // 卖出sell
        balance = this.maturedRex;
        this.sellAcount = toFixed(balance * rate);
      }
    },
    ...mapActions([
      "sellrex",
      "buyrex",
      "queryMyRexqueue",
      "queryRexqueue",
      "updateRex"
    ])
  },
  watch: {
    i18n(val, oldval) {
      if (val !== oldval) {
        this.buymodeList = [
          [
            {
              name: this.$t("buy_rex_by_liquid"),
              value: "liquid"
            },
            {
              name: this.$t("buy_rex_by_fund"),
              value: "rexfund"
            },
            {
              name: this.$t("buy_rex_by_cpu"),
              value: "stakedcpu"
            },
            {
              name: this.$t("buy_rex_by_net"),
              value: "stakednet"
            }
          ]
        ];
      }
    },
    // 切换支付方式时,将`this.buyAcount`重置
    buymode() {
      this.buyAcount = null;
      this.sellAcount = null;
    },
    buyAcount(val) {
      // rexPrice: EOS/REX
      const forecast_buy_value = val / this.rexRate;
      // 保留4位小数
      this.forecast_buy_value = toAssertSymbol(forecast_buy_value, 4, "REX");
    },
    sellAcount(val) {
      const forecast_sell_value = val * this.rexRate;
      // 保留4位小数
      this.forecast_sell_value = toAssertSymbol(forecast_sell_value, 4, "EOS");
    }
  },
  computed: {
    // 已经过期，但是未更新的数组
    rex_maturities() {
      return (
        this.rexBal &&
        this.rexBal.rex_maturities.length > 0 &&
        this.rexBal.rex_maturities.filter(item => {
          // 过期时间 - 当前时间 < 0, 意味着已经过期但是未更新
          return new Date(item.first).getTime() - new Date().getTime() < 0;
        })
      );
    },
    // REX已经解锁的数量
    maturedRex() {
      // 修复一个EOS的Bug，只有出售REX才会更新 `rex_maturities`的问题
      // 所以我们要循环遍历，去判断 `rex_maturities`中的 `rex_maturity`是否过期，如果过期的话，计算到 maturedREX的总量中
      // 已经成熟的REX数量（可以出售的数量）
      let addition = 0;
      if (this.rex_maturities && this.rex_maturities.length > 0) {
        this.rex_maturities.forEach(i => {
          console.log(i);
          addition = addition + Number(i.second);
        });
      }
      return (
        this.rexBal && (Number(this.rexBal.matured_rex) + addition) / 10000
      );
    },
    // REX价格
    rexRate() {
      if (!this.rexPool) return;
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
    rexBalance() {
      return getAssertCount(this.rexBal && this.rexBal.rex_balance);
    },
    i18n() {
      return this.$store.state.i18n.locale;
    },
    sellqueue() {
      return this.$store.state.sellqueue || [];
    },
    ...mapState([
      "liquidBalance",
      "rexBal",
      "rexFund",
      "rexPool",
      "userStaked",
      "isVoted",
      "userQueue"
    ])
  },
  components: {
    InlineXSwitch,
    PopupPicker,
    Group
  }
};
</script>

<style lang="less" scoped>
.container {
  padding: 0 15px;
}
.button-group {
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
  .button {
    font-size: 16px;
    color: #323232;
    text-align: center;
    width: 165px;
    height: 50px;
    line-height: 50px;
    text-align: center;
    background: #ffffff;
    border: 1px solid #e8e8e8;
    border-radius: 5px;
    &.active {
      background: rgba(62, 104, 143, 0.05);
      border: 1px solid #3e688f;
      border-radius: 5px;
      color: #3e688f;
    }
  }
}
.info-container {
  border-top: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  background: #ffffff;
  box-shadow: inset 0 0 0 0 #e8e8e8, inset 0 0 0 0 #e8e8e8;
  display: flex;
  flex-direction: column;
  &.independent {
    .rex-balance {
      padding: 10px 0px;
    }
    // margin-top: 0.77em;
    margin-bottom: 10px;
  }
  .buy,
  .rex-balance,
  .forecast-values {
    padding: 15px 0;
    display: flex;
    justify-content: space-between;
    margin: 0 15px;
    .title {
      align-self: center;
    }
    .unit {
      font-size: 16px;
      color: #323232;
      text-align: right;
      line-height: 24px;
      margin-left: 0.5ch;
    }
    border-bottom: 1px solid #e8e8e8;
    &:last-child {
      border-bottom: 0;
    }
  }
  h1 {
    font-size: 14px;
    color: #888888;
    line-height: 22px;
  }
  input.number-input {
    font-family: "MarkPro-Medium";
    text-align: right;
    margin-bottom: 15px;
    width: 192px;
    height: 44px;
    border: none;
    background: #f5f5f5;
    border-radius: 5px;
    appearance: none;
    color: #323232;
    font-size: 20px;
    line-height: 24px;
    padding-right: 15px;

    &::placeholder {
      font-family: "MarkPro-Medium";
      font-size: 20px;
      line-height: 24px;
      color: #aaaaaa;
    }
  }
  .number-medium {
    font-size: 18px;
    color: #323232;
    text-align: right;
    line-height: 24px;
  }
}

.payment-methods {
  margin-bottom: 10px;
}
.payment-methods /deep/ .weui-label {
  font-size: 14px;
  color: #888888;
  line-height: 22px;
  font-weight: bold;
}

.payment-methods /deep/ .vux-popup-picker-value.vux-cell-value {
  color: #323232;
}

.payment-methods /deep/.weui-cells {
  margin-top: 0;
}
// 确认XX
.button-confirm {
  margin: 30px 0;
  background: #4a4a4a;
  border-radius: 2px;
  text-align: center;
  font-size: 18px;
  width: 100%;
  height: 44px;
  line-height: 44px;
  font-size: 17px;
  color: #ffffff;
}
// 快速选择
.quick-button-group {
  display: flex;
  justify-content: space-between;
  .quick-button {
    font-family: "MarkPro";
    font-size: 14px;
    color: #3e688f;
    letter-spacing: 0;
    text-align: center;
    border: 1px solid #cccccc;
    border-radius: 2px;
    width: 52px;
    padding: 3px 0;
    .touchable();
  }
}
.touchable {
  &:active {
    opacity: 0.7;
  }
}

.question {
  position: relative;
  top: 3px;
  left: 3px;
  display: inline-block;
  color: #ffffff;
  width: 16px;
  height: 16px;
  img {
    width: 100%;
    height: 100%;
  }

  &.gray {
    img {
      filter: invert(68%) sepia(2%) saturate(0%) hue-rotate(37deg)
        brightness(93%) contrast(82%);
    }
  }
}
</style>
