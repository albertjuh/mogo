"use server";

import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { AzamPayError, getTransactionStatus, mapGatewayStatus, mnoCheckout, newReference } from "@/lib/azampay";
import { isMobileProvider, normaliseTzPhone } from "@/lib/payment-providers";

const MIN_AMOUNT_TZS = 500;

export interface InitiatePaymentResult {
  success: boolean;
  gatewayRef?: string;
  error?: string;
}

/**
 * Called by a signed-in rider to start a real mobile-money collection.
 * Runs server-side only: verifies the caller's Firebase ID token and calls
 * AzamPay's MNO checkout, which pushes a PIN prompt to the payer's phone.
 * The resulting Firestore payment doc is written with the Admin SDK, so
 * it's never trusted from the client.
 */
export async function initiatePayment(
  idToken: string,
  amount: number,
  provider: string,
  phone?: string
): Promise<InitiatePaymentResult> {
  if (!Number.isFinite(amount) || amount < MIN_AMOUNT_TZS) {
    return { success: false, error: `Minimum payment amount is TZS ${MIN_AMOUNT_TZS}.` };
  }
  if (!isMobileProvider(provider)) {
    return { success: false, error: "Please choose a mobile money network." };
  }

  let uid: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  const db = getAdminDb();
  const riderSnap = await db.collection("riders").doc(uid).get();
  if (!riderSnap.exists) {
    return { success: false, error: "Rider profile not found." };
  }
  const rider = riderSnap.data()!;

  const msisdn = normaliseTzPhone(phone || rider.phone || "");
  if (!msisdn) {
    return { success: false, error: "Enter a valid Tanzanian mobile number, e.g. 0754 123 456." };
  }

  const reference = newReference("KBP");

  try {
    const checkout = await mnoCheckout({ accountNumber: msisdn, amount, externalId: reference, provider });

    await db.collection("payments").doc(reference).set({
      riderId: uid,
      amount,
      gatewayRef: reference,
      transactionId: checkout.transactionId ?? null,
      provider,
      msisdn,
      status: "pending",
      recordedAt: new Date().toISOString(),
    });

    return { success: true, gatewayRef: reference };
  } catch (e) {
    console.error("AzamPay checkout failed", e);
    const message = e instanceof AzamPayError ? e.message : "Could not start the payment. Please try again.";
    return { success: false, error: message };
  }
}

export interface CheckPaymentStatusResult {
  success: boolean;
  status?: string;
  error?: string;
}

/**
 * Called by a manager to re-poll AzamPay for a pending payment's status,
 * for cases where the callback hasn't landed yet.
 */
export async function checkPaymentStatus(idToken: string, gatewayRef: string): Promise<CheckPaymentStatusResult> {
  let uid: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  const db = getAdminDb();
  const [adminDoc, supervisorDoc, recruiterDoc] = await Promise.all([
    db.collection("admins").doc(uid).get(),
    db.collection("supervisors").doc(uid).get(),
    db.collection("recruiters").doc(uid).get(),
  ]);
  const isManager = adminDoc.exists || supervisorDoc.exists || recruiterDoc.exists;
  if (!isManager) {
    return { success: false, error: "Unauthorized." };
  }

  const paymentRef = db.collection("payments").doc(gatewayRef);
  const paymentSnap = await paymentRef.get();
  const payment = paymentSnap.data();
  if (!payment) {
    return { success: false, error: "Payment not found." };
  }
  if (payment.status !== "pending") {
    return { success: true, status: payment.status };
  }
  if (!payment.transactionId || !payment.provider) {
    return { success: false, error: "This payment has no AzamPay transaction to check." };
  }

  try {
    const result = await getTransactionStatus(payment.transactionId, payment.provider);
    const status = mapGatewayStatus(result.data);

    if (status !== "pending") {
      await paymentRef.set({ status, verifiedBy: "azampay-status-check" }, { merge: true });
    }

    return { success: true, status };
  } catch (e) {
    const message = e instanceof AzamPayError ? e.message : "Could not check payment status.";
    return { success: false, error: message };
  }
}
