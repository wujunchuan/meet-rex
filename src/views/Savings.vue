<template>
  <div class="savings">
    <div class="container">
      <div class="button-group">
        <div
          @click="mode = 'lock'"
          :class="mode === 'lock' ? 'active' : null"
          class="button"
        >
          {{ $t("lock") }}
        </div>
        <div
          @click="mode = 'unlock'"
          :class="mode === 'unlock' ? 'active' : null"
          class="button"
        >
          {{ $t("unlock") }}
        </div>
      </div>
    </div>

    <div class="info-container">
      <!-- Saving balance -->
      <div class="balance">
        <h1 class="title">{{ $t("lock_account") }}</h1>
        <div class="number-medium">
          <template v-if="unmaturedRexForever">
            {{ unmaturedRexForever | formatAssert({ symbol: "REX" }) }}
          </template>
          <template v-else>
            {{ $t("is-null") }}
          </template>
        </div>
      </div>

      <!-- lock -->
      <div class="lock" v-if="mode === 'lock'">
        <h1 class="title">{{ $t("lock_amount") }}</h1>
        <div>
          <input
            type="number"
            v-model.number.trim="lockAcount"
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
      <!-- unlock -->
      <div class="lock" v-if="mode === 'unlock'">
        <h1 class="title">{{ $t("unlock_amount") }}</h1>
        <div>
          <input
            type="number"
            v-model.number.trim="unlockAcount"
            :placeholder="unmaturedRexForever"
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
    </div>

    <div class="container">
      <div class="button-confirm touchable" @click="pushTransaction">
        {{ mode === "lock" ? $t("confirm_lock") : $t("confirm_unlock") }}
      </div>
      <cancel-button />
    </div>

    <div class="container">
      <div class="notes">
        {{ $t("notice") }}
        <li>
          {{ $t("saving-notice-0") }}
        </li>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { toFixed, toAssertSymbolWithoutComma } from "../util";
import CancelButton from "../components/CancelButton";

export default {
  data() {
    return {
      mode: "lock", // `lock` & `unlock`
      lockAcount: null,
      unlockAcount: null
    };
  },
  computed: {
    unmaturedRexForever() {
      if (this.rexBal) {
        let { rex_maturities = [] } = this.rexBal;
        let unmaturedRexForeverIndex = rex_maturities.length - 1;
        if (unmaturedRexForeverIndex >= 0) {
          // 有这个记录的话
          let maturedTime = rex_maturities[unmaturedRexForeverIndex].key + "Z";
          // 随便取个 10天 ，反正这个时候早就他妈的matured了
          if (
            new Date(maturedTime).getTime() - new Date().getTime() >
            864000000
          ) {
            const result =
              rex_maturities[unmaturedRexForeverIndex].value / 10000;
            return result;
          }
        }
      }
      // REX储蓄桶
      return 0;
    },
    maturedRex() {
      // 已经成熟的REX数量（可以出售的数量）
      return this.rexBal && this.rexBal.matured_rex / 10000;
    },
    ...mapState(["account", "rexBal"])
  },
  methods: {
    pushTransaction() {
      // 先区分mode
      if (this.mode === "lock") {
        this.saving();
      } else {
        this.mvsaving();
      }
    },
    // 快速选择
    quick(rate) {
      let balance = 0;
      // 先区分mode
      if (this.mode === "lock") {
        // lock mode
        balance = this.maturedRex;
        this.lockAcount = toFixed(balance * rate);
      } else {
        // unlock mode
        balance = this.unmaturedRexForever;
        this.unlockAcount = toFixed(balance * rate);
      }
    },
    // 锁仓
    async saving() {
      if (this.lockAcount < 0.0001) {
        this.$vux.toast.show({
          text: this.$t("amount-error")
        });
        return;
      }
      // lockAcount
      try {
        let res = await this.mvtosavings({
          assert: toAssertSymbolWithoutComma(this.lockAcount, 4, "REX")
        });
        if (res.transaction_id) {
          this.$vux.toast.show({
            text: this.$t("transaction-success")
          });
        }
      } catch (error) {
        alert(JSON.stringify(error));
      }
    },
    // 解锁
    async mvsaving() {
      if (this.unlockAcount < 0.0001) {
        this.$vux.toast.show({
          text: this.$t("amount-error")
        });
        return;
      }
      try {
        // unlockAcount
        let res = await this.mvfrsavings({
          assert: toAssertSymbolWithoutComma(this.unlockAcount, 4, "REX")
        });
        if (res.transaction_id) {
          this.$vux.toast.show({
            text: this.$t("transaction-success")
          });
        }
      } catch (error) {
        alert(JSON.stringify(error));
      }
    },
    ...mapActions(["mvtosavings", "mvfrsavings"])
  },
  components: {
    CancelButton
  }
};
</script>

<style lang="less" scoped>
.savings {
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
  .lock,
  .unlock {
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
