"use server";

import { normalisePhone, SnippeError } from "@snippe/sdk";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { getSnippeClient } from "@/lib/snippe";

const MIN_PAYOUT_TZS = 5000;

async function requireAdmin(idToken: string): Promise<{ uid: string } | { error: string }> {
  let uid: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return { error: "Your session has expired. Please sign in again." };
  }

  const adminDoc = await getAdminDb().collection("admins").doc(uid).get();
  if (!adminDoc.exists) {
    return { error: "Unauthorized. Only admins can move funds out of the account." };
  }

  return { uid };
}

export interface PayoutFeeResult {
  success: boolean;
  feeAmount?: number;
  totalAmount?: number;
  error?: string;
}

export async function getPayoutFee(idToken: string, amount: number): Promise<PayoutFeeResult> {
  const auth = await requireAdmin(idToken);
  if ("error" in auth) return { success: false, error: auth.error };

  try {
    const fee = await getSnippeClient().payouts.mobile.fee({ amount });
    return { success: true, feeAmount: fee.feeAmount, totalAmount: fee.totalAmount };
  } catch (e) {
    const message = e instanceof SnippeError ? e.message : "Could not calculate the payout fee.";
    return { success: false, error: message };
  }
}

export interface InitiatePayoutResult {
  success: boolean;
  reference?: string;
  error?: string;
}

/**
 * Withdraws a specific amount from the business's Snippe balance out to a
 * mobile money number. Admin-only: moving money out is higher-risk than
 * collecting it, so this is deliberately narrower than the manager role
 * used for payment collection.
 */
export async function initiatePayout(
  idToken: string,
  amount: number,
  phoneNumber: string,
  recipientName: string,
  narration?: string
): Promise<InitiatePayoutResult> {
  const auth = await requireAdmin(idToken);
  if ("error" in auth) return { success: false, error: auth.error };

  if (!Number.isFinite(amount) || amount < MIN_PAYOUT_TZS) {
    return { success: false, error: `Minimum payout amount is TZS ${MIN_PAYOUT_TZS}.` };
  }
  if (!phoneNumber.trim()) {
    return { success: false, error: "A recipient phone number is required." };
  }
  if (!recipientName.trim()) {
    return { success: false, error: "A recipient name is required." };
  }

  const db = getAdminDb();

  try {
    const payout = await getSnippeClient().payouts.mobile.send({
      amount,
      phoneNumber: normalisePhone(phoneNumber),
      recipientName: recipientName.trim(),
      narration,
      webhookUrl: process.env.SNIPPE_WEBHOOK_URL,
      metadata: { initiatedBy: auth.uid },
    });

    await db.collection("payouts").doc(payout.reference).set({
      reference: payout.reference,
      amount,
      phoneNumber: normalisePhone(phoneNumber),
      recipientName: recipientName.trim(),
      narration: narration || null,
      status: payout.status,
      initiatedBy: auth.uid,
      recordedAt: new Date().toISOString(),
    });

    return { success: true, reference: payout.reference };
  } catch (e) {
    const message = e instanceof SnippeError ? e.message : "Could not send the payout. Please try again.";
    return { success: false, error: message };
  }
}
