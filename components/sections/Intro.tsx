"use client";

import Image from "next/image";
import { ScrollReveal } from "../ui/ScrollReveal";
import type { WeddingContent } from "@/lib/content/types";

export function Intro({ content }: { content: WeddingContent["introSection"] }) {
  return (
    <section className="px-4 py-20 md:px-8 md:py-28 lg:px-10 lg:py-32">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 md:flex-row md:items-end md:gap-16 lg:gap-20">
        <div className="flex-1 md:flex-[1.2] lg:flex-[1.3]">
          <ScrollReveal delay={0.1}>
            <h2 className="font-serif text-[28px] font-medium leading-[1.33] tracking-tight md:text-[38px] lg:text-[46px] whitespace-pre-line">
              {content.title}
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.2} className="mt-8">
            <p className="max-w-md text-base md:text-lg text-gray-600 whitespace-pre-line">
              {content.description}
            </p>
          </ScrollReveal>
        </div>

        <div className="flex-1 md:flex-[0.8] lg:flex-[0.7]">
          <ScrollReveal delay={0.3} width="100%">
            <div
              className="relative aspect-[2/3] w-full overflow-hidden bg-gray-100 md:rounded-lg md:max-w-[400px] lg:max-w-[450px] md:ml-auto"
              onContextMenu={(e) => e.preventDefault()}
            >
              <Image
                src={content.image.src}
                alt={content.image.alt}
                fill
                className="object-cover select-none"
                sizes="(max-width: 768px) 100vw, 40vw"
                draggable={false}
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
