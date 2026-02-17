import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationRenderer } from "@/components/pages/InvitationRenderer";
import { getPublicInvitationContent } from "@/lib/platform/content";
import type { WeddingContent } from "@/lib/content/types";

export const dynamic = "force-dynamic";

function resolveShareImage(content: WeddingContent): string {
  // Prefer user-provided OG image first.
  if (content.share.ogImageUrl) {
    return content.share.ogImageUrl;
  }

  // Fallback to hero media for OG/share
  if (content.heroMedia.type === "video") {
    return content.heroMedia.poster || content.heroMedia.mobileSrc || content.share.imageUrl;
  }
  return content.heroMedia.mobileSrc || content.share.imageUrl;
}

function toAbsoluteUrl(baseUrl: string, value: string): string {
  const trimmed = (value || "").trim();
  if (trimmed === "") return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return `${baseUrl}${trimmed}`;
  return `${baseUrl}/${trimmed}`;
}

export async function generateMetadata({
  params,
}: {
  params: { publicId: string };
}): Promise<Metadata> {
  const content = await getPublicInvitationContent(params.publicId);
  if (!content) {
    return { title: "Invitation Not Found" };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_INVITATION_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://mariecard.com";

  const shareImage = resolveShareImage(content);
  const ogImage = toAbsoluteUrl(baseUrl, shareImage);

  return {
    title: content.share.kakaoTitle || "MarieCard Invitation",
    description: content.share.kakaoDescription || "모바일 청첩장",
    openGraph: {
      title: content.share.kakaoTitle || "MarieCard Invitation",
      description: content.share.kakaoDescription || "모바일 청첩장",
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: content.share.kakaoTitle || "MarieCard Invitation",
      description: content.share.kakaoDescription || "모바일 청첩장",
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function PublicInvitationPage({
  params,
}: {
  params: { publicId: string };
}) {
  const content = await getPublicInvitationContent(params.publicId);
  if (!content) notFound();

  return (
    <InvitationRenderer
      content={content}
      routeBasePath={`/invitation/${params.publicId}`}
    />
  );
}
