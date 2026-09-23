import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST() {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "You must be signed in to delete your account." }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
