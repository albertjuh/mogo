"use server";

import { normalisePhone, SnippeError } from "@snippe/sdk";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { getSnippeClient, mapGatewayStatus } from "@/lib/snippe";

const MIN_AMOUNT_TZS = 500;

export interface InitiatePaymentResult {
  success: boolean;
  gatewayRef?: string;
  error?: string;
}

/**
 * Called by a signed-in rider to start a real mobile-money collection.
 * Runs server-side only: verifies the caller's Firebase ID token, looks up
 * their phone number, and calls Snippe. The resulting Firestore payment doc
 * is written with the Admin SDK, so it's never trusted from the client.
 */
export async function initiatePayment(idToken: string, amount: number): Promise<InitiatePaymentResult> {
  if (!Number.isFinite(amount) || amount < MIN_AMOUNT_TZS) {
    return { success: false, error: `Minimum payment amount is TZS ${MIN_AMOUNT_TZS}.` };
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
  if (!rider.phone) {
    return { success: false, error: "No phone number on file for this account." };
  }

  const [firstName, ...rest] = String(rider.name || "Boda Rider").trim().split(/\s+/);

  try {
    const payment = await getSnippeClient().payments.mobile.create({
      amount,
      phoneNumber: normalisePhone(rider.phone),
      customer: {
        firstName: firstName || "Boda",
        lastName: rest.join(" ") || "Rider",
        email: rider.email || `${uid}@bodaempire.app`,
      },
      webhookUrl: process.env.SNIPPE_WEBHOOK_URL,
      metadata: { riderId: uid },
    });

    await db.collection("payments").doc(payment.reference).set({
      riderId: uid,
      amount,
      gatewayRef: payment.reference,
      status: mapGatewayStatus(payment.status),
      recordedAt: new Date().toISOString(),
    });

    return { success: true, gatewayRef: payment.reference };
  } catch (e) {
    const message = e instanceof SnippeError ? e.message : "Could not start the payment. Please try again.";
    return { success: false, error: message };
  }
}

export interface CheckPaymentStatusResult {
  success: boolean;
  status?: string;
  error?: string;
}

/**
 * Called by a manager to re-poll Snippe for a pending payment's status,
 * for cases where the webhook hasn't landed yet.
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

  try {
    const payment = await getSnippeClient().payments.get(gatewayRef);
    const status = mapGatewayStatus(payment.status);

    await db.collection("payments").doc(gatewayRef).set({ status }, { merge: true });

    return { success: true, status };
  } catch (e) {
    const message = e instanceof SnippeError ? e.message : "Could not check payment status.";
    return { success: false, error: message };
  }
}
