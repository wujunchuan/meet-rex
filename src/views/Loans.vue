<template>
  <div class="loans">
    <h1>Loans</h1>
    <template v-for="(loan, index) in loansList">
      <a :key="index" @click="navto(loan)">
        <div>
          <span>{{ loan.type }} : {{ loan.total_staked }}</span>
          <span>租金：{{ loan.payment }}</span>
        </div>
        <div>
          <span>接收者: {{ loan.payment }}</span>
          <span>续租池: {{ loan.balance }}</span>
          <span
            >续租时间：
            {{
              loan.expiration | formatTime({ format: "YY-MM-DD HH:mm" })
            }}</span
          >
        </div>
      </a>
    </template>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  methods: {
    navto(loan) {
      this.$router.push({ name: "loans-detail", params: { loan } });
      console.log(loan);
    }
  },
  computed: {
    loansList() {
      let cpuLoans = (this.cpuLoans || []).map(obj => {
        obj.type = "CPU";
        return obj;
      });
      let netLoans = (this.netLoans || []).map(obj => {
        obj.type = "NET";
        return obj;
      });
      let loansList = [...cpuLoans, ...netLoans];
      // 根据时间来排序
      // early -> older
      loansList.sort((a, b) => {
        let a_time = new Date(a.expiration).getTime();
        let b_time = new Date(b.expiration).getTime();
        return a_time - b_time;
      });
      console.log(loansList);
      return loansList;
    },
    ...mapState(["cpuLoans", "netLoans"])
  }
};
</script>

<style lang="less" scoped>
.loans {
}
</style>
