"use server";

import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { AzamPayError, disburse, nameLookup, newReference } from "@/lib/azampay";
import { isMobileProvider, normaliseTzPhone } from "@/lib/payment-providers";

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

export interface RecipientLookupResult {
  success: boolean;
  name?: string;
  error?: string;
}

/**
 * Confirms who owns a mobile money number before sending money to it, so an
 * admin can catch a mistyped number before the funds leave.
 */
export async function lookupRecipient(idToken: string, phoneNumber: string, provider: string): Promise<RecipientLookupResult> {
  const auth = await requireAdmin(idToken);
  if ("error" in auth) return { success: false, error: auth.error };

  const msisdn = normaliseTzPhone(phoneNumber);
  if (!msisdn) return { success: false, error: "Enter a valid Tanzanian mobile number." };
  if (!isMobileProvider(provider)) return { success: false, error: "Choose the recipient's network." };

  try {
    const result = await nameLookup({ bankName: provider, accountNumber: msisdn });
    if (!result.name) return { success: false, error: "No registered name found for this number." };
    return { success: true, name: result.name };
  } catch (e) {
    const message = e instanceof AzamPayError ? e.message : "Could not look up this number.";
    return { success: false, error: message };
  }
}

export interface InitiatePayoutResult {
  success: boolean;
  reference?: string;
  error?: string;
}

/**
 * Withdraws a specific amount from the business's AzamPay balance out to a
 * mobile money number. Admin-only: moving money out is higher-risk than
 * collecting it, so this is deliberately narrower than the manager role
 * used for payment collection.
 */
export async function initiatePayout(
  idToken: string,
  amount: number,
  phoneNumber: string,
  provider: string,
  recipientName: string,
  narration?: string
): Promise<InitiatePayoutResult> {
  const auth = await requireAdmin(idToken);
  if ("error" in auth) return { success: false, error: auth.error };

  if (!Number.isFinite(amount) || amount < MIN_PAYOUT_TZS) {
    return { success: false, error: `Minimum payout amount is TZS ${MIN_PAYOUT_TZS}.` };
  }
  const msisdn = normaliseTzPhone(phoneNumber);
  if (!msisdn) {
    return { success: false, error: "Enter a valid Tanzanian mobile number." };
  }
  if (!isMobileProvider(provider)) {
    return { success: false, error: "Choose the recipient's network." };
  }
  if (!recipientName.trim()) {
    return { success: false, error: "A recipient name is required." };
  }

  const db = getAdminDb();
  const reference = newReference("KBW");

  try {
    const result = await disburse({
      amount,
      destinationName: recipientName.trim(),
      destinationBank: provider,
      destinationAccount: msisdn,
      externalReferenceId: reference,
      remarks: narration?.trim() || "King Bariki withdrawal",
    });

    await db.collection("payouts").doc(reference).set({
      reference,
      amount,
      phoneNumber: msisdn,
      provider,
      recipientName: recipientName.trim(),
      narration: narration || null,
      status: "submitted",
      gatewayMessage: result.message ?? result.data ?? null,
      initiatedBy: auth.uid,
      recordedAt: new Date().toISOString(),
    });

    return { success: true, reference };
  } catch (e) {
    console.error("AzamPay disbursement failed", e);
    const message = e instanceof AzamPayError ? e.message : "Could not send the payout. Please try again.";
    return { success: false, error: message };
  }
}
