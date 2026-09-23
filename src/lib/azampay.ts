import "server-only";
import type { Payment } from "@/lib/types";

/**
 * Minimal AzamPay REST client. Endpoints follow AzamPay's public API
 * (https://developerdocs.azampay.co.tz): an access token is minted from the
 * app's client credentials, then every checkout call carries it as a Bearer
 * token alongside the dashboard API key in `X-API-Key`.
 */

const IS_LIVE = process.env.AZAMPAY_ENV === "live";
const AUTH_BASE = IS_LIVE ? "https://authenticator.azampay.co.tz" : "https://authenticator-sandbox.azampay.co.tz";
const CHECKOUT_BASE = IS_LIVE ? "https://checkout.azampay.co.tz" : "https://sandbox.azampay.co.tz";

export class AzamPayError extends Error {}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new AzamPayError(`${name} is not set.`);
  return value;
}

let cachedToken: { value: string; expiresAt: number } | undefined;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const res = await fetch(`${AUTH_BASE}/AppRegistration/GenerateToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appName: requireEnv("AZAMPAY_APP_NAME"),
      clientId: requireEnv("AZAMPAY_CLIENT_ID"),
      clientSecret: requireEnv("AZAMPAY_CLIENT_SECRET"),
    }),
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  const token: string | undefined = body?.data?.accessToken;
  if (!res.ok || !token) {
    throw new AzamPayError(body?.message || "Could not authenticate with AzamPay.");
  }

  // Refresh a minute before AzamPay's stated expiry; fall back to 30 min.
  const expire = Date.parse(body.data.expire);
  const expiresAt = Number.isFinite(expire) ? expire - 60_000 : Date.now() + 30 * 60_000;
  cachedToken = { value: token, expiresAt };
  return token;
}

async function call<T>(path: string, init: { method: "GET" | "POST"; body?: unknown }): Promise<T> {
  const res = await fetch(`${CHECKOUT_BASE}${path}`, {
    method: init.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getAccessToken()}`,
      "X-API-Key": requireEnv("AZAMPAY_API_KEY"),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 401) cachedToken = undefined;
  if (!res.ok || body?.success === false) {
    throw new AzamPayError(body?.message || body?.msg || `AzamPay request failed (${res.status}).`);
  }
  return body as T;
}

/** Generates our own reference, sent as externalId and echoed back as `utilityref` in callbacks. */
export function newReference(prefix: "KBP" | "KBW"): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}${Date.now().toString(36).toUpperCase()}${rand}`;
}

/** Sends a USSD push to the payer's phone asking them to approve with their PIN. */
export function mnoCheckout(params: { accountNumber: string; amount: number; externalId: string; provider: string }) {
  return call<{ transactionId: string; message?: string; msg?: string }>("/azampay/mno/checkout", {
    method: "POST",
    body: {
      accountNumber: params.accountNumber,
      amount: String(params.amount),
      currency: "TZS",
      externalId: params.externalId,
      provider: params.provider,
    },
  });
}

/** Looks up the registered name on a mobile money account before paying out to it. */
export function nameLookup(params: { bankName: string; accountNumber: string }) {
  return call<{ name: string; accountNumber: string; bankName: string; message?: string }>("/azampay/namelookup", {
    method: "POST",
    body: params,
  });
}

/** Moves money out of the AzamPay merchant account to a mobile money wallet. */
export function disburse(params: {
  amount: number;
  destinationName: string;
  destinationBank: string;
  destinationAccount: string;
  externalReferenceId: string;
  remarks: string;
}) {
  return call<{ data: string; message?: string }>("/azampay/createtransfer", {
    method: "POST",
    body: {
      source: {
        countryCode: "TZ",
        fullName: process.env.AZAMPAY_SOURCE_NAME || "King Bariki",
        bankName: process.env.AZAMPAY_SOURCE_BANK || "Azampesa",
        accountNumber: requireEnv("AZAMPAY_SOURCE_ACCOUNT"),
        currency: "TZS",
      },
      destination: {
        countryCode: "TZ",
        fullName: params.destinationName,
        bankName: params.destinationBank,
        accountNumber: params.destinationAccount,
        currency: "TZS",
      },
      transferDetails: { type: "Disbursement", amount: params.amount, date: new Date().toISOString() },
      externalReferenceId: params.externalReferenceId,
      remarks: params.remarks,
    },
  });
}

/** Asks AzamPay for the latest status of a transaction it issued. */
export function getTransactionStatus(reference: string, bankName: string) {
  const qs = new URLSearchParams({ pgReferenceId: reference, bankName });
  return call<{ data: string; message?: string }>(`/azampay/gettransactionstatus?${qs}`, { method: "GET" });
}

/** Maps AzamPay's free-text transaction status onto our internal Payment.status. */
export function mapGatewayStatus(status: string | undefined | null): Payment["status"] {
  const s = String(status ?? "").toLowerCase();
  if (/success|complete|paid/.test(s)) return "verified";
  if (/fail|reject|cancel|expire|declin|insufficient/.test(s)) return "failed";
  return "pending";
}
