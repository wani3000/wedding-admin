import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용약관 | MarieCard",
  description: "마리에카드 서비스 이용약관입니다.",
};

const terms = [
  {
    t: "제1조 (목적)",
    b: "본 약관은 MarieCard(이하 '회사')가 제공하는 모바일 청첩장 제작/관리 서비스의 이용 조건과 절차, 권리·의무 및 책임사항을 규정합니다.",
  },
  {
    t: "제2조 (정의)",
    b: "서비스란 사용자가 청첩장을 생성·편집·내보내기·공유할 수 있도록 회사가 제공하는 웹 기반 기능 일체를 의미합니다.",
  },
  {
    t: "제3조 (약관의 효력 및 변경)",
    b: "회사는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 사전에 공지합니다.",
  },
  {
    t: "제4조 (회원가입 및 계정)",
    b: "사용자는 Google OAuth 기반으로 로그인하며, 계정 정보의 관리 책임은 사용자에게 있습니다.",
  },
  {
    t: "제5조 (서비스 제공)",
    b: "회사는 청첩장 제작/미리보기/내보내기/링크 관리 기능을 제공하며 운영상 필요한 경우 기능을 조정할 수 있습니다.",
  },
  {
    t: "제6조 (사용자 의무)",
    b: "사용자는 관계 법령 및 본 약관을 준수해야 하며 타인의 권리를 침해하거나 서비스 운영을 방해하는 행위를 해서는 안 됩니다.",
  },
  {
    t: "제7조 (저작권 및 콘텐츠 권리)",
    b: "사용자가 업로드한 이미지/문구 등 콘텐츠의 권리와 책임은 사용자에게 있으며, 회사는 서비스 제공 범위 내에서 이를 처리합니다.",
  },
  {
    t: "제8조 (서비스 제한 및 종료)",
    b: "회사는 약관 위반 또는 운영상 필요 시 서비스 일부 또는 전부를 제한/중단할 수 있습니다.",
  },
  {
    t: "제9조 (면책)",
    b: "천재지변, 불가항력, 사용자의 귀책 사유로 발생한 손해에 대해 회사는 책임을 지지 않습니다.",
  },
  {
    t: "제10조 (준거법 및 관할)",
    b: "본 약관은 대한민국 법령에 따르며 서비스 관련 분쟁은 관련 법령에 따른 관할 법원을 따릅니다.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#faf3ec] px-4 py-12 md:px-6">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-[#eadccd] bg-white p-6 md:p-8">
        <div className="mb-6 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-[#230603] md:text-3xl">이용약관</h1>
          <Link href="/" className="text-sm font-medium text-[#800532] underline">
            홈으로
          </Link>
        </div>
        <div className="space-y-5">
          {terms.map((term) => (
            <section key={term.t}>
              <h2 className="text-lg font-semibold text-[#230603]">{term.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#3b3f4a]">{term.b}</p>
            </section>
          ))}
          <p className="pt-4 text-xs text-gray-500">시행일: 2026년 2월 17일</p>
        </div>
      </div>
    </main>
  );
}
