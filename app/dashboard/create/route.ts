import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureInvitationPublicId } from "@/lib/platform/invitations";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const { data: created, error } = await supabase
    .from("invitations")
    .insert({
      user_id: user.id,
      title: "",
      status: "draft",
    })
    .select("id, public_id")
    .single();

  if (error || !created) {
    return NextResponse.redirect(new URL("/setup/status", request.url));
  }

  try {
    await ensureInvitationPublicId(supabase, created.id, user.id, created.public_id);
  } catch {
    return NextResponse.redirect(new URL("/setup/status", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
