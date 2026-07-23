// lib/calculate-balances.js

export function calculateBalances(memberIds, expenses, settlements) {
  const totals = Object.fromEntries(memberIds.map((id) => [id, 0]));
  const ledger = {};
  memberIds.forEach((a) => {
    ledger[a] = {};
    memberIds.forEach((b) => {
      if (a !== b) ledger[a][b] = 0;
    });
  });

  for (const exp of expenses) {
    const payer = exp.paidByUserId;
    for (const split of exp.splits) {
      if (split.userId === payer || split.paid) continue;
      const debtor = split.userId;
      const amt = split.amount;

      totals[payer] += amt;
      totals[debtor] -= amt;

      ledger[debtor][payer] += amt;
    }
  }

  for (const s of settlements) {
    totals[s.paidByUserId] += s.amount;
    totals[s.receivedByUserId] -= s.amount;

    ledger[s.paidByUserId][s.receivedByUserId] -= s.amount;
  }

  memberIds.forEach((a) => {
    memberIds.forEach((b) => {
      if (a >= b) return;
      const diff = ledger[a][b] - ledger[b][a];
      if (diff > 0) {
        ledger[a][b] = diff;
        ledger[b][a] = 0;
      } else if (diff < 0) {
        ledger[b][a] = -diff;
        ledger[a][b] = 0;
      } else {
        ledger[a][b] = ledger[b][a] = 0;
      }
    });
  });

  return { totals, ledger };
}