import Vue from "vue";
import Vuex from "vuex";
import http from "./http";
// import router from "./router";

import Eos from "eosjs";
import ScatterJS from "scatterjs-core";
import ScatterEOS from "scatterjs-plugin-eosjs";
import _network from "./config/network";
const network = Object.assign({}, _network);
const requiredFields = { accounts: [network] };

Vue.use(Vuex);

// import { toFixed } from "./util";

export default new Vuex.Store({
  state: {
    account: null, // 当前账号名(Scatter获取)
    scatter: null, // Global Scatter Object
    eos: null, // Global Eos Obj
    loadingShow: true, // Loading status
    liquidBalance: 0,
    rexPool: null,
    rexBal: null,
    rexProfits: null
  },
  mutations: {
    setLiquidBalance(state, payload) {
      state.liquidBalance = Number(payload.liquidBalance);
    },
    setLoadingShow(state, payload) {
      state.loadingShow = payload.loadingShow;
    },
    setEos(state, payload) {
      state.eos = payload.eos;
    },
    setScatter(state, payload) {
      state.scatter = payload.scatter;
    },
    setAccount(state, payload) {
      state.account = payload.account;
    },
    setRexPool(state, payload) {
      state.rexPool = payload.rexPool;
    },
    setRexBal(state, payload) {
      state.rexBal = payload.rexBal;
    },
    setRexProfits(state, payload) {
      state.rexProfits = payload.rexProfits;
    }
  },
  actions: {
    // 初始化 Scatter
    initScatter({ commit, state }) {
      return new Promise(async (resolve, reject) => {
        if (state.scatter && state.eos) {
          resolve({ scatter: state.scatter, eos: state.eos });
          return;
        }
        // for MEETONE
        if (window.scatter && window.scatter.isInject) {
          window.ScatterJS.scatter = window.scatter;
        }
        let connect = null;
        try {
          ScatterJS.plugins(new ScatterEOS());
          connect = await ScatterJS.scatter.connect("REX | MEET.ONE");
          if (!connect) {
            alert("init failed");
            reject();
            return false;
          }
          const scatter = ScatterJS.scatter;
          window.scatter = scatter;
          commit("setScatter", { scatter });
          const scatterEos = scatter.eos(network, Eos);
          commit("setEos", { eos: scatterEos });
          window.ScatterJS = null;
          resolve({ scatter, eos: scatterEos });
        } catch (error) {
          reject(error);
        }
      });
    },
    // 获取帐号的可用余额
    getAccountBalance({ commit, state, dispatch }) {
      return new Promise(async resolve => {
        await dispatch("initScatter");
        let res = await state.eos.getTableRows({
          json: true, // Get the response as json
          code: "eosio.token", // Contract that we target
          scope: state.account.name, // Account that owns the data
          table: "accounts", // Table name
          limit: 10 // maximum number of rows that we want to get
        });
        if (res.rows && res.rows.length) {
          let liquidBalance = res.rows[0].balance.split(" ")[0];
          // 格式 1.234
          resolve(liquidBalance);
          commit("setLiquidBalance", { liquidBalance });
        }
        resolve();
      });
    },
    // 获取当前帐号
    getIdentity({ commit, state, dispatch }) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          if (state.scatter) {
            await state.scatter.getIdentity(requiredFields);
            const account = state.scatter.identity.accounts.find(
              x => x.blockchain === "eos"
            );
            commit("setAccount", { account });
            resolve();
          } else {
            reject();
          }
        } catch (error) {
          reject(error);
        }
      });
    },
    getRexBal({ commit, state, dispatch }) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          if (state.scatter) {
            let res = await state.eos.getTableRows({
              code: "eosio",
              json: true,
              limit: 1,
              lower_bound: state.account.name,
              scope: "eosio",
              table: "rexbal",
              upper_bound: state.account.name
            });
            if (res.rows && res.rows.length) {
              let rexBal = res.rows[0];
              resolve(rexBal);
              commit("setRexBal", { rexBal });
            }
          } else {
            reject();
          }
        } catch (error) {
          reject(error);
        }
      });
    },
    // 获取rexpool信息
    getRexPool({ commit, state, dispatch }) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          if (state.scatter) {
            let res = await state.eos.getTableRows({
              code: "eosio",
              json: true,
              scope: "eosio",
              table: "rexpool"
            });
            if (res.rows && res.rows.length) {
              let rexPool = res.rows[0];
              resolve(rexPool);
              commit("setRexPool", { rexPool });
            }
            resolve();
          } else {
            reject();
          }
        } catch (error) {
          reject(error);
        }
      });
    },
    // get rex profits
    getRexProfits({ commit }) {
      return new Promise(async (resolve, reject) => {
        try {
          let rexProfits = await http.get("/ethte-api/rex_profit");
          if (rexProfits.ramfee) {
            commit("setRexProfits", { rexProfits });
            resolve();
          } else {
            reject();
          }
        } catch (error) {
          reject(error);
        }
      });
    }
  }
});
