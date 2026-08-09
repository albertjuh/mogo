import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook, SnippeWebhookVerificationError, type WebhookPaymentData } from "@snippe/sdk";
import { getAdminDb } from "@/lib/firebase-admin";
import { mapGatewayStatus } from "@/lib/snippe";

// Needs the Node.js runtime (crypto, firebase-admin) — not the Edge runtime.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const signingKey = process.env.SNIPPE_WEBHOOK_SECRET;
  if (!signingKey) {
    console.error("SNIPPE_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // Signature is computed over the raw body — must not parse/reserialize first.
  const rawBody = await req.text();

  let event;
  try {
    event = verifyWebhook({
      rawBody,
      signature: req.headers.get("x-webhook-signature"),
      timestamp: req.headers.get("x-webhook-timestamp"),
      signingKey,
    });
  } catch (e) {
    if (e instanceof SnippeWebhookVerificationError) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    throw e;
  }

  if (event.type.startsWith("payment.")) {
    const data = event.data as WebhookPaymentData;
    const db = getAdminDb();
    await db.collection("payments").doc(data.reference).set(
      {
        status: mapGatewayStatus(data.status),
        verifiedBy: "snippe-webhook",
      },
      { merge: true }
    );
  }

  return NextResponse.json({ received: true });
}
