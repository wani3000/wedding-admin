"use client";

import { useRef } from "react";
import Image from "next/image";
import { Copy } from "lucide-react";
import { ScrollReveal } from "../ui/ScrollReveal";
import { copyToClipboard } from "@/lib/utils/clipboard";
import type { WeddingContent } from "@/lib/content/types";

export function Details({ content }: { content: WeddingContent["detailsSection"] }) {
  const toastRef = useRef<HTMLDivElement>(null);

  const showToast = () => {
    if (toastRef.current) {
      toastRef.current.style.opacity = "1";
      toastRef.current.style.transform = "translate(-50%, 0)";
      setTimeout(() => {
        if (toastRef.current) {
          toastRef.current.style.opacity = "0";
          toastRef.current.style.transform = "translate(-50%, 20px)";
        }
      }, 2000);
    }
  };

  const handleCopy = () => {
    copyToClipboard(content.address, showToast);
  };

  return (
    <section className="px-4 py-20 md:px-8 md:py-28 lg:px-10 lg:py-32 bg-off-white">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2 md:gap-12 lg:gap-16">
        <ScrollReveal>
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              <h2 className="font-serif text-[28px] font-medium leading-[1.33] tracking-tight md:text-[38px] lg:text-[46px]">
                {content.venueName}
              </h2>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-xl whitespace-pre-line">
                {content.venueDescription}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                <span className="min-w-0 flex-1 break-words text-[17px] font-semibold text-gray-600">
                  {content.address}
                </span>
                <div
                  onClick={handleCopy}
                  className="inline-flex w-fit shrink-0 items-center gap-1.5 self-start rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800 sm:self-auto cursor-pointer select-none"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="font-sans">복사</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="relative h-6 w-6">
                  <Image
                    src="/icon/number2.png"
                    alt="2"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="min-w-0 break-words text-[17px] font-semibold text-gray-600">
                  {content.stationDescription}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-start sm:gap-x-6 sm:gap-y-4">
              {content.mapLinks.map((link, index) => (
                <div key={`${link.name}-${index}`} className="flex items-center justify-center">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 flex-col items-center gap-1.5 transition-all hover:scale-105 active:scale-95 sm:flex-row sm:gap-2"
                  >
                    <div className="relative h-6 w-6 overflow-hidden rounded-md">
                      <Image
                        src={link.icon}
                        alt={link.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="block w-full text-center text-[16px] font-semibold text-gray-600 sm:w-auto sm:text-[17px]">
                      {link.name}
                    </span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div className="flex flex-col gap-12">
          {content.items.map((detail, i) => (
            <ScrollReveal key={`${detail.title}-${i}`} delay={i * 0.1} width="100%">
              <div className="border-t border-gray-200 pt-8">
                <h3 className="mb-4 text-2xl font-medium">{detail.title}</h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {detail.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <div
        ref={toastRef}
        className="fixed bottom-28 left-1/2 z-[9999] transition-all duration-300 pointer-events-none"
        style={{ opacity: 0, transform: "translate(-50%, 20px)" }}
      >
        <div className="bg-black text-white px-6 py-3 rounded-lg shadow-lg font-sans text-sm whitespace-nowrap">
          주소가 복사되었어요
        </div>
      </div>
    </section>
  );
}
