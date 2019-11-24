/*
 * Contract eosio - buyrex
 * @Author: JohnTrump
 * @Date: 2019-11-23 23:32:55
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-11-24 01:59:56
 */
import { getPermission } from "../util.js";

export default function(account, { mode = "rexfund", assert }) {
  let amount = assert;
  if (mode === "rexfund") {
    return [
      {
        account: "eosio",
        name: "buyrex",
        authorization: [
          {
            actor: account.name,
            permission: getPermission(account.authority)
          }
        ],
        data: {
          from: account.name,
          amount
        }
      }
    ];
  } else if (mode === "liquid") {
    return [
      {
        account: "eosio",
        name: "deposit",
        authorization: [
          {
            actor: account.name,
            permission: getPermission(account.authority)
          }
        ],
        data: {
          owner: account.name,
          amount
        }
      },
      {
        account: "eosio",
        name: "buyrex",
        authorization: [
          {
            actor: account.name,
            permission: getPermission(account.authority)
          }
        ],
        data: {
          from: account.name,
          amount
        }
      }
    ];
  } else if (mode === "stakedcpu" || mode === "stakednet") {
    return [
      {
        account: "eosio",
        name: "unstaketorex",
        authorization: [
          {
            actor: account.name,
            permission: getPermission(account.authority)
          }
        ],
        data: {
          owner: account.name,
          receiver: account.name,
          from_cpu: mode === "stakedcpu" ? amount : "0.0000 EOS",
          from_net: mode === "stakednet" ? amount : "0.0000 EOS"
        }
      }
    ];
  }
}
