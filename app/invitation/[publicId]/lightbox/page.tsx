import { notFound } from "next/navigation";
import { LightboxPageClient } from "@/components/pages/LightboxPageClient";
import { getPublicInvitationContent } from "@/lib/platform/content";

export const dynamic = "force-dynamic";

export default async function PublicInvitationLightboxPage({
  params,
}: {
  params: { publicId: string };
}) {
  const content = await getPublicInvitationContent(params.publicId);
  if (!content) notFound();

  return (
    <LightboxPageClient
      images={content.gallerySection.images}
      lightboxPath={`/invitation/${params.publicId}/lightbox`}
    />
  );
}
