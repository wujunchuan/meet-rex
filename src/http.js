/*
 * Axios 网络请求封装
 * @Author: JohnTrump
 * @Date: 2019-04-25 14:16:54
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-04-29 15:21:52
 */

import axios from "axios";

// axios 配置
axios.defaults.timeout = 30000; // 超时时间 30s

axios.defaults.baseURL = "hcb-api";

axios.defaults.headers = {
  // 头部带上这个参数，返回的错误就是中文
  lang: "ZH"
};

axios.interceptors.request.use(
  // Do something before request is sent
  config => {
    return config;
  },
  error => {
    // Do something with request error
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    let receiveData = response.data;
    // process.env.NODE_ENV === "production" ? "" : console.log(receiveData);
    // // 处理code为0的情况
    if (receiveData.errorcode == 0) {
      // 直接返回reponse中的data数据
      return receiveData.data;
    } else {
      console.log(receiveData);
      // 如果报错了，请按照以下格式进行处理
      return {
        errorcode: receiveData.errorcode,
        message: receiveData.message
      };
    }
  },
  error => {
    return Promise.reject(error);
  }
);

export default axios;
