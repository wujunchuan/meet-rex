import { getPermission } from "../util.js";

export default function(account) {
  return [
    {
      account: "eosio",
      name: "updaterex",
      authorization: [
        {
          actor: account.name,
          permission: getPermission(account.authority)
        }
      ],
      data: {
        owner: account.name
      }
    }
  ];
}
