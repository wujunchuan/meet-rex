<template>
  <div class="loans-detail">
    <h1>Loans-detail</h1>
    <div>{{ detail }}</div>
    <!-- switch deposit/withdraw for loan balance -->
    <div>
      <button :class="{ red: mode === 'deposit' }" @click="mode = 'deposit'">
        Deposit
      </button>
      <button :class="{ red: mode === 'withdraw' }" @click="mode = 'withdraw'">
        Withdraw
      </button>
    </div>

    <!-- push transaction -->
    <button @click="pushTransaction">
      PushTransaction(0.0001 EOS);
    </button>

    <!-- 过期的实验 -->
    <div v-if="false">
      <div>
        <button @click="handleDefcpuloan">
          defcpuloan[only type is CPU]
        </button>
      </div>
      <div>
        <button @click="handleDefnetloan">
          defnetloan[only type is NET]
        </button>
      </div>
      <div>
        <button @click="handleFundcpuloan">
          fundcpuloan [CPU]
        </button>
      </div>
      <div>
        <button @click="handleFundnetloan">
          fundnetloan [NET]
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
export default {
  created() {
    if (!this.loan) {
      // 如果`this.props.loan`为空，跳转回去
      // TODO: remove this comment
      // this.$router.push({ name: "loans" });
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
      mode: "deposit"
    };
  },
  props: ["loan"],
  computed: {
    ...mapState(["eos", "account"])
  },
  methods: {
    pushTransaction() {
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
      } else {
        this.updateNETLoan();
        this.$store.dispatch("getNETLoan");
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
          amount: "0.0001 EOS"
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
          amount: "0.0001 EOS"
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
          amount: "0.0001 EOS"
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
          amount: "0.0001 EOS"
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
.loans-detail {
}
.red {
  color: red;
}
</style>
