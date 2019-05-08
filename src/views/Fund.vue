<template>
  <div class="fund">
    <div class="button-group">
      <div
        @click="mode = 'deposit'"
        class="button"
        :class="mode === 'deposit' ? 'active' : null"
      >
        存入
      </div>
      <div
        @click="mode = 'withdraw'"
        class="button"
        :class="mode === 'withdraw' ? 'active' : null"
      >
        取出
      </div>
    </div>
    <!-- Fund balance -->

    <div class="balance">
      <h1>资金池余额</h1>
      {{ rexFund.balance }}
    </div>

    <!-- 存入 -->
    <div class="deposit" v-if="mode === 'deposit'">
      <h1>存入金额</h1>
      <input
        v-model.number.trim="depositAcount"
        type="number"
        :placeholder="liquidBalance + ' EOS'"
      />
    </div>

    <!-- 取出 -->
    <div class="withdraw" v-if="mode === 'withdraw'">
      <h1>取出金额</h1>
      <input
        v-model.number.trim="withdrawAcount"
        type="number"
        :placeholder="rexFund.balance"
      />
    </div>

    <!-- 快速选择 -->
    <div class="quick-button-group">
      <div class="quick-button" @click="quick(0.25)">25%</div>
      <div class="quick-button" @click="quick(0.5)">50%</div>
      <div class="quick-button" @click="quick(0.75)">75%</div>
      <div class="quick-button" @click="quick(1)">ALL</div>
    </div>

    <div class="button-confirm touchable" @click="pushTransaction">
      确认{{ mode === "deposit" ? "存入" : "取出" }}
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import {
  getAssertCount,
  toFixed,
  getPermission,
  toAssertSymbol
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
        let amount = toAssertSymbol(this.depositAcount);
        try {
          let res = await this.eos.contract("eosio").then(contract => {
            return contract.deposit(this.account.name, amount, {
              authorization:
                account.name + "@" + getPermission(account.authority)
            });
          });
          // TODO: 成功 更新余额
          console.log(res);
          setTimeout(() => {
            // // 获取帐号余额
            this.$store.dispatch("getAccountBalance");
            // 获取rexfund
            this.$store.dispatch("getRexFund");
          }, 1200);
        } catch (error) {
          alert(JSON.stringify(error));
        }
      } else {
        let amount = toAssertSymbol(this.withdrawAcount);
        try {
          let res = await this.eos.contract("eosio").then(contract => {
            return contract.withdraw(this.account.name, amount, {
              authorization:
                account.name + "@" + getPermission(account.authority)
            });
          });
          // TODO: 成功 更新余额
          console.log(res);
          setTimeout(() => {
            // // 获取帐号余额
            this.$store.dispatch("getAccountBalance");
            // 获取rexfund
            this.$store.dispatch("getRexFund");
          }, 1200);
        } catch (error) {
          alert(JSON.stringify(error));
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
  }
};
</script>

<style lang="less" scoped>
.button-group {
  .active {
    color: red;
  }
}

.button-confirm {
  text-align: center;
  font-size: 18px;
  width: 100%;
}
</style>
