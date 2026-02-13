import { notFound } from "next/navigation";
import { GalleryPageClient } from "@/components/pages/GalleryPageClient";
import { getPublicInvitationContent } from "@/lib/platform/content";

export const dynamic = "force-dynamic";

export default async function PublicInvitationGalleryPage({
  params,
}: {
  params: { publicId: string };
}) {
  const content = await getPublicInvitationContent(params.publicId);
  if (!content) notFound();

  return (
    <GalleryPageClient
      images={content.gallerySection.images}
      backHref={`/invitation/${params.publicId}#gallery`}
      lightboxPath={`/invitation/${params.publicId}/lightbox`}
    />
  );
}
