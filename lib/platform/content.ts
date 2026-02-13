import { createClient } from "@/lib/supabase/server";
import { createBlankWeddingContent } from "@/lib/content/blank";
import { normalizeWeddingContent } from "@/lib/content/validate";
import type { WeddingContent } from "@/lib/content/types";

type ContentRow = {
  content_json: unknown;
  version: number;
};

async function getLatestContent(
  invitationId: string,
  publishedOnly: boolean,
): Promise<WeddingContent | null> {
  const supabase = await createClient();
  const blankBase = createBlankWeddingContent();

  let query = supabase
    .from("invitation_contents")
    .select("content_json,version")
    .eq("invitation_id", invitationId)
    .order("version", { ascending: false })
    .limit(1);

  if (publishedOnly) {
    query = query.eq("is_published_snapshot", true);
  } else {
    query = query.eq("is_published_snapshot", false);
  }

  const { data } = (await query.maybeSingle()) as { data: ContentRow | null };

  if (!data) return null;

  return normalizeWeddingContent(data.content_json, blankBase);
}

export async function getPublicInvitationContent(publicId: string) {
  const supabase = await createClient();

  const { data: invitation } = await supabase
    .from("invitations")
    .select("id,status,public_id")
    .eq("public_id", publicId)
    .eq("status", "published")
    .maybeSingle();

  if (!invitation) return null;

  return getLatestContent(invitation.id, true);
}

export async function getPreviewInvitationContent(previewToken: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { content: null as WeddingContent | null, reason: "unauthorized" };

  const { data: token } = await supabase
    .from("preview_tokens")
    .select("invitation_id,user_id,expires_at")
    .eq("token", previewToken)
    .maybeSingle();

  if (!token) return { content: null as WeddingContent | null, reason: "not_found" };
  if (token.user_id !== user.id) {
    return { content: null as WeddingContent | null, reason: "forbidden" };
  }

  const expired = new Date(token.expires_at).getTime() < Date.now();
  if (expired) return { content: null as WeddingContent | null, reason: "expired" };

  const content = await getLatestContent(token.invitation_id, false);
  return { content, reason: null as string | null };
}
