import { GalleryPageClient } from "@/components/pages/GalleryPageClient";
import { getWeddingContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const content = await getWeddingContent();
  return <GalleryPageClient images={content.gallerySection.images} />;
}
