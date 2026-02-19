import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "고객가이드(Q&A) | MarieCard",
  description: "마리에카드 서비스 이용 방법, 계정, 청첩장 제작, 발행, 결제 관련 자주 묻는 질문입니다.",
};

const groups = [
  {
    title: "시작하기",
    items: [
      {
        q: "마리에카드는 어떤 서비스인가요?",
        a: "Google 로그인 후 모바일 청첩장을 제작하고, 링크를 발행/관리하는 서비스입니다.",
      },
      {
        q: "회원가입은 어떻게 하나요?",
        a: "별도 회원가입 없이 Google 로그인으로 바로 시작할 수 있습니다.",
      },
    ],
  },
  {
    title: "청첩장 제작",
    items: [
      {
        q: "초대장 생성 기준은 무엇인가요?",
        a: "대시보드에서 '초대장 만들기'를 누른 뒤, 편집기에서 '청첩장 내보내기'를 실행하면 공개 링크가 생성됩니다.",
      },
      {
        q: "임시저장과 내보내기의 차이는 무엇인가요?",
        a: "임시저장은 작업 상태를 저장하고, 내보내기는 실제 공유 가능한 공개 링크를 반영합니다.",
      },
      {
        q: "이미지 업로드 후 반영이 느릴 수 있나요?",
        a: "네트워크 상태와 파일 용량에 따라 반영 시간이 달라질 수 있습니다. 권장 사이즈를 사용하면 더 안정적입니다.",
      },
    ],
  },
  {
    title: "공유/발행",
    items: [
      {
        q: "카카오톡 공유가 동작하지 않아요.",
        a: "카카오 개발자 콘솔의 제품 링크 관리 도메인, JavaScript 키, SDK 도메인 설정을 확인해 주세요.",
      },
      {
        q: "만료된 초대장은 어떻게 복구하나요?",
        a: "관리자에서 상태를 복구하면 다시 활성화됩니다.",
      },
    ],
  },
  {
    title: "계정/보안",
    items: [
      {
        q: "로그아웃 후 어디로 이동하나요?",
        a: "로그아웃하면 홈(/)으로 이동합니다.",
      },
      {
        q: "내 계정 정보는 어디서 관리하나요?",
        a: "마이페이지에서 프로필/보안/환경설정/결제 정보를 확인할 수 있습니다.",
      },
    ],
  },
];

export default function QnaPage() {
  return (
    <main className="min-h-screen bg-[#faf3ec] px-4 py-12 md:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-[#230603] md:text-4xl">고객가이드 (Q&A)</h1>
          <Link href="/" className="text-sm font-medium text-[#800532] underline">
            홈으로
          </Link>
        </div>

        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.title} className="rounded-2xl border border-[#eadccd] bg-white p-5 md:p-6">
              <h2 className="text-xl font-semibold text-[#230603]">{group.title}</h2>
              <div className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <article key={item.q} className="rounded-xl bg-[#faf7f3] p-4">
                    <p className="text-sm font-semibold text-[#800532]">Q. {item.q}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[#3b3f4a]">A. {item.a}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
