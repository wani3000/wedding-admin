import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 | MarieCard",
  description: "마리에카드 개인정보처리방침입니다.",
};

const sections = [
  {
    t: "1. 수집하는 개인정보 항목",
    b: "Google 로그인 정보(이메일, 이름), 서비스 이용 로그, 기기/브라우저 정보, 사용자가 업로드한 청첩장 콘텐츠를 수집할 수 있습니다.",
  },
  {
    t: "2. 개인정보의 이용 목적",
    b: "회원 식별, 청첩장 제작/발행, 고객 문의 응대, 서비스 개선 및 보안 운영 목적으로 이용합니다.",
  },
  {
    t: "3. 개인정보의 보관 및 이용기간",
    b: "회원 탈퇴 또는 처리 목적 달성 시 지체 없이 파기하며, 관련 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관합니다.",
  },
  {
    t: "4. 제3자 제공 및 처리 위탁",
    b: "회사는 원칙적으로 개인정보를 외부에 제공하지 않으며, 서비스 운영을 위해 필요한 범위에서 인프라 사업자(Supabase, Vercel 등)에 처리 위탁할 수 있습니다.",
  },
  {
    t: "5. 이용자의 권리",
    b: "이용자는 본인의 개인정보 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다.",
  },
  {
    t: "6. 안전성 확보 조치",
    b: "접근 통제, 인증 관리, 전송 구간 보호 등 합리적인 보호 조치를 시행합니다.",
  },
  {
    t: "7. 문의처",
    b: "개인정보 관련 문의: support@mariecard.com",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#faf3ec] px-4 py-12 md:px-6">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-[#eadccd] bg-white p-6 md:p-8">
        <div className="mb-6 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-[#230603] md:text-3xl">개인정보처리방침</h1>
          <Link href="/" className="text-sm font-medium text-[#800532] underline">
            홈으로
          </Link>
        </div>

        <div className="space-y-5">
          {sections.map((section) => (
            <section key={section.t}>
              <h2 className="text-lg font-semibold text-[#230603]">{section.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#3b3f4a]">{section.b}</p>
            </section>
          ))}
          <p className="pt-4 text-xs text-gray-500">시행일: 2026년 2월 17일</p>
        </div>
      </div>
    </main>
  );
}
