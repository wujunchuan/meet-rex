/**
 * 保留{decimal}位小数，不四舍五入, 默认为保留4位小数
 * @author JohnTrump
 */
export const toFixed = (num, decimal = 4) => {
  const DECIMAL = Math.pow(10, decimal);
  return Math.floor(num * DECIMAL) / DECIMAL;
};

/**
 * @param {Number | String} x 需要千分位的数字/字符串
 */
export const numberComma = x => {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

/**
 * 将格式如 1.2345 的number转换成格式如 `1.2345 EOS` 的字符串
 * 注意，这个方法是会有千分位的,如果需要使用千分位的方法，请使用`toAssertSymbolWithoutComma`
 * @author JohnTrump
 * @param {Number} num 数字
 * @param {Number} decimal default=4 精度
 * @param {String} symbol 符号 default='EOS'
 */

export const toAssertSymbol = (num, decimal = 4, symbol = "EOS") => {
  return numberComma(toFixed(num, decimal).toFixed(decimal)) + " " + symbol;
};

/**
 * 将格式如 1.2345 的number转换成格式如 `1.2345 EOS` 的字符串
 * 注意，这个方法是不会有千分位的
 * @author JohnTrump
 * @param {Number} num 数字
 * @param {Number} decimal default=4 精度
 * @param {String} symbol 符号 default='EOS'
 */
export const toAssertSymbolWithoutComma = (
  num,
  decimal = 4,
  symbol = "EOS"
) => {
  return toFixed(num, decimal).toFixed(decimal) + " " + symbol;
};

/**
 *
 * 将格式 如`1.2345 EOS` 的字符串转换成 1.234的数字
 * @param {String} str 格式如`1.2345 EOS`
 * 如果发生异常,则抛出0
 */
export const getAssertCount = str => {
  if (typeof str === "number") {
    return str;
  }
  try {
    return Number(str.split(" ")[0]);
  } catch (error) {
    return 0;
  }
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
    permissions = typeof str === "string" ? str.split("&&") : [];
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
