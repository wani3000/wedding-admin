import { GalleryPageClient } from "@/components/pages/GalleryPageClient";
import { defaultWeddingContent } from "@/lib/content/defaults";

export default function SampleGalleryPage() {
  return (
    <GalleryPageClient
      images={defaultWeddingContent.gallerySection.images}
      backHref="/sample#gallery"
      lightboxPath="/sample/lightbox"
    />
  );
}
