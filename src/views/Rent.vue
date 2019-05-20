<template>
  <div class="rent">
    <div class="container">
      <div class="button-group">
        <div
          @click="mode = 'cpu'"
          class="button"
          :class="mode === 'cpu' ? 'active' : null"
        >
          CPU
        </div>
        <div
          @click="mode = 'net'"
          class="button"
          :class="mode === 'net' ? 'active' : null"
        >
          NET
        </div>
      </div>
    </div>
    <!-- CPU & NET input container -->
    <div class="resource-container">
      <group class="resource">
        <x-input
          :title="$t('loan_receiver')"
          text-align="right"
          :placeholder="$t('loan_receiver_default')"
          v-model="defaultReceiver"
        ></x-input>
        <x-input
          v-if="mode === 'cpu'"
          type="number"
          title="CPU"
          :placeholder="`${$t('loan_max')} ${max_cpu_rentable} EOS`"
          text-align="right"
          v-model="rentCPU"
        ></x-input>
        <x-input
          v-if="mode === 'net'"
          type="number"
          title="NET"
          :placeholder="`${$t('loan_max')} ${max_net_rentable} EOS`"
          text-align="right"
          v-model="rentNET"
        ></x-input>
      </group>
    </div>
    <!-- Rent Time container -->
    <div class="time-container" v-if="false">
      <group class="time">
        <x-input title="租赁时间" text-align="right" disabled>
          <div slot="right" class="time-right">
            <span class="icon icon-down">
              <img v-if="rentTime <= 1" src="../assets/down_unable.png" />
              <img v-else src="../assets/down.png" @click="--rentTime" />
            </span>
            <span class="rent-time">{{ showRentTime }}</span>
            <span class="icon icon-up" @click="++rentTime">
              <img src="../assets/up.png" />
            </span>
            <span class="rent-time">天</span>
          </div>
        </x-input>
      </group>
    </div>
    <!-- 租金预估 -->
    <div class="forecast-container">
      <group class="forecast">
        <x-input :title="$t('loan_estimate')" text-align="right">
          <span slot="right" class="unit">{{ forecast }}</span>
        </x-input>
      </group>
    </div>

    <!-- 注意事项 -->
    <div class="note-container">
      <div class="notes">
        {{ $t("notice") }}
        <li>{{ $t("loan_notice_1", { rentRate: rentRate }) }}</li>
      </div>
    </div>

    <!-- 确认按钮 -->
    <div class="confirm-container">
      <div class="button-confirm touchable" @click="pushTransaction">
        {{ $t("confirm_borrow") }}
      </div>
    </div>
  </div>
</template>

