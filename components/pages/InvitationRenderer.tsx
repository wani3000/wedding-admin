import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { Gallery } from "@/components/sections/Gallery";
import { CalendarSection } from "@/components/sections/CalendarSection";
import { Details } from "@/components/sections/Details";
import { Account } from "@/components/sections/Account";
import { Footer } from "@/components/sections/Footer";
import { ShareButtons } from "@/components/sections/ShareButtons";
import { VideoHero } from "@/components/sections/VideoHero";
import type { WeddingContent } from "@/lib/content/types";

export function InvitationRenderer({
  content,
  routeBasePath = "",
  previewHeroBlackBox = false,
}: {
  content: WeddingContent;
  routeBasePath?: string;
  previewHeroBlackBox?: boolean;
}) {
  return (
    <main className="relative min-h-screen text-primary">
      <Header content={content} />
      <VideoHero heroMedia={content.heroMedia} forceBlackBox={previewHeroBlackBox} />

      <div className="relative z-10 bg-white">
        <Hero title={content.heroSection.title} images={content.heroSection.images} />
        <Intro content={content.introSection} />
        <Gallery content={content.gallerySection} routeBasePath={routeBasePath} />
        <CalendarSection content={content} />
        <Details content={content.detailsSection} />
        <Account content={content.accountSection} />
        <Footer content={content} />
      </div>

      <ShareButtons content={content} />
    </main>
  );
}
