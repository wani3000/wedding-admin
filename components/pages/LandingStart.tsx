"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const figHeroMain = "https://www.figma.com/api/mcp/asset/7eb8556a-d792-494a-890a-f844c45063ef";
const figHeroSticker = "https://www.figma.com/api/mcp/asset/c1cdd417-85cb-459c-8086-ca730eb518f4";
const figHeroSymbol = "https://www.figma.com/api/mcp/asset/6db9b449-8cb7-4c43-a5ef-a6961bf0aa58";
const figFeatureA = "https://www.figma.com/api/mcp/asset/3d694007-800b-4f36-be54-d6fe55a56dd6";
const figFeatureB = "https://www.figma.com/api/mcp/asset/b8e0b3bf-bba5-49fc-b27c-bbe10389bf36";
const figFeatureC = "https://www.figma.com/api/mcp/asset/4a9d7869-cb0e-4409-9072-3377d81435d7";
const figFeatureD = "https://www.figma.com/api/mcp/asset/af2bbe96-4f8c-461b-8163-3c659584c41f";
const figFeatureE = "https://www.figma.com/api/mcp/asset/690f8d3c-3455-44b0-9109-c63b1b3e410e";
const figFeatureF = "https://www.figma.com/api/mcp/asset/4412caec-5c27-4666-8b1a-f4db57ee6f2d";
const figPersonA = "https://www.figma.com/api/mcp/asset/d66fd30d-5df6-43ae-9e45-1d2f13ab3ce6";
const figPersonB = "https://www.figma.com/api/mcp/asset/bad51b24-e182-46de-b83d-72d2cc156734";
const figPersonC = "https://www.figma.com/api/mcp/asset/b18d6ea6-565c-4475-a0d1-6b6f0cb47be4";

const partners = [
  "KAKAO",
  "NAVER",
  "TOSS",
  "BANK SALAD",
  "WEDDINGBOOK",
  "MARRIED",
  "BRIDE & YOU",
];
const partnerLoop = [...partners, ...partners];

const showcaseCards = [
  {
    title: "실시간 미리보기",
    body: "입력 즉시 모바일 화면으로 확인하고, 섹션별로 완성도를 빠르게 점검합니다.",
    tone: "bg-[#f6e1e6]",
    image: figFeatureA,
  },
  {
    title: "AI 콘텐츠 정리",
    body: "문구 아이디어, 일정 포맷, 안내문을 한 번에 다듬어 작성 속도를 높입니다.",
    tone: "bg-[#f2e6ea]",
    image: figFeatureB,
  },
  {
    title: "갤러리 큐레이션",
    body: "하이라이트 컷을 먼저 배치하고, 순서를 끌어다 놓아 완성도를 맞춥니다.",
    tone: "bg-[#e8d9cb]",
    image: figFeatureC,
  },
  {
    title: "발행 관리",
    body: "미리보기 링크와 실제 공유 링크를 분리해 안전하게 검수 후 발행합니다.",
    tone: "bg-[#e0e4ca]",
    image: figFeatureD,
  },
  {
    title: "팀 협업 워크스페이스",
    body: "웨딩플래너·가족과 함께 작성하고 변경 히스토리를 관리할 수 있습니다.",
    tone: "bg-[#f6e1e6]",
    image: figFeatureE,
  },
  {
    title: "트렌드 레이아웃",
    body: "실제 인기 구조를 기반으로 섹션 배치를 빠르게 시작할 수 있습니다.",
    tone: "bg-[#f2e6ea]",
    image: figFeatureF,
  },
];

const steps = [
  {
    number: "01",
    title: "기본 정보 입력",
    body: "예식 일정, 장소, 소개 문구를 입력해 초대장 구조를 빠르게 완성합니다.",
  },
  {
    number: "02",
    title: "이미지와 갤러리 구성",
    body: "히어로/섹션 이미지와 갤러리 순서를 조정하며 전체 분위기를 맞춥니다.",
  },
  {
    number: "03",
    title: "검수 후 링크 발행",
    body: "미리보기로 최종 확인한 뒤 실제 공유 링크를 발행해 하객에게 전달합니다.",
  },
];

