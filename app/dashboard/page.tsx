import Link from "next/link";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureInvitationPublicId } from "@/lib/platform/invitations";
import { DashboardHeader } from "@/components/pages/DashboardHeader";
import { InvitationCardActions } from "@/components/pages/InvitationCardActions";
import { mc } from "@/lib/mariecardStyles";

type InvitationRow = {
  id: string;
  user_id: string;
  title: string;
  public_id: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type ContentRow = {
  invitation_id: string;
  version: number;
  content_json: Record<string, unknown>;
};

type InvitationCard = InvitationRow & {
  public_id: string;
  previewImage: string;
  fallbackTitle: string;
};

const OG_FALLBACK = "/img/1200x630.png";

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function extractPreviewImage(content: Record<string, unknown>): string {
  const heroMedia = asRecord(content.heroMedia);
  const introSection = asRecord(content.introSection);
  const introImage = asRecord(introSection.image);
  const heroSection = asRecord(content.heroSection);
  const heroImages = Array.isArray(heroSection.images) ? heroSection.images : [];
  const firstHero = heroImages[0] && typeof heroImages[0] === "object"
    ? (heroImages[0] as Record<string, unknown>)
    : {};

  return (
    asString(heroMedia.poster) ||
    asString(introImage.src) ||
    asString(firstHero.src) ||
    OG_FALLBACK
  );
}

function extractFallbackTitle(content: Record<string, unknown>): string {
  const couple = asRecord(content.couple);
  const displayName = asString(couple.displayName);
  if (displayName) return displayName;

  const groomName = asString(couple.groomName);
  const brideName = asString(couple.brideName);
  if (groomName || brideName) {
    return `${groomName} ${brideName}`.trim();
  }

  return "내 초대장";
}

async function ensureUserProfile(user: {
  id: string;
  email?: string | null;
  user_metadata?: { name?: string };
}) {
  const supabase = await createClient();
  await supabase.from("users").upsert({
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.name || "",
    provider: "google",
  });
}

async function loadInvitations(userId: string): Promise<InvitationCard[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invitations")
    .select("id,user_id,title,public_id,status,published_at,created_at,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  const invitations = (data || []) as InvitationRow[];
  if (invitations.length === 0) return [];

  const normalized: InvitationRow[] = [];
  for (const invitation of invitations) {
    const publicId = await ensureInvitationPublicId(
      supabase,
      invitation.id,
      userId,
      invitation.public_id,
    );

    normalized.push({ ...invitation, public_id: publicId });
  }

  const invitationIds = normalized.map((item) => item.id);
  const { data: contentRows } = await supabase
    .from("invitation_contents")
    .select("invitation_id,version,content_json")
    .in("invitation_id", invitationIds)
    .eq("is_published_snapshot", false)
    .order("version", { ascending: false });

  const latestByInvitation = new Map<string, ContentRow>();
  (contentRows as ContentRow[] | null || []).forEach((row) => {
    if (!latestByInvitation.has(row.invitation_id)) {
      latestByInvitation.set(row.invitation_id, row);
    }
  });

  return normalized.map((invitation) => {
    const content = asRecord(latestByInvitation.get(invitation.id)?.content_json);
    return {
      ...invitation,
      public_id: invitation.public_id || "",
      previewImage: extractPreviewImage(content),
      fallbackTitle: extractFallbackTitle(content),
    };
  });
}

function InvitationCardView({
  invitation,
  section,
}: {
  invitation: InvitationCard;
  section: "active" | "inProgress" | "expired";
}) {
  const title = invitation.title?.trim() || invitation.fallbackTitle;
  const link = `https://mariecard.com/invitation/${invitation.public_id}`;
  const isExpired = section === "expired";

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={invitation.previewImage}
            alt={`${title} preview`}
            className="h-24 w-40 rounded-lg border border-gray-200 object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-gray-900">{title}</p>
            <p className="mt-1 break-all text-sm text-gray-600">{link}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/invitation/${invitation.id}/admin`}
            target="_blank"
            rel="noreferrer"
            className={mc.primaryButton}
          >
            초대장 관리
          </Link>
          {section !== "expired" && (
            <InvitationCardActions invitationId={invitation.id} type={section === "active" ? "active" : "inProgress"} />
          )}
          {!isExpired && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className={mc.secondaryButton}
            >
              공개 링크
            </a>
          )}
          {isExpired && (
            <span className="inline-flex items-center rounded-lg border border-[#e8d9cb] px-4 py-2 text-sm text-gray-600">
              만료됨 (관리 가능)
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function DashboardPage() {
  // Ensure mutations (expire/delete) are reflected immediately after router.refresh().
  // Supabase client uses fetch under the hood; without noStore(), results can be cached.
  noStore();

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/setup/status");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  await ensureUserProfile({
    id: user.id,
    email: user.email,
    user_metadata: { name: user.user_metadata?.name },
  });

  let invitations: InvitationCard[] = [];
  try {
    invitations = await loadInvitations(user.id);
  } catch {
    redirect("/setup/status");
  }

  const activeInvitations = invitations.filter((item) => item.status === "published");
  const inProgressInvitations = invitations.filter((item) => item.status === "draft");
  const expiredInvitations = invitations.filter((item) => item.status === "archived");

  return (
    <main className="min-h-screen bg-gray-50">
      <DashboardHeader
        name={user.user_metadata?.name || ""}
        email={user.email || ""}
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">내 초대장</h1>
          <Link
            href="/dashboard/create"
            target="_blank"
            rel="noreferrer"
            className={mc.primaryButton}
          >
            초대장 만들기
          </Link>
        </div>

        {invitations.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-lg font-medium text-gray-700">제작한 초대장이 없어요! 초대장을 만들어보세요.</p>
            <Link
              href="/dashboard/create"
              target="_blank"
              rel="noreferrer"
              className={`mt-4 inline-flex ${mc.primaryButton}`}
            >
              초대장 만들기
            </Link>
          </section>
        ) : (
          <div className="space-y-8">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">활성화된 초대장</h2>
              {activeInvitations.length === 0 ? (
                <p className="rounded-xl border border-gray-200 bg-white px-4 py-5 text-sm text-gray-500">
                  활성화된 초대장이 없습니다.
                </p>
              ) : (
                <div className="space-y-3">
                  {activeInvitations.map((invitation) => (
                    <InvitationCardView
                      key={invitation.id}
                      invitation={invitation}
                      section="active"
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">제작중인 초대장</h2>
              {inProgressInvitations.length === 0 ? (
                <p className="rounded-xl border border-gray-200 bg-white px-4 py-5 text-sm text-gray-500">
                  제작중인 초대장이 없습니다.
                </p>
              ) : (
                <div className="space-y-3">
                  {inProgressInvitations.map((invitation) => (
                    <InvitationCardView
                      key={invitation.id}
                      invitation={invitation}
                      section="inProgress"
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">만료된 초대장</h2>
              {expiredInvitations.length === 0 ? (
                <p className="rounded-xl border border-gray-200 bg-white px-4 py-5 text-sm text-gray-500">
                  만료된 초대장이 없습니다.
                </p>
              ) : (
                <div className="space-y-3">
                  {expiredInvitations.map((invitation) => (
                    <InvitationCardView
                      key={invitation.id}
                      invitation={invitation}
                      section="expired"
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
