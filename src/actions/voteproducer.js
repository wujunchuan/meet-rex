/*
 * Contract eosio - voteproducer
 * @Author: JohnTrump
 * @Date: 2019-11-23 23:26:35
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-11-24 00:11:54
 */
import { getPermission } from "../util.js";

export default function(account, { proxy }) {
  return [
    {
      account: "eosio",
      name: "voteproducer",
      authorization: [
        {
          actor: account.name,
          permission: getPermission(account.authority)
        }
      ],
      data: {
        voter: account.name,
        proxy: proxy,
        producers: []
      }
    }
  ];
}
