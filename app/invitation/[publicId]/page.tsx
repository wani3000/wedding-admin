import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationRenderer } from "@/components/pages/InvitationRenderer";
import { getPublicInvitationContent } from "@/lib/platform/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { publicId: string };
}): Promise<Metadata> {
  const content = await getPublicInvitationContent(params.publicId);
  if (!content) {
    return { title: "Invitation Not Found" };
  }

  return {
    title: content.share.kakaoTitle || "MarieCard Invitation",
    description: content.share.kakaoDescription || "모바일 청첩장",
    openGraph: {
      title: content.share.kakaoTitle || "MarieCard Invitation",
      description: content.share.kakaoDescription || "모바일 청첩장",
      images: content.share.imageUrl ? [content.share.imageUrl] : undefined,
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
