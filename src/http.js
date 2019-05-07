/*
 * Axios 网络请求封装
 * @Author: JohnTrump
 * @Date: 2019-04-25 14:16:54
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-05-07 19:18:39
 */

import axios from "axios";

// axios 配置
axios.defaults.timeout = 30000; // 超时时间 30s

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
    process.env.NODE_ENV === "production" ? "" : console.log(receiveData);
    // // 处理code为0的情况
    return receiveData;
  },
  error => {
    return Promise.reject(error);
  }
);

export default axios;
