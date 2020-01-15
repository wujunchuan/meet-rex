<template>
  <div>
    <div v-if="account">
      <h2>个人信息</h2>
      <div>当前帐号{{ account.name }}</div>
      <div>EOS余额{{ liquidBalance }} EOS</div>
      <div>REX余额 {{ rexBalance | formatAssert({ symbol: "REX" }) }}</div>
      <div>
        可以出售的数量 {{ maturedRex | formatAssert({ symbol: "REX" }) }}
      </div>
      <div v-if="maturedRexForever">
        REX储蓄桶数量{{ maturedRexForever | formatAssert({ symbol: "REX" }) }}
      </div>
      <div>REX 对应价值: {{ rexValue | formatAssert({ decimal: 4 }) }}</div>
    </div>
    <!-- <div>
      <h2>已租用资源/资金量总量（{percent}%）</h2>
      <span>{a}/{b} EOS</span>
    </div>-->

    <div>
      <h2>总览信息</h2>
      <div>总共 # 贷款:{{ rexPool.loan_num }}</div>
      <div>REX 总量： {{ rexPool.total_rex }}</div>
      <div>EOS 总量： {{ rexPool.total_lendable }}</div>
      <div>EOS 已租赁 {{ rexPool.total_lent }}</div>
      <div>EOS 可租赁 {{ rexPool.total_unlent }}</div>
      <div>租赁收入: {{ rentFee }}</div>
      <div>帐号拍卖收入{{ nameFee }}</div>
      <div>ramFee:{{ ramFee }}</div>
      <div>
        租赁比例
        {{
          (rexPool.total_lent.split(" ")[0] /
            rexPool.total_lendable.split(" ")[0]) *
            100
        }}
        %
        <hr />
        计算：
        <div>
          {{ rexPool.total_lent.split(" ")[0] }}/{{
            rexPool.total_lendable.split(" ")[0]
          }}
          %
        </div>
      </div>
    </div>

    <div>
      <h2>价格</h2>
      <div>REX价格: {{ rexRate }}</div>
      <div>租赁费率: {{ rentRate }}</div>
    </div>

    <div>
      <h2>Actions Buttons</h2>
      <button @click="$store.dispatch('getCPULoan')">getCPULoan</button>
      <button @click="$store.dispatch('getNETLoan')">getNETLoan</button>
      <button @click="$store.dispatch('getUserProxy')">getUserProxy</button>
      <button @click="$store.dispatch('voteUs')">voteUs</button>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getAssertCount, toFixed } from "../util.js";
export default {
  computed: {
    maturedRexForever() {
      if (this.rexBal) {
        let { rex_maturities = [] } = this.rexBal;
        let maturedRexForeverIndex = rex_maturities.length - 1;
        if (maturedRexForeverIndex >= 0) {
          // 有这个记录的话
          let maturedTime = rex_maturities[maturedRexForeverIndex].key;
          // 随便取个 10天 ，反正这个时候早就他妈的matured了
          if (
            new Date(maturedTime + "Z").getTime() - new Date().getTime() >
            864000000
          ) {
            const result = rex_maturities[maturedRexForeverIndex].value / 10000;
            console.log(result);
            return result;
          }
        }
      }
      // REX储蓄桶
      return (
        this.rexBal &&
        this.rexBal.rex_maturities[this.rexBal.rex_maturities.length - 1]
      );
    },
    maturedRex() {
      // 已经成熟的REX数量（可以出售的数量）
      return this.rexBal && this.rexBal.matured_rex / 10000;
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
      return 660.0001;
    },
    // 帐号拍卖收入
    nameFee() {
      return 660.0001;
    },
    // RAMfee
    ramFee() {
      return 1660.0001;
    },
    ...mapState(["account", "liquidBalance", "rexPool", "rexBal"])
  }
};
</script>

<style lang="less" scoped></style>
