/*
 * Contract eosio - rentcpu/net
 * @Author: JohnTrump
 * @Date: 2019-11-24 13:44:37
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-11-24 13:48:40
 */

import { getPermission } from "../util.js";

export default function(
  account,
  { type = "cpu", receiver = "", loan_payment, loan_fund }
) {
  return [
    {
      account: "eosio",
      name: type === "cpu" ? "rentcpu" : "rentnet",
      authorization: [
        {
          actor: account.name,
          permission: getPermission(account.authority)
        }
      ],
      data: {
        from: account.name,
        receiver: receiver || account.name,
        loan_payment: loan_payment,
        loan_fund: loan_fund || "0.0000 EOS"
      }
    }
  ];
}
