import { generateUniquePublicId } from "@/lib/platform/public-id";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function ensureInvitationPublicId(
  supabase: SupabaseClient,
  invitationId: string,
  userId: string,
  currentPublicId: string | null,
): Promise<string> {
  if (currentPublicId && currentPublicId !== "") return currentPublicId;

  const publicId = await generateUniquePublicId(async (candidate) => {
    const { data } = await supabase
      .from("invitations")
      .select("id")
      .eq("public_id", candidate)
      .limit(1)
      .maybeSingle();

    return Boolean(data);
  });

  const { data: updated, error } = await supabase
    .from("invitations")
    .update({ public_id: publicId })
    .eq("id", invitationId)
    .eq("user_id", userId)
    .select("public_id")
    .single();

  if (error || !updated?.public_id) {
    throw new Error("publicId 갱신 실패");
  }

  return updated.public_id;
}
