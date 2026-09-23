import { differenceInCalendarDays, parseISO, startOfDay } from "date-fns";
import type { Payment, Rider } from "./types";

/** Days in one billing period for a given payment frequency. */
export function periodDays(frequency: Rider["paymentFrequency"]): number {
  switch (frequency) {
    case "Weekly":
      return 7;
    case "10-Day":
      return 10;
    default:
      return 1;
  }
}

export interface RiderBalance {
  /** How much the rider should have paid by today, given their contract terms. */
  expected: number;
  /** How much the rider has actually paid (verified payments only). */
  paid: number;
  /** paid - expected. Negative = debt/arrears, positive = credit/overdraft buffer. */
  balance: number;
  /** Whole billing periods currently owed and unpaid. */
  periodsOwed: number;
  status: "current" | "debt" | "credit";
}

/**
 * Computes a rider's running balance against their contract, purely from
 * existing Rider + Payment records (no extra Firestore fields needed).
 * A negative balance means the rider owes King Bariki money (debt/arrears);
 * a positive balance means they've paid ahead (credit/overdraft buffer).
 */
export function computeRiderBalance(
  rider: Pick<Rider, "dailyFee" | "paymentFrequency" | "contractStart" | "active">,
  payments: Pick<Payment, "amount" | "status">[]
): RiderBalance {
  const amountPerPeriod = rider.dailyFee || 0;
  const days = periodDays(rider.paymentFrequency);

  let expected = 0;
  if (rider.contractStart && rider.active) {
    const start = startOfDay(parseISO(rider.contractStart));
    const today = startOfDay(new Date());
    const elapsedDays = Math.max(0, differenceInCalendarDays(today, start));
    const periodsElapsed = Math.floor(elapsedDays / days) + (elapsedDays >= 0 ? 1 : 0);
    expected = periodsElapsed * amountPerPeriod;
  }

  const paid = payments
    .filter((p) => p.status === "verified")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const balance = paid - expected;
  const periodsOwed = amountPerPeriod > 0 ? Math.max(0, Math.ceil(-balance / amountPerPeriod)) : 0;

  return {
    expected,
    paid,
    balance,
    periodsOwed,
    status: balance < 0 ? "debt" : balance > 0 ? "credit" : "current",
  };
}
