/*
 * sell rex
 * @Author: JohnTrump
 * @Date: 2019-11-24 16:58:21
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-11-24 17:02:35
 */
import { getPermission } from "../util.js";

export default function(account, { assert, estimate, isLiquid = false }) {
  if (isLiquid) {
    return [
      {
        account: "eosio",
        name: "sellrex",
        authorization: [
          {
            actor: account.name,
            permission: getPermission(account.authority)
          }
        ],
        data: {
          from: account.name,
          rex: assert
        }
      },
      {
        account: "eosio",
        name: "withdraw",
        authorization: [
          {
            actor: account.name,
            permission: getPermission(account.authority)
          }
        ],
        data: {
          owner: account.name,
          amount: estimate
        }
      }
    ];
  } else {
    return [
      {
        account: "eosio",
        name: "sellrex",
        authorization: [
          {
            actor: account.name,
            permission: getPermission(account.authority)
          }
        ],
        data: {
          from: account.name,
          rex: assert
        }
      }
    ];
  }
}
