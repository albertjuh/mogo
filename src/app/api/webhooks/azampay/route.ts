import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { mapGatewayStatus } from "@/lib/azampay";

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

  const admin = getSupabaseAdmin();
  const status = mapGatewayStatus(event.transactionstatus);

  const { data: payment } = await admin.from("payments").select("status, amount").eq("id", ref).maybeSingle();
  if (payment) {
    // Only settle pending payments, and only for the amount we asked for.
    if (payment.status === "pending" && status !== "pending") {
      if (Number(event.amount) !== Number(payment.amount)) {
        console.error(`AzamPay callback amount mismatch for ${ref}: got ${event.amount}, expected ${payment.amount}`);
        return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
      }
      await admin
        .from("payments")
        .update({
          status,
          operator_reference: event.reference ?? null,
          fsp_reference_id: event.fspReferenceId ?? null,
          gateway_message: event.message ?? null,
        })
        .eq("id", ref);
    }
    return NextResponse.json({ received: true });
  }

  const { data: payout } = await admin.from("payouts").select("id").eq("id", ref).maybeSingle();
  if (payout) {
    await admin
      .from("payouts")
      .update({
        status: status === "verified" ? "completed" : status,
        gateway_message: event.message ?? null,
      })
      .eq("id", ref);
  }

  return NextResponse.json({ received: true });
}
