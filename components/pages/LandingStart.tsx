"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const partners = [
  "KAKAO",
  "NAVER",
  "TOSS",
  "BANK SALAD",
  "WEDDINGBOOK",
  "MARRIED",
  "BRIDE & YOU",
];

const featureCards = [
  {
    title: "실시간 미리보기",
    body: "입력 즉시 모바일 화면으로 확인하고, 섹션별로 완성도를 빠르게 점검합니다.",
    tone: "bg-[#f6e1e6]",
  },
  {
    title: "초대장 콘텐츠 에디터",
    body: "신랑·신부 정보, 일정, 장소, 갤러리, 계좌, 안내 문구까지 한 화면에서 제작합니다.",
    tone: "bg-[#f2e6ea]",
  },
  {
    title: "공유 링크 발행",
    body: "미리보기 링크와 실제 공유 링크를 분리해 안전하게 검수 후 발행할 수 있습니다.",
    tone: "bg-[#e8d9cb]",
  },
  {
    title: "만료/복구 운영",
    body: "서비스 운영 중 만료된 초대장도 다시 활성화할 수 있어 유지 관리가 간단합니다.",
    tone: "bg-[#e0e4ca]",
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="pointer-events-none absolute left-6 top-44 hidden rounded-2xl bg-[#f2e6ea] p-4 text-sm text-[#600426] shadow-lg lg:block"
        >
          실시간 모바일 미리보기
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="pointer-events-none absolute bottom-20 right-6 hidden rounded-2xl bg-[#e0e4ca] p-4 text-sm text-[#230603] shadow-lg lg:block"
        >
          링크 발행 · 만료 · 복구 운영
        </motion.div>
      </section>

      <section className="border-y border-[#f6e1e6] bg-white py-7">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 text-sm font-medium tracking-[0.06em] text-[#494949]/70">
          {partners.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 md:py-28">
        <div className="mx-auto w-full max-w-6xl">
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

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {featureCards.map((card, index) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className={`rounded-2xl border border-white/70 p-6 ${card.tone}`}
              >
                <h3 className="text-2xl font-semibold text-[#230603]">{card.title}</h3>
                <p className="mt-3 text-[#230603]/75">{card.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
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
          className="mx-auto flex w-full max-w-3xl flex-col items-center text-center"
        >
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
