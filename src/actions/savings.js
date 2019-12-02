/*
 * savings
 * @Author: JohnTrump
 * @Date: 2019-11-24 17:10:51
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-11-24 17:13:14
 */
import { getPermission } from "../util.js";

// mvtosavings
// mvfrsavings
export default function(account, { assert, type = "to" }) {
  return [
    {
      account: "eosio",
      name: type === "to" ? "mvtosavings" : "mvfrsavings",
      authorization: [
        {
          actor: account.name,
          permission: getPermission(account.authority)
        }
      ],
      data: {
        owner: account.name,
        rex: assert
      }
    }
  ];
}
