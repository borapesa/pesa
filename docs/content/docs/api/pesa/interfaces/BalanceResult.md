---
title: "Interface: BalanceResult"
---

Defined in: [packages/pesa/src/types/account.ts:21](https://github.com/borapesa/pesa/blob/2a2bfc77e53f612f2116dfed02985155a049cb84/packages/pesa/src/types/account.ts#L21)

Result of a balance inquiry — returns available balances
across all active currencies in the provider's wallet.

Use `pesa.getBalance()` to verify available funds before
initiating disbursements or to display wallet health in dashboards.

## Since

0.2.0

## Example

```ts
if (pesa.getBalance) {
  const { balances } = await pesa.getBalance();
  const tzsBalance = balances.find((b) => b.currency === 'TZS');
  console.log(`Available: TZS ${tzsBalance?.amount ?? 0}`);
}
```

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="balances"></a> `balances` | [`BalanceEntry`](BalanceEntry)[] | Per-currency balance entries. | [packages/pesa/src/types/account.ts:23](https://github.com/borapesa/pesa/blob/2a2bfc77e53f612f2116dfed02985155a049cb84/packages/pesa/src/types/account.ts#L23) |
| <a id="raw"></a> `raw?` | `unknown` | Raw provider response. | [packages/pesa/src/types/account.ts:25](https://github.com/borapesa/pesa/blob/2a2bfc77e53f612f2116dfed02985155a049cb84/packages/pesa/src/types/account.ts#L25) |
