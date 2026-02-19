"use client";

import { type ComponentType, useMemo, useState } from "react";
import {
  Bell,
  Building2,
  CreditCard,
  FileText,
  Lock,
  Mail,
  Monitor,
  Settings,
  UserCircle2,
} from "lucide-react";

type MyPageClientProps = {
  userName: string;
  userEmail: string;
};

type MenuItem = {
  id: "account" | "security" | "notifications" | "env" | "workspace" | "billing" | "history";
  label: string;
  icon: ComponentType<{ className?: string }>;
  group: "계정" | "관리";
};

const MENU_ITEMS: MenuItem[] = [
  { id: "account", label: "나의 계정", icon: UserCircle2, group: "계정" },
  { id: "security", label: "로그인 및 보안", icon: Lock, group: "계정" },
  { id: "notifications", label: "알림", icon: Mail, group: "계정" },
  { id: "env", label: "환경설정", icon: Settings, group: "계정" },
  { id: "workspace", label: "워크스페이스 설정", icon: Building2, group: "관리" },
  { id: "billing", label: "결제 정보 설정", icon: CreditCard, group: "관리" },
  { id: "history", label: "결제 내역", icon: FileText, group: "관리" },
];

function LabelInput({ label, value, placeholder }: { label: string; value?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-base font-semibold text-[#23262f] md:text-xl">{label}</span>
      <input
        value={value || ""}
        readOnly
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 md:h-12 md:text-base"
      />
    </label>
  );
}

export function MyPageClient({ userName, userEmail }: MyPageClientProps) {
  const [active, setActive] = useState<MenuItem["id"]>("account");

  const grouped = useMemo(() => {
    return {
      account: MENU_ITEMS.filter((item) => item.group === "계정"),
      manage: MENU_ITEMS.filter((item) => item.group === "관리"),
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] grid-cols-1 md:grid-cols-[280px_1fr]">
        <aside className="border-b border-gray-200 bg-[#f5f6f8] px-4 py-5 md:border-b-0 md:border-r md:px-5 md:py-6">
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-xs text-gray-400 md:text-sm">계정</p>
              <div className="grid grid-cols-2 gap-1.5 md:grid-cols-1">
                {grouped.account.map((item) => {
                  const Icon = item.icon;
                  const selected = active === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActive(item.id)}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium md:gap-3 md:px-4 md:py-3 md:text-[18px] ${
                        selected ? "bg-[#ececef] text-[#23262f]" : "text-[#2f3440] hover:bg-[#eeeff2]"
                      }`}
                    >
                      <Icon className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs text-gray-400 md:text-sm">관리</p>
              <div className="grid grid-cols-2 gap-1.5 md:grid-cols-1">
                {grouped.manage.map((item) => {
                  const Icon = item.icon;
                  const selected = active === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActive(item.id)}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium md:gap-3 md:px-4 md:py-3 md:text-[18px] ${
                        selected ? "bg-[#ececef] text-[#23262f]" : "text-[#2f3440] hover:bg-[#eeeff2]"
                      }`}
                    >
                      <Icon className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <section className="bg-[#f5f6f8] px-4 py-6 md:px-10 md:py-10">
          {active === "account" && (
            <div className="max-w-[860px]">
              <h1 className="text-3xl font-bold tracking-tight text-[#1f2430] md:text-[52px]">나의 계정</h1>

              <div className="mt-6 flex items-center gap-4 md:mt-8 md:gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e9eaee] text-gray-400 md:h-24 md:w-24">
                  <UserCircle2 className="h-10 w-10 md:h-12 md:w-12" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[#2f3440] md:text-[18px]">나의 프로필</p>
                  <button className="mt-2 rounded-xl bg-[#e7e7ea] px-4 py-2 text-sm font-medium text-[#3d4250] md:px-6 md:py-3 md:text-[18px]">
                    사진 업로드
                  </button>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <LabelInput label="이름" value={userName || "박철완"} />
                <LabelInput label="이메일" value={userEmail} />

                <label className="block">
                  <span className="mb-2 block text-base font-semibold text-[#23262f] md:text-xl">사용자 유형</span>
                  <div className="flex h-11 items-center justify-between rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-500 md:h-12 md:text-base">
                    <span>어떤 분야에서 마리에카드를 사용하시나요?</span>
                    <span>▾</span>
                  </div>
                </label>

                <button className="rounded-xl bg-[#e8e8eb] px-8 py-2.5 text-sm font-semibold text-[#a2a6b0] md:px-10 md:py-3 md:text-[17px]">
                  변경사항 저장
                </button>
              </div>

              <div className="mt-10 border-t border-gray-200 pt-8 md:mt-12 md:pt-10">
                <p className="text-xl font-semibold text-[#ef4444] md:text-2xl">계정 삭제</p>
                <p className="mt-3 text-base text-[#394150] md:text-[19px]">
                  계정 삭제시 내 초대장 및 관리 데이터가 삭제됩니다.
                </p>
              </div>
            </div>
          )}

          {active === "security" && (
            <div className="max-w-[860px] space-y-10">
              <h1 className="text-3xl font-bold tracking-tight text-[#1f2430] md:text-[52px]">로그인 및 보안</h1>

              <section>
                <h2 className="text-2xl font-semibold text-[#23262f] md:text-[34px]">로그인</h2>
                <p className="mt-3 text-base text-[#394150] md:text-[19px]">
                  소셜 로그인 기반 서비스입니다. 필요 시 추가 보안 옵션을 제공합니다.
                </p>
                <button className="mt-4 rounded-xl bg-[#e7e7ea] px-6 py-2.5 text-sm font-semibold text-[#3d4250] md:px-8 md:py-3 md:text-[17px]">
                  비밀번호 설정
                </button>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#23262f] md:text-[34px]">보안</h2>
                <p className="mt-3 text-base text-[#394150] md:text-[19px]">현재 브라우저를 제외한 다른 기기에서 로그아웃할 수 있습니다.</p>
                <button className="mt-4 rounded-xl bg-[#e7e7ea] px-6 py-2.5 text-sm font-semibold text-[#3d4250] md:px-8 md:py-3 md:text-[17px]">
                  모든 기기에서 로그아웃
                </button>

                <div className="mt-6 max-w-sm rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center gap-3 text-[22px] font-semibold text-[#23262f]">
                    <Monitor className="h-6 w-6" /> Mac
                  </div>
                  <p className="mt-3 text-[17px] text-gray-500">현재 접속중인 기기</p>
                </div>
              </section>
            </div>
          )}

          {active === "billing" && (
            <div className="max-w-[860px] space-y-10">
              <h1 className="text-3xl font-bold tracking-tight text-[#1f2430] md:text-[52px]">결제 정보 설정</h1>
              <section>
                <h2 className="text-2xl font-semibold text-[#23262f] md:text-[34px]">사용중인 요금제</h2>
                <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#e7e7ea] px-6 py-2.5 text-sm font-semibold text-[#3d4250] md:px-8 md:py-3 md:text-[17px]">
                  👑 Pro 체험판 사용
                </button>
              </section>
              <section>
                <h2 className="text-2xl font-semibold text-[#23262f] md:text-[34px]">결제 수단</h2>
                <p className="mt-3 text-base text-[#394150] md:text-[19px]">등록된 결제 수단이 없습니다.</p>
                <button className="mt-4 rounded-xl bg-[#e7e7ea] px-6 py-2.5 text-sm font-semibold text-[#3d4250] md:px-8 md:py-3 md:text-[17px]">
                  결제 수단 등록
                </button>
              </section>
            </div>
          )}

          {active === "history" && (
            <div className="max-w-[860px]">
              <h1 className="text-3xl font-bold tracking-tight text-[#1f2430] md:text-[52px]">결제 내역</h1>
              <div className="mt-20 text-center text-lg text-gray-500 md:mt-24 md:text-[24px]">표시할 결제 내역이 없어요.</div>
            </div>
          )}

          {active === "notifications" && (
            <SimplePane title="알림" icon={Bell} description="서비스 알림, 내보내기/만료/복구 알림을 설정합니다." />
          )}
          {active === "env" && (
            <SimplePane title="환경설정" icon={Settings} description="언어, 시간대, 기본 초대장 서식을 설정합니다." />
          )}
          {active === "workspace" && (
            <SimplePane title="워크스페이스 설정" icon={Building2} description="팀/협업 환경을 관리할 수 있습니다." />
          )}
        </section>
      </div>
    </main>
  );
}

function SimplePane({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="max-w-[860px]">
      <h1 className="text-3xl font-bold tracking-tight text-[#1f2430] md:text-[52px]">{title}</h1>
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 md:mt-10 md:p-8">
        <div className="flex items-center gap-3 text-xl font-semibold text-[#23262f] md:text-2xl">
          <Icon className="h-6 w-6 md:h-7 md:w-7" />
          {title}
        </div>
        <p className="mt-4 text-base text-[#394150] md:text-[19px]">{description}</p>
      </div>
    </div>
  );
}
