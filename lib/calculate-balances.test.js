import { describe, it, expect } from "vitest";
import { calculateBalances } from "./calculate-balances";

describe("calculateBalances", () => {
  it("nets a simple debt between two people correctly", () => {
    const members = ["alice", "bob"];
    const expenses = [
      {
        paidByUserId: "alice",
        splits: [
          { userId: "alice", amount: 0, paid: true },
          { userId: "bob", amount: 50, paid: false },
        ],
      },
    ];
    const settlements = [];

    const { totals } = calculateBalances(members, expenses, settlements);

    expect(totals.alice).toBe(50);
    expect(totals.bob).toBe(-50);
  });

  it("cancels out mutual debts between two people (pairwise netting)", () => {
    const members = ["alice", "bob"];
    const expenses = [
      {
        paidByUserId: "alice",
        splits: [{ userId: "bob", amount: 30, paid: false }],
      },
      {
        paidByUserId: "bob",
        splits: [{ userId: "alice", amount: 20, paid: false }],
      },
    ];
    const settlements = [];

    const { ledger } = calculateBalances(members, expenses, settlements);

    expect(ledger.bob.alice).toBe(10);
    expect(ledger.alice.bob).toBe(0);
  });

  it("reduces debt after a settlement is applied", () => {
    const members = ["alice", "bob"];
    const expenses = [
      {
        paidByUserId: "alice",
        splits: [{ userId: "bob", amount: 100, paid: false }],
      },
    ];
    const settlements = [
      { paidByUserId: "bob", receivedByUserId: "alice", amount: 40 },
    ];

    const { totals } = calculateBalances(members, expenses, settlements);

    expect(totals.alice).toBe(60);
    expect(totals.bob).toBe(-60);
  });
});