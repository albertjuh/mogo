import "server-only";
import { Snippe, type PaymentStatus } from "@snippe/sdk";
import type { Payment } from "@/lib/types";

let client: Snippe | undefined;

export function getSnippeClient(): Snippe {
  if (client) return client;

  const apiKey = process.env.SNIPPE_API_KEY;
  if (!apiKey) {
    throw new Error("SNIPPE_API_KEY is not set.");
  }

  client = new Snippe({ apiKey });
  return client;
}

/** Maps a Snippe gateway payment status onto our internal Payment.status. */
export function mapGatewayStatus(status: PaymentStatus | string): Payment["status"] {
  if (status === "completed") return "verified";
  if (status === "pending") return "pending";
  // voided, expired, or anything else we don't recognize
  return "failed";
}
