/*
 * 默认网络配置
 * @Author: JohnTrump
 * @Date: 2019-04-19 16:24:44
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-12-16 15:20:10
 */
export default {
  blockchain: "eos",
  protocol: process.env.VUE_APP_RPC_PROTOCOL,
  host: process.env.VUE_APP_RPC_HOST,
  port: process.env.VUE_APP_RPC_PORT,
  chainId: process.env.VUE_APP_RPC_ID
};
