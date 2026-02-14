"use client";

import { ScrollReveal } from "../ui/ScrollReveal";
import type { WeddingContent } from "@/lib/content/types";

export function Footer({ content }: { content: WeddingContent }) {
  return (
    <footer className="bg-white px-4 pb-28 pt-16 text-black md:pb-32 md:pt-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
        <ScrollReveal className="flex-1">
          <h3 className="font-serif text-base">{content.footer.nameLine || content.couple.displayName}</h3>
          <div className="mt-4 flex flex-col gap-1">
            <p className="max-w-xs text-gray-600">{content.footer.tagline}</p>
            <p className="text-base text-gray-500">
              {content.footer.dateLine || content.wedding.dateLabel}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
