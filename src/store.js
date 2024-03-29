import Vue from "vue";
import Vuex from "vuex";
import http from "./http";
// import router from "./router";

import { Api, JsonRpc } from "eosjs"; // eosjs@beta(20) and up
import ScatterJS from "scatterjs-core";
import ScatterEOS from "scatterjs-plugin-eosjs2";
import _network from "./config/network";
const network = Object.assign({}, _network);
const requiredFields = { accounts: [network] };

Vue.use(Vuex);

const rpc = new JsonRpc(
  `${network.protocol}://${network.host}:${network.port}`,
  {}
); // 初始化JsonPrc接口

export default new Vuex.Store({
  state: {
    account: undefined, // 当前账号名(Scatter获取)
    userStaked: undefined,
    scatter: undefined, // Global Scatter Object
    eos: new Api({ rpc }),
    loadingShow: false, // Loading status
    liquidBalance: 0,
    rexPool: undefined,
    rexBal: undefined,
    rexProfits: undefined,
    rexFund: undefined,
    isInject: false,
    isShowBucket: false,
    isVoted: false, // 是否已经有代理投票或者投票满足21个节点，
    isShowVoteRequire: false,
    cpuLoans: undefined, // cpu 租赁记录
    netLoans: undefined, // net 租赁记录
    sellqueue: [], // 出售REX的列表
    userQueue: undefined
  },
  mutations: {
    setUserQueue(state, queue) {
      state.userQueue = queue;
    },
    setSellqueue(state, queue) {
      state.sellqueue = queue;
    },
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
      //if (state.isInject) {
      // 如果是在客户端内, 则默认不显示Loading
      //state.loadingShow = false;
      //return;
      //}
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
      // TODO: comment this
      // state.account = {
      //   name: "abc123321.m"
      // };
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
    queryMyRexqueue({ commit, state, dispatch }) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          if (state.scatter) {
            let res = await rpc.get_table_rows({
              code: "eosio",
              json: true,
              limit: 1,
              scope: "eosio",
              table: "rexqueue",
              table_key: "",
              lower_bound: " " + state.account.name,
              upper_bound: " " + state.account.name
            });
            if (res.rows && res.rows.length) {
              let myqueue = res.rows[0];
              resolve(myqueue);
              commit("setUserQueue", myqueue);
            }
            resolve();
          }
        } catch (e) {
          reject(e);
        }
      });
    },
    // query sell rex queue
    queryRexqueue({ commit }) {
      return new Promise(async (resolve, reject) => {
        try {
          let res = await rpc.get_table_rows({
            json: true,
            code: "eosio",
            scope: "eosio",
            table: "rexqueue",
            table_key: "order_time",
            lower_bound: "",
            upper_bound: "",
            limit: 300,
            key_type: "i64",
            index_position: 2
          });
          let { rows } = res;
          // when is_open = 1 means the queue is waitting
          let globalSellQueue = rows.filter(item => item.is_open == 1);
          commit("setSellqueue", globalSellQueue);
          resolve(globalSellQueue);
        } catch (e) {
          reject(e);
        }
      });
    },
    // Update rex (include sell queue)
    // ref to https://github.com/EOSIO/eosio.contracts/blob/52fbd4ac7e6c38c558302c48d00469a4bed35f7c/contracts/eosio.system/src/rex.cpp#L205
    updateRex({ dispatch, commit, state }) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          commit("setLoadingShow", { loadingShow: true });
          let account = state.account;
          let res = await state.eos.transact(
            {
              actions: [...require("./actions/update").default(account)]
            },
            {
              blocksBehind: 3,
              expireSeconds: 60
            }
          );
          resolve(res);
          dispatch("queryRexqueue");
          dispatch("queryMyRexqueue");
        } catch (error) {
          reject(error);
        } finally {
          commit("setLoadingShow", { loadingShow: false });
        }
      });
    },
    // withdraw from loan's balance[cpu loan]
    defcpuloan({ state, dispatch, commit }, { loan_num, from, amount }) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          commit("setLoadingShow", { loadingShow: true });
          let account = state.account;
          let res = await state.eos.transact(
            {
              actions: [
                ...require("./actions/defloan").default(account, {
                  amount,
                  loan_num,
                  from,
                  type: "cpu"
                })
              ]
            },
            {
              blocksBehind: 3,
              expireSeconds: 60
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
          let res = await state.eos.transact(
            {
              actions: [
                ...require("./actions/defloan").default(account, {
                  amount,
                  loan_num,
                  from,
                  type: "net"
                })
              ]
            },
            {
              blocksBehind: 3,
              expireSeconds: 60
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

          let res = await state.eos.transact(
            {
              actions: [
                ...require("./actions/fundloan").default(account, {
                  amount,
                  loan_num,
                  from,
                  type: "cpu"
                })
              ]
            },
            {
              blocksBehind: 3,
              expireSeconds: 60
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
          let res = await state.eos.transact(
            {
              actions: [
                ...require("./actions/fundloan").default(account, {
                  amount,
                  loan_num,
                  from,
                  type: "net"
                })
              ]
            },
            {
              blocksBehind: 3,
              expireSeconds: 60
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
          let res = await state.eos.transact(
            {
              actions: [
                ...require("./actions/voteproducer").default(account, {
                  proxy: "rex.m"
                })
              ]
            },
            {
              blocksBehind: 3,
              expireSeconds: 60
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
            let res = await rpc.get_table_rows({
              code: "eosio",
              table: "voters",
              scope: "eosio",
              json: true,
              lower_bound: " " + state.account.name,
              upper_bound: " " + state.account.name,
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
            let res = await rpc.get_table_rows({
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
            let res = await rpc.get_table_rows({
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
            let res = await state.eos.transact(
              {
                actions: [
                  ...require("./actions/rent").default(account, {
                    type: "cpu",
                    loan_fund,
                    loan_payment,
                    receiver
                  })
                ]
              },
              {
                blocksBehind: 3,
                expireSeconds: 60
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
            let res = await state.eos.transact(
              {
                actions: [
                  ...require("./actions/rent").default(account, {
                    type: "net",
                    receiver,
                    loan_fund,
                    loan_payment
                  })
                ]
              },
              {
                blocksBehind: 3,
                expireSeconds: 60
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
            let res = await state.eos.transact(
              {
                actions: [
                  ...require("./actions/rent").default(account, {
                    type: "cpu",
                    loan_fund: cpu_loan_fund || "0.0000 EOS",
                    receiver,
                    loan_payment: cpu_loan_payment
                  }),
                  ...require("./actions/rent").default(account, {
                    type: "net",
                    loan_payment: net_loan_payment,
                    receiver,
                    loan_fund: net_loan_fund || "0.0000 EOS"
                  })
                ]
              },
              {
                blocksBehind: 3,
                expireSeconds: 60
              }
            );
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
            let res = await rpc.get_table_rows({
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
    buyrex({ state, commit, dispatch }, { assert, mode = "rexfund" } = {}) {
      return new Promise(async (resolve, reject) => {
        await dispatch("initScatter");
        try {
          if (!state.scatter) {
            alert("no scatter");
            return;
          }
          commit("setLoadingShow", { loadingShow: true });
          let account = state.account;
          let res = await state.eos.transact(
            {
              actions: [
                ...require("./actions/buyrex").default(account, {
                  mode,
                  assert
                })
              ]
            },
            {
              blocksBehind: 3,
              expireSeconds: 60
            }
          );
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
          let res = await state.eos.transact(
            {
              actions: [
                ...require("./actions/sellrex").default(account, {
                  assert,
                  estimate,
                  isLiquid
                })
              ]
            },
            {
              blocksBehind: 3,
              expireSeconds: 60
            }
          );
          resolve(res);
          commit("setLoadingShow", { loadingShow: false });

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
          let res = await state.eos.transact(
            {
              actions: [
                ...require("./actions/savings").default(account, {
                  assert,
                  type: "to"
                })
              ]
            },
            {
              blocksBehind: 3,
              expireSeconds: 60
            }
          );
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
          let res = await state.eos.transact(
            {
              actions: [
                ...require("./actions/savings").default(account, {
                  assert,
                  type: "from"
                })
              ]
            },
            {
              blocksBehind: 3,
              expireSeconds: 60
            }
          );
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
        await new Promise(resolve => {
          setTimeout(() => {
            ScatterJS.plugins(new ScatterEOS());
            resolve();
          }, 500);
        });
        try {
          connect = await ScatterJS.scatter.connect("REX | MEET.ONE");
          if (!connect) {
            alert("init failed");
            reject();
            return false;
          }
          const scatter = ScatterJS.scatter;
          window.scatter = scatter;
          commit("setScatter", { scatter });
          const scatterEos = scatter.eos(network, Api, { rpc, beta3: true });
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
          let res = await rpc.get_table_rows({
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
            dispatch("queryMyRexqueue");
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
            let res = await rpc.get_table_rows({
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
    getRexPool({ commit }) {
      return new Promise(async (resolve, reject) => {
        try {
          let res = await rpc.get_table_rows({
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
            let res = await rpc.get_table_rows({
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
