<template>
  <div class="fund">
    <div class="container">
      <div class="button-group">
        <div
          @click="mode = 'deposit'"
          class="button"
          :class="mode === 'deposit' ? 'active' : null"
        >
          {{ $t("deposit") }}
        </div>
        <div
          @click="mode = 'withdraw'"
          class="button"
          :class="mode === 'withdraw' ? 'active' : null"
        >
          {{ $t("withdraw") }}
        </div>
      </div>
    </div>
    <div class="info-container">
      <!-- Fund balance -->
      <div class="balance">
        <h1 class="title">{{ $t("fund-balance") }}</h1>
        <div class="number-medium">
          <template v-if="rexFund">
            {{ rexFund.balance }}
          </template>
          <template v-else>
            {{ $t("is-null") }}
          </template>
        </div>
      </div>
      <!-- 存入 -->
      <div class="deposit" v-if="mode === 'deposit'">
        <h1 class="title">{{ $t("deposit-amount") }}</h1>
        <div>
          <input
            v-model.number.trim="depositAcount"
            type="number"
            :placeholder="liquidBalance"
          />
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
      <!-- 取出 -->
      <div class="withdraw" v-if="mode === 'withdraw'">
        <h1 class="title">{{ $t("withdraw-amount") }}</h1>
        <div>
          <input
            v-model.number.trim="withdrawAcount"
            type="number"
            :placeholder="rexFund && rexFund.balance | getAssertCount"
          />
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
    </div>

    <div class="container">
      <div class="button-confirm touchable" @click="pushTransaction">
        {{
          mode === "deposit" ? $t("deposit-confirm") : $t("withdraw-confirm")
        }}
      </div>
    </div>

    <div class="container">
      <div class="notes">
        {{ $t("notice") }}
        <li>
          {{ $t("rex-notice-0") }}
        </li>
        <li>
          {{ $t("rex-notice-1") }}
        </li>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import {
  getAssertCount,
  toFixed,
  getPermission,
  toAssertSymbolWithoutComma
} from "../util";
export default {
  name: "fund",
  computed: {
    ...mapState(["rexFund", "liquidBalance", "eos", "account"])
  },
  data() {
    return {
      mode: "deposit",
      depositAcount: null,
      withdrawAcount: null
    };
  },
  methods: {
    // 发送交易
    async pushTransaction() {
      const account = this.account;
      if (this.mode === "deposit") {
        if (this.depositAcount < 0.0001) {
          this.$vux.toast.show({
            text: this.$t("amount-error")
          });
          return;
        }
        let amount = toAssertSymbolWithoutComma(this.depositAcount);
        try {
          this.$store.commit("setLoadingShow", { loadingShow: true });
          let res = await this.eos.contract("eosio").then(contract => {
            return contract.deposit(this.account.name, amount, {
              authorization:
                account.name + "@" + getPermission(account.authority)
            });
          });
          this.$vux.toast.show({
            text: this.$t("transaction-success")
          });
          console.log(res);
          setTimeout(() => {
            // // 获取帐号余额
            this.$store.dispatch("getAccountBalance");
            // 获取rexfund
            this.$store.dispatch("getRexFund");
          }, 1200);
        } catch (error) {
          alert(JSON.stringify(error));
        } finally {
          this.$store.commit("setLoadingShow", { loadingShow: false });
        }
      } else {
        if (this.withdrawAcount < 0.0001) {
          this.$vux.toast.show({
            text: this.$t("amount-error")
          });
          return;
        }
        let amount = toAssertSymbolWithoutComma(this.withdrawAcount);
        try {
          this.$store.commit("setLoadingShow", { loadingShow: true });
          let res = await this.eos.contract("eosio").then(contract => {
            return contract.withdraw(this.account.name, amount, {
              authorization:
                account.name + "@" + getPermission(account.authority)
            });
          });
          this.$vux.toast.show({
            text: this.$t("transaction-success")
          });
          console.log(res);
          setTimeout(() => {
            // // 获取帐号余额
            this.$store.dispatch("getAccountBalance");
            // 获取rexfund
            this.$store.dispatch("getRexFund");
          }, 1200);
        } catch (error) {
          alert(JSON.stringify(error));
        } finally {
          this.$store.commit("setLoadingShow", { loadingShow: false });
        }
      }
    },
    // 快速选择
    quick(rate) {
      let balance = 0;
      // 先区分mode
      if (this.mode === "deposit") {
        // 存入
        balance = this.liquidBalance;
        this.depositAcount = toFixed(balance * rate);
      } else {
        // 取出
        balance = getAssertCount(this.rexFund.balance);
        this.withdrawAcount = toFixed(balance * rate);
      }
    }
  },
  watch: {
    depositAcount(val) {
      // 如果大于余额,则取最大余额
      const balance = this.liquidBalance;
      if (val > balance) {
        this.depositAcount = toFixed(balance);
      }
    },
    withdrawAcount(val) {
      const balance = getAssertCount(this.rexFund.balance);
      if (val > balance) {
        this.withdrawAcount = toFixed(balance);
      }
    }
  },
  filters: {
    getAssertCount(str) {
      try {
        return Number(str.split(" ")[0]);
      } catch (error) {
        return 0;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.fund {
  .container {
    padding: 0 15px;
  }
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

  .balance,
  .deposit,
  .withdraw {
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
    &:last-child {
      border-bottom: 0;
    }
    border-bottom: 1px solid #e8e8e8;
    h1 {
      font-size: 14px;
      color: #888888;
      line-height: 22px;
    }
    input {
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
}

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

.notes {
  font-size: 12px;
  color: #888888;
  line-height: 22px;
  li {
    list-style: none;
    &::before {
      padding: 0 5px;
      content: "-";
    }
  }
}

.touchable {
  &:active {
    opacity: 0.7;
  }
}
</style>