<script>
import { XInput, Group } from "vux";
import {
  getAssertCount,
  toFixed,
  toAssertSymbol,
  toAssertSymbolWithoutComma
} from "../util";
import { mapState, mapActions } from "vuex";
export default {
  data() {
    return {
      mode: "cpu",
      receiver: null,
      rentCPU: null,
      rentNET: null,
      rentTime: 1 // 30天为1单位,最小为1
    };
  },
  computed: {
    defaultReceiver: {
      get() {
        return this.account && this.account.name;
      },
      set(val) {
        this.receiver = val;
      }
    },
    fundBalance() {
      return this.rexFund && getAssertCount(this.rexFund.balance);
    },
    // 最多可租赁
    max_cpu_rentable() {
      return toFixed((this.fundBalance * this.rentRate) / this.rentTime);
    },
    max_net_rentable() {
      return toFixed((this.fundBalance * this.rentRate) / this.rentTime);
    },
    // 预估租赁NET价格【一单位】
    forecastNET() {
      let rentNET = this.rentNET || 0;
      return this.rentNET && this.rentRate && rentNET / this.rentRate;
    },
    // 预估租赁CPU价格【一单位】
    forecastCPU() {
      let rentCPU = this.rentCPU || 0;
      return this.rentCPU && this.rentRate && rentCPU / this.rentRate;
    },
    // 预估租金
    forecast() {
      if (this.mode === "cpu") {
        let forecastCPU = this.forecastCPU || 0;
        return toAssertSymbol(forecastCPU * this.rentTime);
      } else {
        let forecastNET = this.forecastNET || 0;
        return toAssertSymbol(forecastNET * this.rentTime);
      }
    },
    showRentTime() {
      return this.rentTime * 30;
    },
    // 资源价格
    rentRate() {
      if (!this.rexPool) return;
      // 单位: EOS * 30天 / EOS
      let {
        total_rent = "0.0000 EOS",
        total_unlent = "1.0000 EOS"
      } = this.rexPool;
      total_rent = getAssertCount(total_rent);
      total_unlent = getAssertCount(total_unlent);
      let result = toFixed(total_unlent / total_rent, 4);
      return result;
    },
    ...mapState(["rexPool", "rexFund", "account"])
  },
  methods: {
    pushTransaction() {
      let receiver = this.receiver || this.defaultReceiver;
      if (receiver.length > 12) {
        this.$vux.toast.show({
          text: this.$t("error_account_length", { receiver: receiver })
        });
        return;
      }
      // 区分 mode
      if (this.mode === "cpu") {
        if (!this.rentCPU) {
          this.$vux.toast.show({
            text: this.$t("amount-error")
          });
          return;
        }
        this.cpuLoanTransaction();
      } else {
        if (!this.rentNET) {
          this.$vux.toast.show({
            text: this.$t("amount-error")
          });
          return;
        }
        this.netLoanTransaction();
      }
    },
    async cpuLoanTransaction() {
      try {
        let res = await this.rentcpu({
          loan_payment: toAssertSymbolWithoutComma(this.forecastCPU),
          receiver: this.receiver || this.defaultReceiver
        });

        if (res && res.transaction_id) {
          this.$vux.toast.show({
            text: this.$t("transaction-success")
          });
        }
      } catch (error) {
        console.error(error);
        alert(JSON.stringify(error));
      }
    },
    async netLoanTransaction() {
      try {
        let res = await this.rentnet({
          loan_payment: toAssertSymbolWithoutComma(this.forecastNET),
          receiver: this.receiver || this.defaultReceiver
        });
        if (res && res.transaction_id) {
          this.$vux.toast.show({
            text: this.$t("transaction-success")
          });
        }
      } catch (error) {
        console.error(error);
        alert(JSON.stringify(error));
      }
    },
    ...mapActions(["rentcpu", "rentnet"])
  },
  watch: {
    rentNET(val) {
      let _val = Number(val);
      if (_val <= 0) {
        this.rentNET = 0;
        return;
      }
      if (_val > this.max_net_rentable) {
        this.rentNET = toFixed(this.max_net_rentable);
      }
    },
    rentCPU(val) {
      let _val = Number(val);
      if (_val <= 0) {
        this.rentCPU = 0;
        return;
      }
      if (_val > this.max_cpu_rentable) {
        this.rentCPU = toFixed(this.max_cpu_rentable);
      }
    }
  },
  components: {
    XInput,
    Group
  }
};
</script>

<style lang="less" scoped>
/deep/ .weui-label {
  font-size: 16px;
  color: #323232;
  line-height: 24px;
}

.forecast {
  /deep/ .unit {
    margin-left: 0.5em;
    font-size: 16px;
    color: #323232;
    line-height: 24px;
  }
}

.note-container {
  padding: 20px 15px;
}
.confirm-container {
  padding: 0 15px;
  margin-top: 20px;
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
.touchable {
  &:active {
    opacity: 0.7;
  }
}
.resource {
  /deep/ .weui-cells {
    margin-top: 0;
  }
  /deep/ .weui-input {
    font-size: 16px;
    line-height: 24px;
    &::placeholder {
      color: #b5b5b5;
    }
  }
}

// 上下按钮
.icon-size {
  width: 20px;
  height: 20px;
}
.time-right {
  display: flex;
  justify-items: center;
  align-items: center;
}
.rent-time {
  font-size: 16px;
  color: #323232;
  line-height: 24px;
}
.icon {
  margin: 0 10px;
  img {
    position: relative;
    top: 3px;
    .icon-size();
    .touchable();
  }
}
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
</style>
