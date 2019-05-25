<template>
  <div class="loans-detail">
    <!-- switch deposit/withdraw for loan balance -->
    <div class="container">
      <div class="button-group">
        <button
          :class="{ active: mode === 'deposit' }"
          @click="mode = 'deposit'"
        >
          Deposit
        </button>
        <button
          :class="{ active: mode === 'withdraw' }"
          @click="mode = 'withdraw'"
        >
          Withdraw
        </button>
      </div>
    </div>

    <div class="info-container">
      <div class="cell">
        <span class="cell-title"
          >租用 {{ detail.type === "CPU" ? "CPU" : "NET" }}</span
        >
        <span class="cell-number"> {{ detail.total_staked }}</span>
      </div>
      <div class="cell">
        <span class="cell-title">租金</span>
        <span class="cell-number">{{ detail.payment }}</span>
      </div>
      <div class="cell">
        <span class="cell-title">接收者</span>
        <span class="cell-number">{{ detail.receiver }}</span>
      </div>
      <!-- <div class="cell">
        <div class="cell-title">续租池余额</div>
        <div class="cell-number">{{ detail.balance }}</div>
      </div> -->
      <div class="cell">
        <span class="cell-title">下次续租时间</span>
        <span class="cell-number">{{
          detail.expiration | formatTime({ format: "YYYY-MM-DD HH:mm" })
        }}</span>
      </div>
    </div>

    <!-- operation pane -->
    <!-- mode: Deposit -->
    <div class="info-container operation" v-if="mode === 'deposit'">
      <div class="warn-wrapper">
        <img class="icon" src="../assets/icon-warn.png" />
        续租 30 天至少需要 {{ detail.payment }}
      </div>
      <div class="cell">
        <div class="cell-title">续租池余额</div>
        <div class="cell-number">{{ detail.balance }}</div>
      </div>
      <div class="cell cell-input">
        <div class="cell-title">继续存入</div>
        <div class="cell-number">
          <input
            type="number"
            v-model.number.trim="depositAmount"
            :placeholder="rexFund.balance.split(' ')[0]"
          />
          EOS
          <!-- 快速选择 -->
          <div class="quick-button-group">
            <div class="quick-button" @click="quick(0.25)">25%</div>
            <div class="quick-button" @click="quick(0.5)">50%</div>
            <div class="quick-button" @click="quick(0.75)">75%</div>
            <div class="quick-button" @click="quick(1)">ALL</div>
          </div>
        </div>
      </div>
      <!-- <div>{{ detail }}</div> -->
    </div>
    <!-- mode: Withdraw -->
    <div class="info-container operation" v-if="mode === 'withdraw'">
      <div class="warn-wrapper">
        <img class="icon" src="../assets/icon-warn.png" />
        续租 30 天至少需要 {{ detail.payment }}
      </div>
      <div class="cell">
        <div class="cell-title">续租池余额</div>
        <div class="cell-number">{{ detail.balance }}</div>
      </div>
      <div class="cell cell-input">
        <div class="cell-title">取出金额</div>
        <div class="cell-number">
          <input
            type="number"
            v-model.number.trim="withdrawAmount"
            :placeholder="detail.balance.split(' ')[0]"
          />
          EOS
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
      <!-- push transaction -->
      <div class="button-confirm touchable" @click="pushTransaction">
        {{ mode === "deposit" ? "确认续租" : "确认取出" }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { toAssertSymbolWithoutComma } from "../util";
export default {
  created() {
    if (!this.loan) {
      // 如果`this.props.loan`为空，跳转回去
      this.$router.push({ name: "loans" });
    }
  },
  // keep-alive life hook sequence:
  // created -> mounted -> activated
  activated() {
    this.detail = this.loan;
  },
  data() {
    return {
      detail: null,
      mode: "deposit",
      depositAmount: null, // 存入的金额
      withdrawAmount: null // 取出的金额
    };
  },
  props: ["loan"],
  computed: {
    // 交易的量
    amount() {
      if (this.mode === "deposit") {
        return Number(this.depositAmount);
      } else {
        return Number(this.withdrawAmount);
      }
    },
    ...mapState(["eos", "account", "rexFund"])
  },
  methods: {
    quick(rate) {
      console.log(rate);
      if (this.mode === "deposit") {
        // When the mode is deposit
        let maxAmount = Number(this.rexFund.balance.split(" ")[0]);
        let amount = maxAmount * rate;
        this.depositAmount = amount.toFixed(4);
      } else {
        // When the mode is withdraw
        let maxAmount = Number(this.detail.balance.split(" ")[0]);
        let amount = maxAmount * rate;
        this.withdrawAmount = amount.toFixed(4);
      }
    },
    pushTransaction() {
      // 如果数字出错，则返回
      if (this.amount < 0.0001) {
        this.$vux.toast.show({
          text: this.$t("amount-error")
        });
        return;
      }
      if (this.detail.type === "CPU") {
        this.handleCPULoan();
      } else if (this.detail.type === "NET") {
        this.handleNETLoan();
      }
    },
    handleCPULoan() {
      if (this.mode === "deposit") {
        this.handleFundcpuloan();
      } else {
        this.handleDefcpuloan();
      }
    },
    handleNETLoan() {
      if (this.mode === "deposit") {
        this.handleFundnetloan();
      } else {
        this.handleDefnetloan();
      }
    },
    updateLoan() {
      if (this.detail.type === "CPU") {
        this.updateCPULoan();
        this.$store.dispatch("getCPULoan");
        this.$store.dispatch("getRexFund");
      } else {
        this.updateNETLoan();
        this.$store.dispatch("getNETLoan");
        this.$store.dispatch("getRexFund");
      }
    },
    // 刷新cpuloan的详情【交易成功的话】
    async updateCPULoan() {
      let res = await this.eos.getTableRows({
        code: "eosio",
        scope: "eosio",
        table: "cpuloan",
        key_type: "i64",
        table_key: "",
        json: true,
        index_position: 1,
        lower_bound: "" + this.detail.loan_num,
        upper_bound: "" + this.detail.loan_num,
        limit: 100
      });
      if (res.rows && res.rows.length) {
        this.detail = Object.assign(this.detail, res.rows[0]);
      }
    },
    // 刷新netloan的详情【交易成功的话】
    async updateNETLoan() {
      let res = await this.eos.getTableRows({
        code: "eosio",
        scope: "eosio",
        table: "netloan",
        key_type: "i64",
        table_key: "",
        json: true,
        index_position: 1,
        lower_bound: "" + this.detail.loan_num,
        upper_bound: "" + this.detail.loan_num,
        limit: 100
      });
      if (res.rows && res.rows.length) {
        this.detail = Object.assign(this.detail, res.rows[0]);
      }
    },
    // 取cpu loan 的余额， amount 上限为此单子的balance
    async handleDefcpuloan() {
      try {
        let { loan_num, from } = this.loan;
        let res = await this.defcpuloan({
          loan_num,
          from,
          amount: toAssertSymbolWithoutComma(this.amount)
        });
        console.log(res);
        if (res.transaction_id) {
          this.$vux.toast.show({
            text: this.$t("transaction-success")
          });
          this.updateLoan();
        }
      } catch (error) {
        alert(JSON.stringify(error));
      }
    },
    // 取 net loan 的 balance, amount 上限为此单子的balance
    async handleDefnetloan() {
      try {
        let { loan_num, from } = this.loan;
        let res = await this.defnetloan({
          loan_num,
          from,
          amount: toAssertSymbolWithoutComma(this.amount)
        });
        console.log(res);
        if (res.transaction_id) {
          this.$vux.toast.show({
            text: this.$t("transaction-success")
          });
          this.updateLoan();
        }
      } catch (error) {
        alert(JSON.stringify(error));
      }
    },
    // 存入balance给cpu loan's balance
    async handleFundcpuloan() {
      try {
        let { loan_num, from } = this.loan;
        let res = await this.fundcpuloan({
          loan_num,
          from,
          amount: toAssertSymbolWithoutComma(this.amount)
        });
        console.log(res);
        if (res.transaction_id) {
          this.$vux.toast.show({
            text: this.$t("transaction-success")
          });
          this.updateLoan();
        }
      } catch (error) {
        alert(JSON.stringify(error));
      }
    },
    // 存入balance给net loan's balance
    async handleFundnetloan() {
      try {
        let { loan_num, from } = this.loan;
        let res = await this.fundnetloan({
          loan_num,
          from,
          amount: toAssertSymbolWithoutComma(this.amount)
        });
        console.log(res);
        if (res.transaction_id) {
          this.$vux.toast.show({
            text: this.$t("transaction-success")
          });
          this.updateLoan();
        }
      } catch (error) {
        alert(JSON.stringify(error));
      }
    },
    ...mapActions(["defcpuloan", "defnetloan", "fundcpuloan", "fundnetloan"])
  }
};
</script>

<style lang="less" scoped>
.container {
  padding: 0 15px;
  .button-group {
    display: flex;
    justify-content: space-between;
    padding: 20px 0;
  }
  button {
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
    .touchable();
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
  padding: 0 15px;
  .warn-wrapper {
    margin: 15px 0 5px 0;
    padding: 0 10px;
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #888888;
    background: #f5f5f5;
    border-radius: 4px;
    min-height: 32px;
  }
  .cell {
    &.cell-input {
      height: auto;
      padding: 15px 0;
    }
    display: flex;
    min-height: 44px;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e8e8e8; // last child ignore this
    &:last-child {
      border-bottom: none;
    }
    .cell-title {
      font-size: 16px;
      color: #323232;
      line-height: 22px;
    }
    .cell-number {
      font-family: "MarkPro-Medium";
      font-size: 16px;
      color: #323232;
      text-align: right;
      line-height: 24px;
    }
  }
  &.operation {
    margin: 10px 0;
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
  .touchable();
}
.touchable {
  &:active {
    opacity: 0.7;
  }
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
.icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
}
</style>
