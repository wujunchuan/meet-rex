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
import vuexI18n from "vuex-i18n";

import { getPermission } from "./util";

export default new Vuex.Store({
  modules: {
    i18n: vuexI18n.store
  },
  state: {
    account: null, // 当前账号名(Scatter获取)
    userStaked: null,
    scatter: null, // Global Scatter Object
    eos: Eos({
      httpEndpoint: `${_network.protocol}://${_network.host}:${_network.port}`
    }), // Global Eos Obj
    loadingShow: false, // Loading status
    liquidBalance: 0,
    rexPool: null,
    rexBal: null,
    rexProfits: null,
    rexFund: null,
    isInject: false,
    isShowBucket: false,
    isVoted: false, // 是否已经有代理投票或者投票满足21个节点，
    isShowVoteRequire: false,
    cpuLoans: null, // cpu 租赁记录
    netLoans: null // net 租赁记录
  },
  mutations: {
    setIsShowVoteRequire(state, { isShowVoteRequire }) {
      state.isShowVoteRequire = isShowVoteRequire;
    },
    setIsVoted(state, { isVoted }) {
      state.isVoted = isVoted;
      console.log("isVoted:", state.isVoted);
    },
    setIsShowBucket(state, { isShowBucket }) {
      state.isShowBucket = isShowBucket;
    },
    setUserStaked(state, payload) {
      state.userStaked = payload.delband;
      console.log("setUserStaked", state.userStaked);
    },
    setIsInject(state, payload) {
      state.isInject = payload.isInject;
    },
    setRexFund(state, payload) {
      state.rexFund = payload.rexFund;
    },
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
      console.log("rexbal:", payload.rexBal);
      state.rexBal = payload.rexBal;
    },
    setRexProfits(state, payload) {
      state.rexProfits = payload.rexProfits;
    },
    setCPULoans(state, payload) {
      state.cpuLoans = payload.cpuLoans;
      console.log("payload.cpuLoans", payload.cpuLoans);
    },
    setNETLoans(state, payload) {
      state.netLoans = payload.netLoans;
      console.log("payload.netLoans", payload.netLoans);
    }
  },
  actions: {
    // withdraw from loan's balance[cpu loan]
    defcpuloan({ state, dispatch, commit }, { loan_num, from, amount }) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          commit("setLoadingShow", { loadingShow: true });
          let account = state.account;
          let contract = await state.eos.contract("eosio");
          let res = await contract.defcpuloan(
            {
              from: from,
              loan_num: loan_num,
              amount: amount
            },
            {
              authorization:
                account.name + "@" + getPermission(account.authority)
            }
          );
          resolve(res);
          commit("setLoadingShow", { loadingShow: false });
        } catch (error) {
          commit("setLoadingShow", { loadingShow: false });
          reject(error);
        }
      });
    },
    // withdraw from loan's balance[net loan]
    defnetloan({ state, dispatch, commit }, { loan_num, from, amount }) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          commit("setLoadingShow", { loadingShow: true });
          let account = state.account;
          let contract = await state.eos.contract("eosio");
          let res = await contract.defnetloan(
            {
              from: from,
              loan_num: loan_num,
              amount: amount
            },
            {
              authorization:
                account.name + "@" + getPermission(account.authority)
            }
          );
          resolve(res);
          commit("setLoadingShow", { loadingShow: false });
        } catch (error) {
          commit("setLoadingShow", { loadingShow: false });
          reject(error);
        }
      });
    },
    // withdraw from loan's balance[cpu loan]
    fundcpuloan({ state, dispatch, commit }, { loan_num, from, amount }) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          commit("setLoadingShow", { loadingShow: true });
          let account = state.account;
          let contract = await state.eos.contract("eosio");
          let res = await contract.fundcpuloan(
            {
              from: from,
              loan_num: loan_num,
              payment: amount
            },
            {
              authorization:
                account.name + "@" + getPermission(account.authority)
            }
          );
          resolve(res);
          commit("setLoadingShow", { loadingShow: false });
        } catch (error) {
          commit("setLoadingShow", { loadingShow: false });
          reject(error);
        }
      });
    },
    // withdraw from loan's balance[net loan]
    fundnetloan({ state, dispatch, commit }, { loan_num, from, amount }) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          commit("setLoadingShow", { loadingShow: true });
          let account = state.account;
          let contract = await state.eos.contract("eosio");
          let res = await contract.fundnetloan(
            {
              from: from,
              loan_num: loan_num,
              payment: amount
            },
            {
              authorization:
                account.name + "@" + getPermission(account.authority)
            }
          );
          resolve(res);
          commit("setLoadingShow", { loadingShow: false });
        } catch (error) {
          commit("setLoadingShow", { loadingShow: false });
          reject(error);
        }
      });
    },
    voteUs({ state, dispatch, commit }) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          commit("setLoadingShow", { loadingShow: true });
          let account = state.account;
          let contract = await state.eos.contract("eosio");
          let res = await contract.voteproducer(
            {
              voter: account.name,
              proxy: "rex.m",
              producers: []
            },
            {
              authorization:
                account.name + "@" + getPermission(account.authority)
            }
          );
          resolve(res);
          if (res.transaction_id) {
            commit("setIsVoted", { isVoted: true });
          }
          commit("setLoadingShow", { loadingShow: false });
        } catch (error) {
          commit("setLoadingShow", { loadingShow: false });
          reject(error);
        }
      });
    },
    // 判断用户是否有代理投票,或者投票满21个节点[这个是参与REX买卖与资源租赁的先决条件]
    getUserProxy({ state, dispatch, commit }) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          if (state.scatter && state.account) {
            // let mock_name = "wujunchuan12";
            let res = await state.eos.getTableRows({
              code: "eosio",
              table: "voters",
              scope: "eosio",
              json: true,
              lower_bound: " " + state.account.name,
              upper_bound: " " + state.account.name,
              // lower_bound: " " + mock_name,
              // upper_bound: " " + mock_name,
              limit: 100
            });
            if (res.rows && res.rows.length) {
              let voters = res.rows[0];
              // 判断是否有代理投票
              let is_proxy = !!voters.proxy;
              let is_producer = voters.producers.length >= 21;
              // 设置 `isVoted` 具体的值
              commit("setIsVoted", { isVoted: is_proxy || is_producer });
              resolve(voters);
            }
          } else {
            reject();
          }
        } catch (error) {
          reject(error);
          console.log(error);
        }
      });
    },
    // 获取 cpuloan
    getCPULoan({ state, dispatch, commit }) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          if (state.scatter) {
            let res = await state.eos.getTableRows({
              code: "eosio",
              table: "cpuloan",
              json: true,
              key_type: "i64",
              scope: "eosio",
              table_key: "",
              lower_bound: " " + state.account.name,
              upper_bound: " " + state.account.name,
              index_position: 3,
              limit: 100
            });
            if (res.rows && res.rows.length) {
              let cpuLoans = res.rows;
              resolve(cpuLoans);
              commit("setCPULoans", { cpuLoans });
            } else {
              commit("setCPULoans", { cpuLoans: [] });
            }
          } else {
            reject();
          }
          resolve();
        } catch (error) {
          reject(error);
          console.log(error);
        }
      });
    },
    // 获取 netloan
    getNETLoan({ state, dispatch, commit }) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          if (state.scatter) {
            let res = await state.eos.getTableRows({
              code: "eosio",
              table: "netloan",
              json: true,
              key_type: "i64",
              scope: "eosio",
              table_key: "",
              lower_bound: " " + state.account.name,
              upper_bound: " " + state.account.name,
              index_position: 3,
              limit: 100
            });
            if (res.rows && res.rows.length) {
              let netLoans = res.rows;
              resolve(netLoans);
              commit("setNETLoans", { netLoans });
            } else {
              commit("setNETLoans", { netLoans: [] });
            }
          } else {
            reject();
          }
          resolve();
        } catch (error) {
          reject(error);
          console.log(error);
        }
      });
    },
    rentcpu(
      { state, commit, dispatch },
      { receiver = "", loan_payment, loan_fund } = {}
    ) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          if (state.scatter) {
            commit("setLoadingShow", { loadingShow: true });
            let account = state.account;
            let contract = await state.eos.contract("eosio");
            let res = await contract.rentcpu(
              {
                from: account.name,
                receiver: receiver || account.name,
                loan_payment: loan_payment,
                loan_fund: loan_fund || "0.0000 EOS"
              },
              {
                authorization:
                  account.name + "@" + getPermission(account.authority)
              }
            );
            resolve(res);
            commit("setLoadingShow", { loadingShow: false });
            dispatch("getRexFund"); // 获取rexfund信息
            dispatch("getCPULoan");
          } else {
            reject();
          }
        } catch (error) {
          commit("setLoadingShow", { loadingShow: false });
          reject(error);
          console.log(error);
        }
      });
    },
    rentnet(
      { state, commit, dispatch },
      { receiver = "", loan_payment, loan_fund } = {}
    ) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          if (state.scatter) {
            commit("setLoadingShow", { loadingShow: true });
            let account = state.account;
            let contract = await state.eos.contract("eosio");
            let res = await contract.rentnet(
              {
                from: account.name,
                receiver: receiver || account.name,
                loan_payment: loan_payment,
                loan_fund: loan_fund || "0.0000 EOS"
              },
              {
                authorization:
                  account.name + "@" + getPermission(account.authority)
              }
            );
            resolve(res);
            commit("setLoadingShow", { loadingShow: false });
            dispatch("getRexFund"); // 获取rexfund信息
            dispatch("getNETLoan");
          } else {
            reject();
          }
        } catch (error) {
          commit("setLoadingShow", { loadingShow: false });
          reject(error);
          console.log(error);
        }
      });
    },
    rentboth(
      { state, commit, dispatch },
      {
        receiver = "",
        cpu_loan_payment,
        cpu_loan_fund,
        net_loan_payment,
        net_loan_fund
      } = {}
    ) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          if (state.scatter) {
            commit("setLoadingShow", { loadingShow: true });
            let account = state.account;
            let authorization = {
              authorization:
                account.name + "@" + getPermission(account.authority)
            };
            let contract = await state.eos.contract("eosio");
            let res = await contract.transaction(tr => {
              tr.rentcpu(
                {
                  from: account.name,
                  receiver: receiver || account.name,
                  loan_payment: cpu_loan_payment,
                  loan_fund: cpu_loan_fund || "0.0000 EOS"
                },
                authorization
              );
              tr.rentnet(
                {
                  from: account.name,
                  receiver: receiver || account.name,
                  loan_payment: net_loan_payment,
                  loan_fund: net_loan_fund || "0.0000 EOS"
                },
                authorization
              );
            });
            resolve(res);
            commit("setLoadingShow", { loadingShow: false });
            dispatch("getRexFund"); // 获取rexfund信息
            // 获取CPU与NET Loans
            dispatch("getCPULoan");
            dispatch("getNETLoan");
          } else {
            reject();
          }
        } catch (error) {
          commit("setLoadingShow", { loadingShow: false });
          reject(error);
          console.log(error);
        }
      });
    },
    getUserStaked({ state, commit, dispatch }) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          if (state.scatter) {
            let res = await state.eos.getTableRows({
              json: true,
              code: "eosio",
              scope: state.account.name,
              table: "delband",
              lower_bound: " " + state.account.name,
              upper_bound: " " + state.account.name,
              limit: 1
            });
            if (res.rows && res.rows.length) {
              let delband = res.rows[0];
              resolve(delband);
              commit("setUserStaked", { delband });
            } else {
              reject();
            }
            resolve();
          }
        } catch (error) {
          reject(error);
        }
      });
    },
    // 买入REX
    buyrex({ state, commit, dispatch }, { assert, mode = "fund" } = {}) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          if (!state.scatter) {
            alert("no scatter");
            return;
          }
          commit("setLoadingShow", { loadingShow: true });
          let account = state.account;
          let contract = await state.eos.contract("eosio");
          let res = null;
          if (mode === "rexfund") {
            // - 通过FOUND -> buyrex
            res = await contract.buyrex(account.name, assert, {
              authorization:
                account.name + "@" + getPermission(account.authority)
            });
          } else if (mode === "liquid") {
            // 通过 liquidEOS -> buyrex
            // NOTE: smart contract multi-actions demo
            res = await contract.transaction(tr => {
              // first, deposit liquid-eos -> eos fund
              tr.deposit(account.name, assert, {
                authorization:
                  account.name + "@" + getPermission(account.authority)
              });
              // second, buyrex by eos fund
              tr.buyrex(account.name, assert, {
                authorization:
                  account.name + "@" + getPermission(account.authority)
              });
            });
          } else if (mode === "stakedcpu" || mode === "stakednet") {
            res = await contract.unstaketorex(
              {
                owner: account.name,
                receiver: account.name,
                from_cpu: mode === "stakedcpu" ? assert : "0.0000 EOS",
                from_net: mode === "stakednet" ? assert : "0.0000 EOS"
              },
              {
                authorization:
                  account.name + "@" + getPermission(account.authority)
              }
            );
          } else {
            alert("None payment mode selected");
          }

          resolve(res);
          commit("setLoadingShow", { loadingShow: false });

          setTimeout(() => {
            dispatch("getRexBal"); // 获取当前帐号REX解锁列表
            dispatch("getAccountBalance"); // 获取当前帐号余额
            dispatch("getRexFund"); // 获取rexfund信息
          }, 1000);
        } catch (error) {
          commit("setLoadingShow", { loadingShow: false });
          reject(error);
          console.log(error);
        }
      });
    },
    // 卖出REX
    sellrex(
      { state, commit, dispatch },
      { assert, isLiquid = false, estimate } = {}
    ) {
      return new Promise(async (resolve, reject) => {
        try {
          commit("setLoadingShow", { loadingShow: true });
          let account = state.account;
          let contract = await state.eos.contract("eosio");

          if (isLiquid) {
            // 出售然后自动提现
            let res = await contract.transaction(tr => {
              // assert unit: REX;
              tr.sellrex(account.name, assert, {
                authorization:
                  account.name + "@" + getPermission(account.authority)
              });
              // assert unit: EOS
              tr.withdraw(account.name, estimate, {
                authorization:
                  account.name + "@" + getPermission(account.authority)
              });
            });
            resolve(res);
            commit("setLoadingShow", { loadingShow: false });
          } else {
            let res = await contract.sellrex(account.name, assert, {
              authorization:
                account.name + "@" + getPermission(account.authority)
            });
            resolve(res);
            commit("setLoadingShow", { loadingShow: false });
          }

          setTimeout(() => {
            dispatch("getRexBal"); // 更新当前帐号REX质押详情
            dispatch("getAccountBalance"); // 更新当前帐号余额
          }, 1000);
        } catch (error) {
          commit("setLoadingShow", { loadingShow: false });
          reject(error);
        }
      });
    },
    // assert: `0.00001 REX`
    mvtosavings({ state, commit, dispatch }, { assert } = {}) {
      return new Promise(async (resolve, reject) => {
        try {
          commit("setLoadingShow", { loadingShow: true });
          let account = state.account;
          let res = await state.eos.contract("eosio").then(contract => {
            return contract.mvtosavings(account.name, assert, {
              authorization:
                account.name + "@" + getPermission(account.authority)
            });
          });
          resolve(res);
          commit("setLoadingShow", { loadingShow: false });
          setTimeout(() => {
            dispatch("getRexBal");
          }, 1000);
        } catch (error) {
          commit("setLoadingShow", { loadingShow: false });
          reject(error);
        }
      });
      // mv rex to savings
      // owner - name
      // assert - asset
    },
    mvfrsavings({ state, commit, dispatch }, { assert } = {}) {
      // // mv rex from savings
      // owner - name
      // assert - asset
      return new Promise(async (resolve, reject) => {
        try {
          commit("setLoadingShow", { loadingShow: true });
          let account = state.account;
          let res = await state.eos.contract("eosio").then(contract => {
            return contract.mvfrsavings(account.name, assert, {
              authorization:
                account.name + "@" + getPermission(account.authority)
            });
          });
          resolve(res);
          commit("setLoadingShow", { loadingShow: false });
          setTimeout(() => {
            dispatch("getRexBal");
          }, 1000);
        } catch (error) {
          commit("setLoadingShow", { loadingShow: false });
          reject(error);
        }
      });
    },

    // 退出登录
    logout({ state, commit }) {
      state.scatter.logout();
      commit("setLiquidBalance", { liquidBalance: null });
      commit("setAccount", { account: null });
      commit("setRexBal", { account: null });
    },
    login({ commit, dispatch }) {
      return new Promise(async (resolve, reject) => {
        try {
          commit("setLoadingShow", { loadingShow: true });
          await dispatch("getIdentity");
          commit("setLoadingShow", { loadingShow: false });
          resolve();
        } catch (error) {
          commit("setLoadingShow", { loadingShow: false });
          reject();
        }
      });
    },
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
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          let res = await state.eos.getTableRows({
            json: true, // Get the response as json
            code: "eosio.token", // Contract that we target
            scope: " " + state.account.name, // Account that owns the data
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
        } catch (error) {
          reject(error);
        }
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
            // 当前帐号抵押信息
            dispatch("getUserStaked");
            // 获取rexbal信息
            dispatch("getRexBal");
            // 获取帐号余额
            dispatch("getAccountBalance");
            // 获取rexfund信息
            dispatch("getRexFund");
            // 查看投票情况
            dispatch("getUserProxy");
            // 获取CPU与NET Loans
            dispatch("getCPULoan");
            dispatch("getNETLoan");
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
              lower_bound: " " + state.account.name,
              scope: "eosio",
              table: "rexbal",
              upper_bound: " " + state.account.name
            });
            if (res.rows && res.rows.length) {
              let rexBal = res.rows[0];
              resolve(rexBal);
              commit("setRexBal", { rexBal });
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
    // 获取rexpool信息
    getRexPool({ commit, state }) {
      return new Promise(async (resolve, reject) => {
        try {
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
        } catch (error) {
          reject(error);
        }
      });
    },
    // get rex profits
    getRexProfits({ commit }) {
      return new Promise(async (resolve, reject) => {
        try {
          let rexProfits = await http.get("/eos_api/rex_profit");
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
    },
    getRexFund({ commit, state, dispatch }) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          if (state.scatter) {
            let res = await state.eos.getTableRows({
              json: true,
              code: "eosio",
              scope: "eosio",
              table: "rexfund",
              table_key: "",
              lower_bound: " " + state.account.name,
              upper_bound: " " + state.account.name,
              limit: 1
            });
            if (res.rows && res.rows.length) {
              let rexFund = res.rows[0];
              resolve(rexFund);
              commit("setRexFund", { rexFund });
            }
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
