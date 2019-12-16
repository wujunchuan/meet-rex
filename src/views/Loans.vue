<template>
  <div class="loans">
    <template v-for="(loan, index) in loansList">
      <a :key="index" @click="navto(loan)">
        <div class="card">
          <div class="left">
            <div class="part_1">
              <div class="total_staked">
                <h1>{{ loan.type }}</h1>
                <div class="amount">{{ loan.total_staked }}</div>
              </div>
              <div class="payment">
                <h1>{{ $t("loans_payment") }}</h1>
                <div class="amount">{{ loan.payment }}</div>
              </div>
            </div>
            <div class="part_2">
              <div class="wrapper">
                <div class="detail">
                  {{ $t("loans_time") }}:
                  {{ loan.expiration | formatTime({ format: "YYYY/MM/DD" }) }}
                </div>
                <div class="detail">
                  {{ $t("loans_receiver") }}:{{ loan.receiver }}
                </div>
              </div>
              <div class="wrapper">
                <div class="detail">
                  {{ $t("loans_balance") }}:{{ loan.balance }}
                </div>
              </div>
            </div>
          </div>
          <div class="right">
            <img src="../assets/icon-nav-grey.png" />
          </div>
        </div>
      </a>
    </template>
    <!-- 返回上级 -->
    <cancel-button :style="{ marginTop: '10px' }" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import CancelButton from "../components/CancelButton";

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
  },
  components: {
    CancelButton
  }
};
</script>

<style lang="less" scoped>
.card {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 15px;
  background: #ffffff;
  box-shadow: inset 0 0 0 0 #e8e8e8, inset 0 0 0 0 #e8e8e8;
  margin-bottom: 10px;
  border-top: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  .left {
    width: 94%;
    .part_1 {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #e8e8e8;
      box-shadow: inset 0 0 0 0 #e8e8e8;
      min-height: 63px;
      .amount {
        font-family: "MarkPro-Medium";
        font-size: 16px;
        color: #323232;
      }
      h1 {
        font-size: 12px;
        color: #888888;
        line-height: 16px;
      }
      .total_staked,
      .peyment {
        width: 50%;
      }
    }
    .part_2 {
      font-size: 12px;
      color: #323232;
      line-height: 18px;
      padding: 10px 0 15px;
      display: flex;
      // align-items: center;
      .wrapper {
        width: 50%;
      }
      .detail {
        display: inline-block;
      }
    }
  }
  // 箭头
  .right {
    display: flex;
    align-items: center;
    position: relative;
    left: 17px;
  }
}
</style>
