/*
 * from loan_num amount
 * @Author: JohnTrump
 * @Date: 2019-11-24 17:17:51
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-11-24 17:24:45
 */
import { getPermission } from "../util.js";

export default function(account, { amount, loan_num, from, type = "cpu" }) {
  return [
    {
      account: "eosio",
      name: type === "cpu" ? "defcpuloan" : "defnetloan",
      authorization: [
        {
          actor: account.name,
          permission: getPermission(account.authority)
        }
      ],
      data: {
        from,
        loan_num,
        amount
      }
    }
  ];
}
