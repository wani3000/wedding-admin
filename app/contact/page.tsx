import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "고객문의 | MarieCard",
  description: "마리에카드 오픈/운영 관련 문의 페이지입니다.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#faf3ec] px-4 py-12 md:px-6">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[#eadccd] bg-white p-6 md:p-8">
        <div className="mb-6 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-[#230603] md:text-3xl">고객문의</h1>
          <Link href="/" className="text-sm font-medium text-[#800532] underline">
            홈으로
          </Link>
        </div>
        <div className="space-y-3 text-sm text-[#3b3f4a]">
          <p>서비스 이용/오류/계정 관련 문의를 접수합니다.</p>
          <p>이메일: <a href="mailto:support@mariecard.com" className="text-[#800532] underline">support@mariecard.com</a></p>
          <p>응답 시간: 영업일 기준 1~2일</p>
        </div>
      </div>
    </main>
  );
}
