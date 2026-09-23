"use server";

import { getServerUser } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
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
 * Runs server-side only: reads the caller from the Supabase session cookie
 * and calls AzamPay's MNO checkout, which pushes a PIN prompt to the payer's
 * phone. The resulting payment row is written with the service-role client,
 * so it's never trusted from the client.
 */
export async function initiatePayment(
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

  const user = await getServerUser();
  if (!user) {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  const admin = getSupabaseAdmin();
  const { data: rider } = await admin.from("riders").select("id, phone").eq("profile_id", user.id).maybeSingle();
  if (!rider) {
    return { success: false, error: "Rider profile not found." };
  }

  const msisdn = normaliseTzPhone(phone || rider.phone || "");
  if (!msisdn) {
    return { success: false, error: "Enter a valid Tanzanian mobile number, e.g. 0754 123 456." };
  }

  const reference = newReference("KBP");

  try {
    const checkout = await mnoCheckout({ accountNumber: msisdn, amount, externalId: reference, provider });

    await admin.from("payments").insert({
      id: reference,
      rider_id: rider.id,
      amount,
      transaction_id: checkout.transactionId ?? null,
      provider,
      msisdn,
      status: "pending",
      recorded_at: new Date().toISOString(),
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
export async function checkPaymentStatus(gatewayRef: string): Promise<CheckPaymentStatusResult> {
  const user = await getServerUser();
  if (!user) {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  const admin = getSupabaseAdmin();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const isManager = profile?.role === "admin" || profile?.role === "supervisor" || profile?.role === "recruiter";
  if (!isManager) {
    return { success: false, error: "Unauthorized." };
  }

  const { data: payment } = await admin.from("payments").select("*").eq("id", gatewayRef).maybeSingle();
  if (!payment) {
    return { success: false, error: "Payment not found." };
  }
  if (payment.status !== "pending") {
    return { success: true, status: payment.status };
  }
  if (!payment.transaction_id || !payment.provider) {
    return { success: false, error: "This payment has no AzamPay transaction to check." };
  }

  try {
    const result = await getTransactionStatus(payment.transaction_id, payment.provider);
    const status = mapGatewayStatus(result.data);

    if (status !== "pending") {
      await admin.from("payments").update({ status, verified_by: null }).eq("id", gatewayRef);
    }

    return { success: true, status };
  } catch (e) {
    const message = e instanceof AzamPayError ? e.message : "Could not check payment status.";
    return { success: false, error: message };
  }
}