export function LandingStart() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.25]);
  const sectionScale = useTransform(scrollYProgress, [0.08, 0.22], [0.96, 1]);

  const handleStart = async () => {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/dashboard")}`;
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (authError) {
        setError("Google 로그인 시작에 실패했습니다.");
      }
    } catch {
      setError("로그인 설정을 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#faf3ec] text-[#230603]">
      <section className="bg-[#800532] px-4 py-3 text-center text-sm text-[#faf3ec]">
        모바일 청첩장 제작 서비스 MarieCard 오픈. 지금 바로 샘플을 확인해 보세요.
      </section>

      <section className="relative overflow-hidden px-4 pb-24 pt-20 md:pb-36 md:pt-28">
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute -left-24 top-24 size-72 rounded-full bg-[#f6e1e6] blur-3xl"
        />
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute -right-20 bottom-12 size-72 rounded-full bg-[#e0e4ca] blur-3xl"
        />
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="mx-auto flex w-full max-w-6xl flex-col items-center"
        >
          <p className="rounded-full border border-[#f6e1e6] bg-white px-4 py-1.5 text-xs tracking-[0.06em] text-[#800532]">
            MARRIAGE INVITATION PLATFORM
          </p>
          <h1 className="mt-8 text-center text-4xl font-medium leading-tight tracking-[-0.04em] text-[#800532] md:text-6xl">
            초대의 순간을 더 아름답게,
            <br />
            모바일 청첩장을 더 쉽게.
          </h1>
          <p className="mt-6 max-w-2xl text-center text-lg text-[#230603]/70">
            MarieCard는 예비부부와 웨딩팀이 함께 사용하는 차세대 모바일 청첩장 제작 도구입니다.
            기획부터 공유까지 한 번에 완성하세요.
          </p>

          <div className="mt-12 flex w-full max-w-2xl flex-col gap-3 rounded-[24px] bg-white p-4 shadow-[0_14px_40px_-20px_rgba(24,39,75,0.4)] md:flex-row">
            <Link
              href="/sample"
              className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#e8d9cb] px-6 py-3 text-sm font-medium text-[#230603] transition hover:-translate-y-0.5 hover:bg-[#faf3ec]"
            >
              청첩장 샘플 미리보기
            </Link>
            <button
              onClick={handleStart}
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#230603] px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-black disabled:opacity-60"
            >
              {loading ? "이동 중..." : "로그인하고 제작하기"}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-[#800532]">{error}</p>}

          <div className="relative mt-14 h-[320px] w-full max-w-3xl md:h-[420px]">
            <motion.img
              initial={{ opacity: 0, y: 30, rotate: -8 }}
              whileInView={{ opacity: 1, y: 0, rotate: -6 }}
              animate={{ y: [0, -8, 0] }}
              viewport={{ once: true }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              src={figHeroMain}
              alt="figma hero"
              className="absolute left-1/2 top-1/2 h-[260px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] object-cover shadow-2xl md:h-[340px] md:w-[230px]"
            />
            <motion.img
              initial={{ opacity: 0, x: -20, y: 20, rotate: 8 }}
              whileInView={{ opacity: 1, x: 0, y: 0, rotate: 12 }}
              animate={{ y: [0, 6, 0], rotate: [12, 14, 12] }}
              viewport={{ once: true }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              src={figHeroSticker}
              alt="figma sticker"
              className="absolute left-[18%] top-[25%] h-24 w-28 object-contain md:h-32 md:w-36"
            />
            <motion.img
              initial={{ opacity: 0, x: 20, y: 10 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              animate={{ y: [0, -5, 0] }}
              viewport={{ once: true }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
              src={figHeroSymbol}
              alt="figma symbol"
              className="absolute bottom-[12%] right-[20%] h-16 w-16 object-contain md:h-24 md:w-24"
            />
          </div>
        </motion.div>
      </section>

      <section className="overflow-hidden border-y border-[#f6e1e6] bg-white py-7">
        <div className="relative mx-auto w-full max-w-6xl">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="flex w-[200%] gap-x-10 text-sm font-medium tracking-[0.06em] text-[#494949]/70"
          >
            {partnerLoop.map((item, index) => (
              <span key={`${item}-${index}`} className="shrink-0">
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-20 md:py-28">
        <motion.div style={{ scale: sectionScale }} className="mx-auto w-full max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#600426] md:text-5xl"
          >
            결혼 준비에 필요한 운영을 줄이고,
            <br />
            더 중요한 순간에 집중하세요.
          </motion.h2>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {showcaseCards.map((card, index) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6, scale: 1.01 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className={`overflow-hidden rounded-2xl border border-white/70 ${card.tone}`}
              >
                <img src={card.image} alt={card.title} className="h-40 w-full object-cover" />
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-[#230603]">{card.title}</h3>
                  <p className="mt-3 text-[#230603]/75">{card.body}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="bg-[#600426] px-4 py-20 text-white md:py-28">
        <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.article
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="rounded-2xl border border-white/15 bg-white/5 p-6"
            >
              <p className="font-mono text-sm text-white/70">STEP {step.number}</p>
              <h3 className="mt-3 text-2xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">{step.body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7 }}
          className="mx-auto flex w-full max-w-4xl flex-col items-center text-center"
        >
          <div className="mb-6 flex items-center gap-3">
            <img src={figPersonA} alt="user1" className="h-12 w-12 rounded-full object-cover" />
            <img src={figPersonB} alt="user2" className="h-12 w-12 rounded-full object-cover" />
            <img src={figPersonC} alt="user3" className="h-12 w-12 rounded-full object-cover" />
          </div>

          <h2 className="text-4xl font-semibold leading-tight tracking-[-0.04em] text-[#230603] md:text-6xl">
            덜 복잡하게,
            <br />
            더 우아하게 초대하세요
          </h2>

          <button
            onClick={handleStart}
            disabled={loading}
            className="mt-8 rounded-full bg-[#800532] px-8 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#600426] disabled:opacity-60"
          >
            {loading ? "이동 중..." : "로그인하고 제작하기"}
          </button>
        </motion.div>
      </section>

      <footer className="border-t border-[#f6e1e6] px-4 py-10 text-sm text-[#494949]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 md:flex-row">
          <p className="font-semibold text-[#230603]">MarieCard</p>
          <p>© 2026 MarieCard. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
