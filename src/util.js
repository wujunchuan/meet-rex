/**
 * 保留{decimal}位小数，不四舍五入, 默认为保留4位小数
 * @author JohnTrump
 */
export const toFixed = (num, decimal = 4) => {
  const DECIMAL = Math.pow(10, decimal);
  return Math.floor(num * DECIMAL) / DECIMAL;
};

/**
 * 将格式如 1.2345 的number转换成格式如 `1.2345 EOS` 的字符串
 * @author JohnTrump
 * @param {Number} num 数字
 * @param {Number} decimal default=4 精度
 * @param {String} symbol 符号 default='EOS'
 */
export const toAssertSymbol = (num, decimal = 4, symbol = "EOS") => {
  return toFixed(num, decimal).toFixed(decimal) + " " + symbol;
};

/**
 * 根据客户端返回的permissions，去解析并且获取正确的权限
 * @author JohnTrump
 * @param {String} str 客户端返回的权限标识符
 */
export const getPermission = str => {
  let authority = "active"; // 假定权限为active
  let permissions = [];
  try {
    let hasActive = false;
    permissions = str.split("&&");
    if (permissions.length === 1) {
      authority = permissions[0];
    } else {
      // 判断是否有active权限
      for (let i = 0; i < permissions.length; i++) {
        if (permissions[i] === "active") {
          hasActive = true;
        }
      }
      // 缺少active权限，才会去默认取第一个权限
      if (!hasActive) {
        authority = permissions[0];
      }
    }
    return authority;
  } catch (error) {
    console.error("getPermissionError", error);
  }
};
