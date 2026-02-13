import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeWeddingContent } from "@/lib/content/validate";
import { createBlankWeddingContent } from "@/lib/content/blank";

export const runtime = "nodejs";

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function isLegacyEmptyContent(value: unknown): boolean {
  const record = asRecord(value);
  const couple = asRecord(record.couple);
  const wedding = asRecord(record.wedding);
  const heroSection = asRecord(record.heroSection);
  const gallerySection = asRecord(record.gallerySection);

  const groomName = typeof couple.groomName === "string" ? couple.groomName.trim() : "";
  const brideName = typeof couple.brideName === "string" ? couple.brideName.trim() : "";
  const dateLabel = typeof wedding.dateLabel === "string" ? wedding.dateLabel.trim() : "";
  const headerLabel = typeof wedding.headerLabel === "string" ? wedding.headerLabel.trim() : "";
  const heroImages = Array.isArray(heroSection.images) ? heroSection.images.length : 0;
  const galleryImages = Array.isArray(gallerySection.images) ? gallerySection.images.length : 0;

  return (
    groomName === "" &&
    brideName === "" &&
    dateLabel === "" &&
    headerLabel === "" &&
    heroImages <= 1 &&
    galleryImages <= 1
  );
}

async function ensureOwner(invitationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ message: "인증 필요" }, { status: 401 }) };
  }

  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("id, user_id")
    .eq("id", invitationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !invitation) {
    return { error: NextResponse.json({ message: "권한 없음" }, { status: 403 }) };
  }

  return { supabase, user };
}

export async function GET(
  _request: Request,
  context: { params: { id: string } },
) {
  const owner = await ensureOwner(context.params.id);
  if ("error" in owner) return owner.error;

  const { supabase } = owner;

  const { data: latest } = await supabase
    .from("invitation_contents")
    .select("content_json, version")
    .eq("invitation_id", context.params.id)
    .eq("is_published_snapshot", false)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const blankBase = createBlankWeddingContent();

  if (!latest) {
    const blank = createBlankWeddingContent();
    const { data: created, error: insertError } = await supabase
      .from("invitation_contents")
      .insert({
        invitation_id: context.params.id,
        content_json: blank,
        version: 1,
        is_published_snapshot: false,
      })
      .select("content_json")
      .single();

    if (insertError) {
      return NextResponse.json({ message: "초기 데이터 생성 실패" }, { status: 500 });
    }

    return NextResponse.json(normalizeWeddingContent(created.content_json, blankBase));
  }

  if (isLegacyEmptyContent(latest.content_json)) {
    const { data: seeded, error: seedError } = await supabase
      .from("invitation_contents")
      .insert({
        invitation_id: context.params.id,
        content_json: blankBase,
        version: (latest.version || 0) + 1,
        is_published_snapshot: false,
      })
      .select("content_json")
      .single();

    if (!seedError && seeded?.content_json) {
      return NextResponse.json(normalizeWeddingContent(seeded.content_json, blankBase));
    }
  }

  return NextResponse.json(normalizeWeddingContent(latest.content_json, blankBase));
}

export async function PUT(
  request: Request,
  context: { params: { id: string } },
) {
  const owner = await ensureOwner(context.params.id);
  if ("error" in owner) return owner.error;

  const { supabase } = owner;

  const body = await request.json();
  const normalized = normalizeWeddingContent(body, createBlankWeddingContent());

  const { data: latest } = await supabase
    .from("invitation_contents")
    .select("version")
    .eq("invitation_id", context.params.id)
    .eq("is_published_snapshot", false)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (latest?.version || 0) + 1;

  const { error } = await supabase.from("invitation_contents").insert({
    invitation_id: context.params.id,
    content_json: normalized,
    version: nextVersion,
    is_published_snapshot: false,
  });

  if (error) {
    return NextResponse.json({ message: "저장 실패" }, { status: 500 });
  }

  return NextResponse.json(normalized);
}
