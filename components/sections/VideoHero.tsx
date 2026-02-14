"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import type { WeddingContent } from "@/lib/content/types";

const SVG_HTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 329.01 209.67" style="width:100%;height:auto;">
  <defs>
    <style>
      .st0, .st1 { fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
      .st0 { stroke: #fefefe; }
      .st1 { stroke: #fff; }
    </style>
  </defs>
  <path class="st1" d="M3.65,12.16s.29,74.82,6.57,78.47c5.6,3.26,20.62-52.07,23.76-63.98.15-.57.96-.55,1.08.02,2.64,12,15.13,67.87,18.6,68.47,0,0,2.63,5.1,5.69-14.73,3.06-19.83,5.39-77.73,5.39-77.73"/>
  <path class="st1" d="M90.72,55.86s-7.89,20.71-14.1,10.31c-1.83-3.06-2.97-6.8-3.51-10.47-1.33-8.81.64-17.22,4.2-15.1,5.05,3.02-.19,10.14-1.65,12.12s-1.79,2.33-1.79,2.33"/>
  <path class="st1" d="M93.72,2.68s.84,4.99-.17,8.95"/>
  <path class="st1" d="M98.51,56.17s9.57-20.74,1.73-20.88c-7-.13-5.89,7.75,2.63,12.4,2.74,1.49,4.64,4.14,5.4,7.16.82,3.26,1.47,7.73.91,12.96-1.16,10.94,11.65-3.79,11.65-3.79,0,0,12.68-18.81,5.77-21.15s-5.74,8.94-5.01,13.3,2.48,12.31,9.63,12.92,10.49-11.89,10.49-11.89"/>
  <path class="st1" d="M173.93,51.58s-4.57-12.58-8.99-.56c-4.42,12.03-.33,19.4,4.49,14.5s6.4-13.98,7.7-22.08c1.31-8.1,3.08,72.69-8.75,70.35s-3.51-30.83,15.3-44.44c18.81-13.61,16.21-25.4,13.12-26.49s-6.09,1.36-5.74,9.16,4.72,26.91,15.66,14.37c0,0,4.3-3.34,5.24-26.21.94-22.87,4.08-26.88,4.08-26.88"/>
  <path class="st1" d="M195.87,29.78s29.83-10.63,44.27-11.07"/>
  <path class="st1" d="M211.37,49.15s-.63,42.64,9.91,32.06c10.54-10.57,10.25-62.94,14.73-67.89"/>
  <path class="st1" d="M216.07,30.35s31.02-9.85,45.8-11.64"/>
  <path class="st1" d="M230.86,45.69s-2.53,44.05,8.12,35.74,14.92-32.28,14.92-32.28c0,0-6.03,22.6,1.16,25.51"/>
  <path class="st1" d="M265.89,46.61s-.44,25.61,1.61,25.23,9.04-15.69,9.04-15.69c0,0,4.42,16.76,9.19,15.69,3.38-.76,6.72-2.64,8.65-5.74.8-1.28,1.36-2.77,1.56-4.48.73-5.84.02-17.38,7.51-12.49s.52,24.88-8.77,18.54"/>
  <path class="st1" d="M309.65,44.87s4.37,75.39-7.29,71.52,2.12-36.1,11.37-43.24,11.63-13.13,11.63-13.13"/>
  <path class="st0" d="M21.88,157.8s20.61-51.71,35.83-42.48c15.22,9.23,2.97,91.68,2.97,91.68,0,0,5.73-44.08,14.58-61.4,2.96-5.79,7.69-5.02,9.19,1.31,1.76,7.45,3.71,30.23,1.82,44.66,0,.05.06.07.07.02,1.65-5.94,16.63-59.3,21.73-57.51,5.4,1.9-4.73,55.2,4.2,61.8"/>
  <path class="st0" d="M125.83,167.25s-4.93,14.57-7.8,10.57,4.42-28.51,8.11-17.22c2.87,8.77-.56,15.74,4.14,20.9,2.87,3.15,7.99,2.62,10.29-.97,5.97-9.3,15.97-29.55,9.49-31.05-10.29-2.38-10.29,11.55.26,12.92,2.93.38,4.62,3.36,5.35,6.44.29,1.24.39,2.52.38,3.79l-.07,12.52s2.72,4.05,8.94-4.86,13.61-29.32,8.44-30.5-10.49,8.82,2.34,13.68c12.53,4.74-1.3,27.2,8.27,22.61,9.57-4.6,11.67-24.16,11.67-24.16,0,0-5.06,19.03.97,24.84"/>
  <path class="st0" d="M209.1,171.43s-4.7-16.91,3.12-15.26-14.37,26.35,2.38,27.82c0,0,4.14,1.4,8.36-3.42,0,0,3.46,11.77,11.36,1.03,7.9-10.75,24.03-54.3,13.15-56.83s-15.44,72.77,3.66,70.12"/>
  <path class="st0" d="M265.79,134.83s-8.5,36.71-2.13,50.27"/>
  <circle class="st0" cx="266.04" cy="191.75" r="3.21"/>
</svg>`;

export function VideoHero({
  heroMedia,
  forceBlackBox = false,
}: {
  heroMedia: WeddingContent["heroMedia"];
  forceBlackBox?: boolean;
}) {
  const [viewportHeight, setViewportHeight] = useState(0);
  const [mediaSrc, setMediaSrc] = useState(heroMedia.mobileSrc);
  const svgRef = useRef<HTMLDivElement>(null);
  // IMPORTANT:
  // - 모바일 미리보기에서 mobileSrc만 업로드했을 때 desktopSrc가 placeholder면 "계속 회색 박스"가 되는 문제가 있었음.
  // - 그래서 placeholder 판정은 "현재 실제로 렌더할 src(mediaSrc)" 기준으로만 함.
  // - poster는 video의 썸네일일 뿐이므로 placeholder여도 영상/이미지 표시를 막으면 안 됨.
  const isPlaceholderHero = mediaSrc.includes("placeholder-gray.svg");
  const renderHeroPlaceholder = forceBlackBox || isPlaceholderHero;

  const animateSvg = useCallback(() => {
    if (!svgRef.current) return;
    svgRef.current.innerHTML = SVG_HTML;

    const paths = Array.from(
      svgRef.current.querySelectorAll("path"),
    ) as SVGPathElement[];
    const circle = svgRef.current.querySelector(
      "circle",
    ) as SVGCircleElement | null;

    paths.forEach((path) => {
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
    });
    if (circle) circle.style.opacity = "0";

    const TOTAL_MS = 3000;
    const lengths = paths.map((p) => p.getTotalLength());
    const totalLen = lengths.reduce((a, b) => a + b, 0);

    let delay = 0;
    paths.forEach((path, i) => {
      const dur = (lengths[i] / totalLen) * TOTAL_MS;
      path.animate(
        [{ strokeDashoffset: `${lengths[i]}` }, { strokeDashoffset: "0" }],
        { duration: dur, easing: "ease-in", delay, fill: "forwards" },
      );
      delay += dur;
    });

    if (circle) {
      circle.animate([{ opacity: "0" }, { opacity: "1" }], {
        duration: 100,
        easing: "ease-in",
        delay,
        fill: "forwards",
      });
    }
  }, []);

  useEffect(() => {
    const setHeight = () => {
      const initialHeight = window.innerHeight;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      const isDesktop = window.innerWidth >= 1024;

      setViewportHeight(initialHeight);
      setMediaSrc(
        isTablet || isDesktop ? heroMedia.desktopSrc : heroMedia.mobileSrc,
      );
      document.documentElement.style.setProperty("--initial-vh", `${initialHeight}px`);
    };

    setHeight();

    window.addEventListener("resize", setHeight);
    window.addEventListener("orientationchange", setHeight);

    return () => {
      window.removeEventListener("resize", setHeight);
      window.removeEventListener("orientationchange", setHeight);
    };
  }, [heroMedia.desktopSrc, heroMedia.mobileSrc]);

  useEffect(() => {
    const timer = setTimeout(animateSvg, 300);
    return () => clearTimeout(timer);
  }, [animateSvg]);

  return (
    <section
      className="sticky top-0 -z-10 w-full overflow-hidden bg-white"
      style={{
        height: viewportHeight ? `${viewportHeight}px` : "100vh",
        minHeight: viewportHeight ? `${viewportHeight}px` : "100vh",
        maxHeight: viewportHeight ? `${viewportHeight}px` : "100vh",
      }}
    >
      <div className="absolute inset-0 z-0">
        {renderHeroPlaceholder ? (
          <div className="h-full w-full bg-[#2f2f33]" />
        ) : heroMedia.type === "video" ? (
          <video
            key={mediaSrc}
            autoPlay
            muted
            loop
            playsInline
            poster={heroMedia.poster}
            className="h-full w-full object-cover"
          >
            <source src={mediaSrc} type="video/mp4" />
          </video>
        ) : (
          mediaSrc.startsWith("blob:") || mediaSrc.startsWith("data:") ? (
            // next/image doesn't support blob/data URLs reliably; use a plain img for local previews.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaSrc} alt="hero" className="h-full w-full object-cover" />
          ) : (
            <Image
              src={mediaSrc}
              alt="hero"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          )
        )}
      </div>

      {renderHeroPlaceholder && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center pb-20">
          <span className="text-[28px] font-semibold tracking-tight text-[#b9bcc3] md:text-[34px]">
            첫번째 이미지
          </span>
        </div>
      )}

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
        <div ref={svgRef} className="w-[280px] md:w-[320px] lg:w-[380px]" />
      </div>
    </section>
  );
}
