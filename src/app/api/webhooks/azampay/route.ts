import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getAdminDb } from "@/lib/firebase-admin";
import { mapGatewayStatus } from "@/lib/azampay";

// Needs the Node.js runtime (crypto, firebase-admin) — not the Edge runtime.
export const runtime = "nodejs";

/** Shape of AzamPay's checkout callback. `utilityref` echoes our externalId. */
interface AzamPayCallback {
  msisdn?: string;
  amount?: string | number;
  message?: string;
  utilityref?: string;
  operator?: string;
  reference?: string;
  transactionstatus?: string;
  fspReferenceId?: string;
}

function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  // AzamPay callbacks aren't signed, so the callback URL registered in the
  // AzamPay dashboard carries a shared secret: .../api/webhooks/azampay?secret=...
  const secret = process.env.AZAMPAY_CALLBACK_SECRET;
  if (!secret) {
    console.error("AZAMPAY_CALLBACK_SECRET is not set.");
    return NextResponse.json({ error: "Callback not configured" }, { status: 500 });
  }
  if (!secretMatches(req.nextUrl.searchParams.get("secret"), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = (await req.json().catch(() => null)) as AzamPayCallback | null;
  const ref = event?.utilityref;
  if (!event || !ref) {
    return NextResponse.json({ error: "Missing utilityref" }, { status: 400 });
  }

  const db = getAdminDb();
  const status = mapGatewayStatus(event.transactionstatus);

  const paymentRef = db.collection("payments").doc(ref);
  const paymentSnap = await paymentRef.get();
  if (paymentSnap.exists) {
    const payment = paymentSnap.data()!;
    // Only settle pending payments, and only for the amount we asked for.
    if (payment.status === "pending" && status !== "pending") {
      if (Number(event.amount) !== Number(payment.amount)) {
        console.error(`AzamPay callback amount mismatch for ${ref}: got ${event.amount}, expected ${payment.amount}`);
        return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
      }
      await paymentRef.set(
        {
          status,
          verifiedBy: "azampay-callback",
          operatorReference: event.reference ?? null,
          fspReferenceId: event.fspReferenceId ?? null,
          gatewayMessage: event.message ?? null,
        },
        { merge: true }
      );
    }
    return NextResponse.json({ received: true });
  }

  const payoutRef = db.collection("payouts").doc(ref);
  if ((await payoutRef.get()).exists) {
    await payoutRef.set(
      {
        status: status === "verified" ? "completed" : status,
        gatewayMessage: event.message ?? null,
      },
      { merge: true }
    );
  }

  return NextResponse.json({ received: true });
}
