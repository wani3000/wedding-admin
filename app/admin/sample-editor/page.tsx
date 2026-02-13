"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { createBlankWeddingContent } from "@/lib/content/blank";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import type { AccountInfo, DetailItem, GalleryImageItem, ImageItem, WeddingContent } from "@/lib/content/types";

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-40 rounded-xl border border-gray-200 bg-white p-5 md:p-6">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black ${props.className || ""}`}
    />
  );
}

function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black ${props.className || ""}`}
    />
  );
}

const ADMIN_LOGIN_ID = "admin";
const ADMIN_LOGIN_PASSWORD = "123456";
const PLACEHOLDER_SRC = "/img/placeholder-gray.svg";
const BANK_OPTIONS = [
  "우리은행",
  "신한은행",
  "케이뱅크",
  "카카오뱅크",
  "토스뱅크",
  "하나은행",
  "기업은행",
];
const FIXED_MAP_LINKS = [
  { name: "카카오맵", icon: "/icon/kakaomap.png" },
  { name: "네이버맵", icon: "/icon/navermap.png" },
  { name: "티맵", icon: "/icon/tmap.png" },
];

function withFixedMapLinks(content: WeddingContent): WeddingContent {
  const current = content.detailsSection.mapLinks || [];
  return {
    ...content,
    detailsSection: {
      ...content.detailsSection,
      mapLinks: FIXED_MAP_LINKS.map((preset, index) => ({
        name: preset.name,
        icon: preset.icon,
        url: current[index]?.url || "",
      })),
    },
  };
}

type InvitationMeta = {
  id: string;
  public_id: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
};

function ImagePreview({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || src.trim() === "") {
    return (
      <div className="mt-2 rounded-lg border border-dashed border-gray-300 px-3 py-4 text-xs text-gray-400">
        이미지 경로를 입력하면 미리보기가 표시됩니다.
      </div>
    );
  }

  return (
    <div className="mt-2">
      {hasError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-4 text-xs text-red-600">
          이미지를 불러오지 못했습니다: {src}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt || "preview"}
          className="h-28 w-20 rounded-md border border-gray-200 object-cover"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}

type SectionTab = {
  id: string;
  label: string;
};

function resolveInvitationTitle(content: WeddingContent | null): string {
  if (!content) return "내 초대장";
  if (content.share.kakaoTitle.trim() !== "") return content.share.kakaoTitle.trim();
  if (content.couple.displayName.trim() !== "") return content.couple.displayName.trim();
  const names = `${content.couple.groomName} ${content.couple.brideName}`.trim();
  if (names !== "") return names;
  return "내 초대장";
}

function EditorHeader({
  name,
  email,
  onLogout,
}: {
  name: string;
  email: string;
  onLogout: () => Promise<void> | void;
}) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("click", closeOnOutside);
    return () => window.removeEventListener("click", closeOnOutside);
  }, []);

  const handleLogout = async () => {
    setBusy(true);
    try {
      await onLogout();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  const initial = (name || email || "M").trim().charAt(0).toUpperCase();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="text-lg font-bold text-gray-900">mariecard</div>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
              {initial}
            </span>
            <span className="hidden max-w-[180px] truncate md:block">{name || email}</span>
          </button>

          {open && (
            <div className="absolute right-0 z-30 mt-2 w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push("/mypage");
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                마이페이지
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={busy}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function AdminPageContent() {
  const searchParams = useSearchParams();
  const invitationId = searchParams.get("invitationId");
  const isPlatformMode = invitationId !== null && invitationId !== "";
  const isSuperMode = searchParams.get("super") === "1";

  const [content, setContent] = useState<WeddingContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loginId, setLoginId] = useState(ADMIN_LOGIN_ID);
  const [loginPassword, setLoginPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeAdminKey, setActiveAdminKey] = useState("");
  const [backups, setBackups] = useState<string[]>([]);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [invitationMeta, setInvitationMeta] = useState<InvitationMeta | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [publicUrl, setPublicUrl] = useState("");
  const [reactivating, setReactivating] = useState(false);
  const [profileName, setProfileName] = useState("내 계정");
  const [profileEmail, setProfileEmail] = useState("");
  const [activeSection, setActiveSection] = useState("section-basic");

  const getAdminHeaders = useCallback((): Record<string, string> => {
    if (activeAdminKey === "") return {};
    if (isPlatformMode && !isSuperMode) return {};
    return { "x-admin-key": activeAdminKey };
  }, [activeAdminKey, isPlatformMode, isSuperMode]);

  const contentEndpoint = isPlatformMode
    ? isSuperMode
      ? `/api/admin/invitations/${invitationId}/content`
      : `/api/platform/invitations/${invitationId}/content`
    : "/api/admin/content";

  const uploadEndpoint = isPlatformMode
    ? isSuperMode
      ? "/api/admin/upload"
      : "/api/platform/upload"
    : "/api/admin/upload";

  const metaEndpoint = isPlatformMode
    ? isSuperMode
      ? `/api/admin/invitations/${invitationId}/meta`
      : `/api/platform/invitations/${invitationId}/meta`
    : "";

  const previewEndpoint = isPlatformMode
    ? isSuperMode
      ? `/api/admin/invitations/${invitationId}/preview`
      : `/api/platform/invitations/${invitationId}/preview`
    : "";

  const publishEndpoint = isPlatformMode
    ? isSuperMode
      ? `/api/admin/invitations/${invitationId}/publish`
      : `/api/platform/invitations/${invitationId}/publish`
    : "";
  const statusEndpoint = isPlatformMode
    ? isSuperMode
      ? `/api/admin/invitations/${invitationId}/status`
      : `/api/platform/invitations/${invitationId}/status`
    : "";
  const isReadOnly = isPlatformMode && invitationMeta?.status === "archived" && !isSuperMode;
  const sectionTabs = useMemo<SectionTab[]>(
    () => [
      { id: "section-basic", label: "기본 설정" },
      { id: "section-share", label: "공유 문구" },
      { id: "section-hero", label: "히어로" },
      { id: "section-guide", label: "안내 문구" },
      { id: "section-location", label: "오시는 길" },
      { id: "section-images", label: "섹션 이미지" },
      { id: "section-gallery", label: "갤러리" },
      { id: "section-account", label: "계좌번호" },
      ...(!isPlatformMode ? [{ id: "section-backup", label: "백업/복구" }] : []),
    ],
    [isPlatformMode],
  );

  const loadBackups = async (currentKey: string) => {
    const res = await fetch("/api/admin/backups", {
      headers: currentKey !== "" ? { "x-admin-key": currentKey } : {},
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = (await res.json()) as { backups: string[] };
    setBackups(data.backups);
  };

  const loadInvitationMeta = useCallback(async () => {
    if (!isPlatformMode || !invitationId || !metaEndpoint) return;
    const res = await fetch(metaEndpoint, {
      cache: "no-store",
      headers: getAdminHeaders(),
    });
    if (!res.ok) return;
    const data = (await res.json()) as InvitationMeta;
    setInvitationMeta(data);
    if (data.public_id) {
      const baseUrl = window.location.origin;
      setPublicUrl(`${baseUrl}/invitation/${data.public_id}`);
    }
  }, [invitationId, isPlatformMode, metaEndpoint, getAdminHeaders]);

  useEffect(() => {
    if (isPlatformMode && !isSuperMode) {
      setIsAuthenticated(true);
      return;
    }

    const cachedPin = window.sessionStorage.getItem("adminPin") || "";
    if (/^\d{6}$/.test(cachedPin)) {
      setActiveAdminKey(cachedPin);
      setIsAuthenticated(true);
    }
  }, [isPlatformMode, isSuperMode]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(contentEndpoint, {
          cache: "no-store",
          headers: getAdminHeaders(),
        });
        if (!res.ok) {
          setMessage(isPlatformMode ? "초대장 접근 권한이 없습니다." : "로그인 정보가 올바르지 않습니다.");
          if (!isPlatformMode) {
            setIsAuthenticated(false);
            window.sessionStorage.removeItem("adminPin");
          }
          setLoading(false);
          return;
        }
        const data = (await res.json()) as WeddingContent;
        setContent(withFixedMapLinks(data));
        if (!isPlatformMode) {
          await loadBackups(activeAdminKey);
        } else {
          await loadInvitationMeta();
        }
        setLoading(false);
      } catch {
        setMessage("관리자 데이터를 불러오지 못했습니다.");
        setLoading(false);
      }
    };
    run();
  }, [
    activeAdminKey,
    contentEndpoint,
    getAdminHeaders,
    isAuthenticated,
    isPlatformMode,
    invitationId,
    loadInvitationMeta,
  ]);

  const ready = useMemo(() => content !== null, [content]);

  const update = (fn: (prev: WeddingContent) => WeddingContent) => {
    setContent((prev) => {
      if (!prev) return prev;
      return fn(prev);
    });
  };

  const uploadFile = async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch(uploadEndpoint, {
      method: "POST",
      headers: getAdminHeaders(),
      body: formData,
    });

    if (!res.ok) {
      throw new Error("업로드 실패");
    }

    const data = (await res.json()) as { src: string };
    return data.src;
  };

  const handleSave = async (nextContent?: WeddingContent): Promise<boolean> => {
    if (isReadOnly) {
      setMessage("만료된 초대장은 수정할 수 없습니다. 상단에서 다시 활성화해 주세요.");
      return false;
    }

    const basePayload = nextContent ?? content;
    if (!basePayload) return false;
    const payload = withFixedMapLinks(basePayload);

    setSaving(true);
    setMessage("");
    setErrors([]);
    try {
      const res = await fetch(contentEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAdminHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = (await res.json()) as {
          message?: string;
          errors?: string[];
        };
        setErrors(errorData.errors || []);
        throw new Error(errorData.message || "저장 실패");
      }
      const saved = (await res.json()) as WeddingContent;
      setContent(withFixedMapLinks(saved));
      setMessage("저장 완료: 청첩장에 바로 반영됩니다.");
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 1800);
      if (!isPlatformMode) {
        await loadBackups(activeAdminKey);
      }
      return true;
    } catch (error) {
      const failMessage =
        error instanceof Error && error.message !== ""
          ? error.message
          : "저장 실패: 다시 시도해 주세요.";
      setMessage(failMessage);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    const resetContent = withFixedMapLinks(createBlankWeddingContent());
    setContent(resetContent);
    const saved = await handleSave(resetContent);
    if (saved) {
      setMessage("초기화 완료: 기본 샘플 데이터로 되돌렸습니다.");
    }
  };

  const moveItem = <T,>(arr: T[], index: number, direction: "up" | "down") => {
    const next = [...arr];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return next;
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  };

  const handleLogin = () => {
    setMessage("");
    setErrors([]);

    if (loginId.trim() !== ADMIN_LOGIN_ID) {
      setMessage(`아이디는 ${ADMIN_LOGIN_ID}만 사용할 수 있습니다.`);
      return;
    }
    if (!/^\d{6}$/.test(loginPassword)) {
      setMessage("비밀번호는 6자리 숫자여야 합니다.");
      return;
    }
    if (loginPassword !== ADMIN_LOGIN_PASSWORD) {
      setMessage("비밀번호가 올바르지 않습니다.");
      return;
    }

    setActiveAdminKey(loginPassword);
    window.sessionStorage.setItem("adminPin", loginPassword);
    setIsAuthenticated(true);
  };

  const handleRestoreBackup = async (name: string) => {
    setMessage("");
    setErrors([]);
    try {
      const res = await fetch(`/api/admin/backups/${name}/restore`, {
        method: "POST",
        headers: getAdminHeaders(),
      });
      if (!res.ok) {
        const data = (await res.json()) as { message?: string; errors?: string[] };
        setErrors(data.errors || []);
        throw new Error(data.message || "복원 실패");
      }
      const restored = (await res.json()) as WeddingContent;
      setContent(restored);
      setMessage(`복원 완료: ${name}`);
      await loadBackups(activeAdminKey);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "복원 실패");
    }
  };

  const handleCreatePreview = async () => {
    if (isReadOnly) return;
    if (!isPlatformMode || !invitationId || !previewEndpoint) return;
    setMessage("");
    const saved = await handleSave();
    if (!saved) return;

    const res = await fetch(previewEndpoint, {
      method: "POST",
      headers: getAdminHeaders(),
    });
    if (!res.ok) {
      setMessage("미리보기 링크 생성에 실패했습니다.");
      return;
    }

    const data = (await res.json()) as { previewUrl: string };
    setPreviewUrl(data.previewUrl);
    window.open(data.previewUrl, "_blank", "noopener,noreferrer");
  };

  const handlePublish = async () => {
    if (isReadOnly) return;
    if (!isPlatformMode || !invitationId || !publishEndpoint) return;
    setMessage("");
    const saved = await handleSave();
    if (!saved) return;

    const res = await fetch(publishEndpoint, {
      method: "POST",
      headers: getAdminHeaders(),
    });
    if (!res.ok) {
      setMessage("청첩장 내보내기에 실패했습니다.");
      return;
    }

    const data = (await res.json()) as { url: string };
    setPublicUrl(data.url);
    setMessage("내보내기 완료: 공개 링크가 생성되었습니다.");
    window.open(data.url, "_blank", "noopener,noreferrer");
    await loadInvitationMeta();
  };

  const handleOpenInvitation = async () => {
    if (isReadOnly) return;
    setMessage("");
    const saved = await handleSave();
    if (!saved) return;

    if (!isPlatformMode) {
      window.open("/", "_blank", "noopener,noreferrer");
      return;
    }

    const knownPublicId = invitationMeta?.public_id;
    if (knownPublicId && knownPublicId !== "") {
      const url = `${window.location.origin}/invitation/${knownPublicId}`;
      setPublicUrl(url);
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    if (!invitationId || !previewEndpoint) return;

    const res = await fetch(previewEndpoint, {
      method: "POST",
      headers: getAdminHeaders(),
    });
    if (!res.ok) {
      setMessage("청첩장 보기 링크 생성에 실패했습니다.");
      return;
    }
    const data = (await res.json()) as { previewUrl: string };
    setPreviewUrl(data.previewUrl);
    window.open(data.previewUrl, "_blank", "noopener,noreferrer");
  };

  const handleReactivateInvitation = async () => {
    if (!isPlatformMode || !statusEndpoint) return;
    setReactivating(true);
    setMessage("");
    try {
      const res = await fetch(statusEndpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAdminHeaders() },
        body: JSON.stringify({ action: "restore" }),
      });
      if (!res.ok) {
        setMessage("청첩장 재활성화에 실패했습니다.");
        return;
      }
      await loadInvitationMeta();
      setMessage("청첩장이 다시 활성화되었습니다.");
    } finally {
      setReactivating(false);
    }
  };

  const handleHeaderLogout = async () => {
    if (isPlatformMode && !isSuperMode) {
      try {
        const supabase = createSupabaseClient();
        await supabase.auth.signOut();
      } catch {
        // no-op
      }
      window.location.href = "/auth/login";
      return;
    }

    setIsAuthenticated(false);
    setContent(null);
    setLoginPassword("");
    setActiveAdminKey("");
    window.sessionStorage.removeItem("adminPin");
  };

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  };

  useEffect(() => {
    if (!isAuthenticated || !isPlatformMode || isSuperMode) {
      setProfileName(isSuperMode ? "슈퍼관리자" : "관리자");
      setProfileEmail("");
      return;
    }

    const loadUser = async () => {
      try {
        const supabase = createSupabaseClient();
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (!user) return;
        setProfileName(user.user_metadata?.name || user.email || "내 계정");
        setProfileEmail(user.email || "");
      } catch {
        setProfileName("내 계정");
      }
    };

    void loadUser();
  }, [isAuthenticated, isPlatformMode, isSuperMode]);

  useEffect(() => {
    if (!ready) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-120px 0px -65% 0px", threshold: 0.1 },
    );

    sectionTabs.forEach((tab) => {
      const el = document.getElementById(tab.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ready, sectionTabs]);

  const invitationTitle = resolveInvitationTitle(content);

  if (!isAuthenticated && (!isPlatformMode || isSuperMode)) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="mx-auto max-w-3xl space-y-4 rounded-xl border border-gray-200 bg-white p-5 md:p-6">
          <h1 className="text-2xl font-bold text-gray-900">내 초대장</h1>
          <p className="text-sm text-gray-600">로그인 후 관리자 페이지에 진입할 수 있습니다.</p>
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <TextInput
              placeholder="아이디"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
            />
            <TextInput
              type="password"
              placeholder="6자리 숫자 비밀번호 (123456)"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />
          </div>
          <button
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
            onClick={handleLogin}
          >
            관리자 페이지 진입
          </button>
          {message && <p className="text-sm text-red-600">{message}</p>}
        </div>
      </main>
    );
  }

  if (!ready || !content) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="mx-auto max-w-3xl space-y-4 rounded-xl border border-gray-200 bg-white p-5 md:p-6">
          <h1 className="text-2xl font-bold text-gray-900">내 초대장</h1>
          <p className="text-sm text-gray-600">
            {loading ? "관리자 데이터 불러오는 중..." : "데이터를 불러오지 못했습니다."}
          </p>
          <button
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
            onClick={() => {
              setIsAuthenticated(false);
              setLoginPassword("");
              setMessage("");
            }}
          >
            다시 시도
          </button>
          {message && <p className="text-sm text-gray-700">{message}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f4f6]">
      <EditorHeader
        name={profileName}
        email={profileEmail}
        onLogout={handleHeaderLogout}
      />

      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 overflow-x-auto px-4 py-3 md:px-6">
          {sectionTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => scrollToSection(tab.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition ${
                activeSection === tab.id
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 pb-28 md:px-6 md:py-8 md:pb-32">
        <header className="rounded-xl border border-gray-200 bg-white p-5 md:p-6">
          <h1 className="text-2xl font-bold text-gray-900">{invitationTitle}</h1>
          <p className="mt-2 text-sm text-gray-600">
            이 페이지에서 콘텐츠를 수정하고 저장하면 메인 청첩장에 반영됩니다.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                void handleSave();
              }}
              disabled={saving || isReadOnly}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "저장 중..." : "전체 저장"}
            </button>
            {isPlatformMode && (
              <>
                <button
                  onClick={handleCreatePreview}
                  disabled={saving || isReadOnly}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                >
                  청첩장 미리보기
                </button>
                <button
                  onClick={handlePublish}
                  disabled={saving || isReadOnly}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                >
                  청첩장 내보내기
                </button>
                {isReadOnly && (
                  <button
                    onClick={handleReactivateInvitation}
                    disabled={reactivating}
                    className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {reactivating ? "재활성화 중..." : "청첩장 다시 활성화"}
                  </button>
                )}
              </>
            )}
            <button
              onClick={handleOpenInvitation}
              disabled={saving || isReadOnly}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
            >
              청첩장 보기
            </button>
            <button
              onClick={handleResetToDefault}
              disabled={saving || isReadOnly}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
            >
              초기화
            </button>
            {message && <span className="self-center text-sm text-gray-700">{message}</span>}
          </div>
          {isPlatformMode && (
            <div className="mt-3 space-y-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700">
              <p>
                상태: {invitationMeta?.status || "draft"}{" "}
                {invitationMeta?.published_at
                  ? `(내보내기: ${new Date(invitationMeta.published_at).toLocaleString()})`
                  : ""}
              </p>
              {isReadOnly && (
                <p className="font-medium text-red-600">
                  만료된 초대장입니다. 입력 필드는 비활성화되어 있으며 재활성화 후 수정할 수 있습니다.
                </p>
              )}
              {previewUrl && (
                <p className="break-all">
                  미리보기 링크:{" "}
                  <a className="text-blue-600 underline" href={previewUrl} target="_blank" rel="noreferrer">
                    {previewUrl}
                  </a>
                </p>
              )}
              {publicUrl && (
                <p className="break-all">
                  공개 링크:{" "}
                  <a className="text-blue-600 underline" href={publicUrl} target="_blank" rel="noreferrer">
                    {publicUrl}
                  </a>
                </p>
              )}
            </div>
          )}
          {errors.length > 0 && (
            <ul className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.map((error, index) => (
                <li key={`${error}-${index}`}>- {error}</li>
              ))}
            </ul>
          )}
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
          <fieldset disabled={isReadOnly} className="space-y-5 disabled:opacity-70">
        {!isPlatformMode && (
          <Section id="section-backup" title="백업/복구">
            <p className="text-sm text-gray-600">
              저장 시 자동 백업됩니다. 백업 선택 시 현재 데이터 위에 복원됩니다.
            </p>
            <div className="space-y-2">
              {backups.length === 0 && (
                <p className="text-sm text-gray-500">백업 파일이 없습니다.</p>
              )}
              {backups.map((backup) => (
                <div
                  key={backup}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
                >
                  <span className="text-sm text-gray-700">{backup}</span>
                  <button
                    className="rounded border border-gray-300 px-2 py-1 text-xs"
                    onClick={() => handleRestoreBackup(backup)}
                  >
                    복원
                  </button>
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section id="section-basic" title="신랑/신부 이름 및 날짜">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="신랑 이름">
              <TextInput
                value={content.couple.groomName}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    couple: { ...prev.couple, groomName: e.target.value },
                  }))
                }
              />
            </Field>
            <Field label="신부 이름">
              <TextInput
                value={content.couple.brideName}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    couple: { ...prev.couple, brideName: e.target.value },
                  }))
                }
              />
            </Field>
          </div>
          <Field label="표시 이름(헤더/푸터)">
            <TextInput
              value={content.couple.displayName}
              onChange={(e) =>
                update((prev) => ({
                  ...prev,
                  couple: { ...prev.couple, displayName: e.target.value },
                }))
              }
            />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="날짜 문구 (소개 영역)">
              <TextInput
                value={content.wedding.dateLabel}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    wedding: { ...prev.wedding, dateLabel: e.target.value },
                  }))
                }
              />
            </Field>
            <Field label="헤더 문구 (상단 고정)">
              <TextInput
                value={content.wedding.headerLabel}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    wedding: { ...prev.wedding, headerLabel: e.target.value },
                  }))
                }
              />
            </Field>
          </div>
        </Section>

        <Section id="section-share" title="공유 문구">
          <Field label="카카오 공유 타이틀">
            <TextInput
              value={content.share.kakaoTitle}
              onChange={(e) =>
                update((prev) => ({
                  ...prev,
                  share: { ...prev.share, kakaoTitle: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="카카오 공유 설명(날짜/장소)">
            <TextArea
              rows={3}
              value={content.share.kakaoDescription}
              onChange={(e) =>
                update((prev) => ({
                  ...prev,
                  share: { ...prev.share, kakaoDescription: e.target.value },
                }))
              }
            />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="공유 이미지 URL/경로">
              <TextInput
                value={content.share.imageUrl}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    share: { ...prev.share, imageUrl: e.target.value },
                  }))
                }
              />
            </Field>
            <Field label="공유 버튼 문구">
              <TextInput
                value={content.share.buttonTitle}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    share: { ...prev.share, buttonTitle: e.target.value },
                  }))
                }
              />
            </Field>
          </div>
        </Section>

        <Section title="푸터 문구">
          <Field label="푸터 태그라인">
            <TextInput
              value={content.footer.tagline}
              onChange={(e) =>
                update((prev) => ({
                  ...prev,
                  footer: { ...prev.footer, tagline: e.target.value },
                }))
              }
            />
          </Field>
        </Section>

        <Section id="section-hero" title="히어로 비디오/이미지">
          <Field label="타입">
            <select
              value={content.heroMedia.type}
              onChange={(e) =>
                update((prev) => ({
                  ...prev,
                  heroMedia: {
                    ...prev.heroMedia,
                    type: e.target.value as "video" | "image",
                  },
                }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="video">비디오</option>
              <option value="image">이미지</option>
            </select>
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="모바일 소스 경로">
              <TextInput
                value={content.heroMedia.mobileSrc}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    heroMedia: { ...prev.heroMedia, mobileSrc: e.target.value },
                  }))
                }
              />
              <input
                type="file"
                accept="image/*,video/*"
                className="mt-2 block w-full text-xs"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const src = await uploadFile(file, "hero");
                  update((prev) => ({
                    ...prev,
                    heroMedia: { ...prev.heroMedia, mobileSrc: src },
                  }));
                }}
              />
            </Field>
            <Field label="데스크톱 소스 경로">
              <TextInput
                value={content.heroMedia.desktopSrc}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    heroMedia: { ...prev.heroMedia, desktopSrc: e.target.value },
                  }))
                }
              />
              <input
                type="file"
                accept="image/*,video/*"
                className="mt-2 block w-full text-xs"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const src = await uploadFile(file, "hero");
                  update((prev) => ({
                    ...prev,
                    heroMedia: { ...prev.heroMedia, desktopSrc: src },
                  }));
                }}
              />
            </Field>
          </div>
          <Field label="포스터 이미지(비디오일 때)">
            <TextInput
              value={content.heroMedia.poster}
              onChange={(e) =>
                update((prev) => ({
                  ...prev,
                  heroMedia: { ...prev.heroMedia, poster: e.target.value },
                }))
              }
            />
          </Field>
        </Section>

        <Section id="section-guide" title="안내문구(타이틀/설명)">
          <Field label="히어로 타이틀">
            <TextArea
              rows={3}
              value={content.heroSection.title}
              onChange={(e) =>
                update((prev) => ({
                  ...prev,
                  heroSection: { ...prev.heroSection, title: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="소개 타이틀">
            <TextArea
              rows={6}
              value={content.introSection.title}
              onChange={(e) =>
                update((prev) => ({
                  ...prev,
                  introSection: { ...prev.introSection, title: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="소개 설명">
            <TextArea
              rows={6}
              value={content.introSection.description}
              onChange={(e) =>
                update((prev) => ({
                  ...prev,
                  introSection: { ...prev.introSection, description: e.target.value },
                }))
              }
            />
          </Field>
        </Section>

        <Section id="section-location" title="장소/오시는 길">
          <Field label="장소명">
            <TextInput
              value={content.detailsSection.venueName}
              onChange={(e) =>
                update((prev) => ({
                  ...prev,
                  detailsSection: { ...prev.detailsSection, venueName: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="장소 설명">
            <TextArea
              rows={4}
              value={content.detailsSection.venueDescription}
              onChange={(e) =>
                update((prev) => ({
                  ...prev,
                  detailsSection: {
                    ...prev.detailsSection,
                    venueDescription: e.target.value,
                  },
                }))
              }
            />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="주소">
              <TextInput
                value={content.detailsSection.address}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    detailsSection: { ...prev.detailsSection, address: e.target.value },
                  }))
                }
              />
            </Field>
            <Field label="역/거리 문구">
              <TextInput
                value={content.detailsSection.stationDescription}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    detailsSection: {
                      ...prev.detailsSection,
                      stationDescription: e.target.value,
                    },
                  }))
                }
              />
            </Field>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">지도 링크</p>
            {FIXED_MAP_LINKS.map((preset, index) => {
              const item = content.detailsSection.mapLinks[index] || {
                name: preset.name,
                icon: preset.icon,
                url: "",
              };
              return (
              <div key={`map-${index}`} className="rounded-lg border border-gray-200 p-3 space-y-2">
                <div className="grid gap-2 md:grid-cols-[180px_1fr]">
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preset.icon} alt={preset.name} className="h-5 w-5 rounded object-cover" />
                    <span>{preset.name}</span>
                  </div>
                  <TextInput
                    placeholder="링크 URL"
                    value={item.url}
                    onChange={(e) =>
                      update((prev) => {
                        const next = FIXED_MAP_LINKS.map((fixed, i) => ({
                          name: fixed.name,
                          icon: fixed.icon,
                          url: prev.detailsSection.mapLinks[i]?.url || "",
                        }));
                        next[index] = { ...next[index], url: e.target.value };
                        return {
                          ...prev,
                          detailsSection: { ...prev.detailsSection, mapLinks: next },
                        };
                      })
                    }
                  />
                </div>
              </div>
            );
            })}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">상세 안내 섹션</p>
            {content.detailsSection.items.map((item, index) => (
              <div key={`detail-${index}`} className="rounded-lg border border-gray-200 p-3 space-y-2">
                <TextInput
                  placeholder="타이틀"
                  value={item.title}
                  onChange={(e) =>
                    update((prev) => {
                      const next = [...prev.detailsSection.items];
                      next[index] = { ...next[index], title: e.target.value };
                      return {
                        ...prev,
                        detailsSection: { ...prev.detailsSection, items: next },
                      };
                    })
                  }
                />
                <TextArea
                  rows={3}
                  placeholder="설명"
                  value={item.description}
                  onChange={(e) =>
                    update((prev) => {
                      const next = [...prev.detailsSection.items];
                      next[index] = { ...next[index], description: e.target.value };
                      return {
                        ...prev,
                        detailsSection: { ...prev.detailsSection, items: next },
                      };
                    })
                  }
                />
                <button
                  className="text-xs text-red-600"
                  onClick={() =>
                    update((prev) => ({
                      ...prev,
                      detailsSection: {
                        ...prev.detailsSection,
                        items: prev.detailsSection.items.filter((_, i) => i !== index),
                      },
                    }))
                  }
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              onClick={() =>
                update((prev) => ({
                  ...prev,
                  detailsSection: {
                    ...prev.detailsSection,
                    items: [...prev.detailsSection.items, { title: "", description: "" } as DetailItem],
                  },
                }))
              }
            >
              안내 섹션 추가
            </button>
          </div>
        </Section>

        <Section id="section-images" title="각 섹션 이미지(추가/삭제/변경)">
          <Field label="소개 섹션 이미지">
            <ImagePreview
              src={content.introSection.image.src}
              alt={content.introSection.image.alt}
            />
            <input
              type="file"
              accept="image/*"
              className="mt-3 block w-full text-xs"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const src = await uploadFile(file, "intro");
                update((prev) => ({
                  ...prev,
                  introSection: {
                    ...prev.introSection,
                    image: { ...prev.introSection.image, src },
                  },
                }));
              }}
            />
            <button
              className="mt-2 rounded border border-red-200 px-2 py-1 text-xs text-red-600"
              onClick={() =>
                update((prev) => ({
                  ...prev,
                  introSection: {
                    ...prev.introSection,
                    image: { ...prev.introSection.image, src: PLACEHOLDER_SRC },
                  },
                }))
              }
            >
              파일 삭제
            </button>
          </Field>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">히어로 캐러셀 이미지</p>
            {content.heroSection.images.map((img, index) => (
              <div key={`hero-${index}`} className="rounded-lg border border-gray-200 p-3 space-y-2">
                <ImagePreview src={img.src} alt={img.alt} />
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-xs"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const src = await uploadFile(file, "hero-gallery");
                    update((prev) => {
                      const next = [...prev.heroSection.images];
                      next[index] = { ...next[index], src };
                      return {
                        ...prev,
                        heroSection: { ...prev.heroSection, images: next },
                      };
                    });
                  }}
                />
                <div className="flex gap-2 text-xs">
                  <button
                    className="rounded border border-red-200 px-2 py-1 text-red-600"
                    onClick={() =>
                      update((prev) => {
                        const next = [...prev.heroSection.images];
                        next[index] = { ...next[index], src: PLACEHOLDER_SRC };
                        return {
                          ...prev,
                          heroSection: { ...prev.heroSection, images: next },
                        };
                      })
                    }
                  >
                    파일 삭제
                  </button>
                  <button
                    className="rounded border border-gray-300 px-2 py-1"
                    onClick={() =>
                      update((prev) => ({
                        ...prev,
                        heroSection: {
                          ...prev.heroSection,
                          images: moveItem(prev.heroSection.images, index, "up"),
                        },
                      }))
                    }
                  >
                    위로
                  </button>
                  <button
                    className="rounded border border-gray-300 px-2 py-1"
                    onClick={() =>
                      update((prev) => ({
                        ...prev,
                        heroSection: {
                          ...prev.heroSection,
                          images: moveItem(prev.heroSection.images, index, "down"),
                        },
                      }))
                    }
                  >
                    아래로
                  </button>
                  <button
                    className="rounded border border-red-200 px-2 py-1 text-red-600"
                    onClick={() =>
                      update((prev) => ({
                        ...prev,
                        heroSection: {
                          ...prev.heroSection,
                          images: prev.heroSection.images.filter((_, i) => i !== index),
                        },
                      }))
                    }
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
            <button
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              onClick={() =>
                update((prev) => ({
                  ...prev,
                  heroSection: {
                    ...prev.heroSection,
                    images: [...prev.heroSection.images, { src: PLACEHOLDER_SRC, alt: "" } as ImageItem],
                  },
                }))
              }
            >
              히어로 이미지 추가
            </button>
          </div>
        </Section>

        <Section id="section-gallery" title="갤러리 (추가/삭제/순서변경/변경)">
          <div className="space-y-2">
            <Field label="갤러리 타이틀">
              <TextInput
                value={content.gallerySection.title}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    gallerySection: { ...prev.gallerySection, title: e.target.value },
                  }))
                }
              />
            </Field>
            <Field label="갤러리 버튼 문구">
              <TextInput
                value={content.gallerySection.moreLabel}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    gallerySection: { ...prev.gallerySection, moreLabel: e.target.value },
                  }))
                }
              />
            </Field>
          </div>

          {content.gallerySection.images.map((img, index) => (
            <div key={`gallery-${index}`} className="rounded-lg border border-gray-200 p-3 space-y-2">
              <ImagePreview src={img.src} alt={img.alt} />
              <input
                type="file"
                accept="image/*"
                className="block w-full text-xs"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const src = await uploadFile(file, "gallery");
                  update((prev) => {
                    const next = [...prev.gallerySection.images];
                    next[index] = { ...next[index], src };
                    return {
                      ...prev,
                      gallerySection: { ...prev.gallerySection, images: next },
                    };
                  });
                }}
              />
              <div className="flex gap-2 text-xs">
                <button
                  className="rounded border border-red-200 px-2 py-1 text-red-600"
                  onClick={() =>
                    update((prev) => {
                      const next = [...prev.gallerySection.images];
                      next[index] = { ...next[index], src: PLACEHOLDER_SRC };
                      return {
                        ...prev,
                        gallerySection: { ...prev.gallerySection, images: next },
                      };
                    })
                  }
                >
                  파일 삭제
                </button>
                <button
                  className="rounded border border-gray-300 px-2 py-1"
                  onClick={() =>
                    update((prev) => ({
                      ...prev,
                      gallerySection: {
                        ...prev.gallerySection,
                        images: moveItem(prev.gallerySection.images, index, "up"),
                      },
                    }))
                  }
                >
                  위로
                </button>
                <button
                  className="rounded border border-gray-300 px-2 py-1"
                  onClick={() =>
                    update((prev) => ({
                      ...prev,
                      gallerySection: {
                        ...prev.gallerySection,
                        images: moveItem(prev.gallerySection.images, index, "down"),
                      },
                    }))
                  }
                >
                  아래로
                </button>
                <button
                  className="rounded border border-red-200 px-2 py-1 text-red-600"
                  onClick={() =>
                    update((prev) => ({
                      ...prev,
                      gallerySection: {
                        ...prev.gallerySection,
                        images: prev.gallerySection.images.filter((_, i) => i !== index),
                      },
                    }))
                  }
                >
                  삭제
                </button>
              </div>
            </div>
          ))}

          <button
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            onClick={() =>
              update((prev) => ({
                ...prev,
                gallerySection: {
                  ...prev.gallerySection,
                  images: [
                    ...prev.gallerySection.images,
                    { src: PLACEHOLDER_SRC, alt: "", title: "", aspect: "aspect-[2/3]" } as GalleryImageItem,
                  ],
                },
              }))
            }
          >
            갤러리 이미지 추가
          </button>
        </Section>

        <Section id="section-account" title="계좌번호 (입력/수정/삭제)">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="섹션 타이틀">
              <TextInput
                value={content.accountSection.title}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    accountSection: { ...prev.accountSection, title: e.target.value },
                  }))
                }
              />
            </Field>
            <Field label="신랑측 제목">
              <TextInput
                value={content.accountSection.groomTitle}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    accountSection: { ...prev.accountSection, groomTitle: e.target.value },
                  }))
                }
              />
            </Field>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="신부측 제목">
              <TextInput
                value={content.accountSection.brideTitle}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    accountSection: { ...prev.accountSection, brideTitle: e.target.value },
                  }))
                }
              />
            </Field>
            <div />
          </div>

          <Field label="설명(첫줄)">
            <TextArea
              rows={2}
              value={content.accountSection.descriptionTop}
              onChange={(e) =>
                update((prev) => ({
                  ...prev,
                  accountSection: {
                    ...prev.accountSection,
                    descriptionTop: e.target.value,
                  },
                }))
              }
            />
          </Field>
          <Field label="설명(둘째줄)">
            <TextArea
              rows={2}
              value={content.accountSection.descriptionBottom}
              onChange={(e) =>
                update((prev) => ({
                  ...prev,
                  accountSection: {
                    ...prev.accountSection,
                    descriptionBottom: e.target.value,
                  },
                }))
              }
            />
          </Field>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">신랑측 계좌</p>
            {content.accountSection.groomAccounts.map((item, index) => (
              <AccountEditor
                key={`groom-account-${index}`}
                item={item}
                onChange={(nextItem) =>
                  update((prev) => {
                    const next = [...prev.accountSection.groomAccounts];
                    next[index] = nextItem;
                    return {
                      ...prev,
                      accountSection: { ...prev.accountSection, groomAccounts: next },
                    };
                  })
                }
                onDelete={() =>
                  update((prev) => ({
                    ...prev,
                    accountSection: {
                      ...prev.accountSection,
                      groomAccounts: prev.accountSection.groomAccounts.filter(
                        (_, i) => i !== index,
                      ),
                    },
                  }))
                }
              />
            ))}
            <button
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              onClick={() =>
                update((prev) => ({
                  ...prev,
                  accountSection: {
                    ...prev.accountSection,
                    groomAccounts: [
                      ...prev.accountSection.groomAccounts,
                      { name: "", account: "", bank: "", holder: "" } as AccountInfo,
                    ],
                  },
                }))
              }
            >
              신랑측 계좌 추가
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">신부측 계좌</p>
            {content.accountSection.brideAccounts.map((item, index) => (
              <AccountEditor
                key={`bride-account-${index}`}
                item={item}
                onChange={(nextItem) =>
                  update((prev) => {
                    const next = [...prev.accountSection.brideAccounts];
                    next[index] = nextItem;
                    return {
                      ...prev,
                      accountSection: { ...prev.accountSection, brideAccounts: next },
                    };
                  })
                }
                onDelete={() =>
                  update((prev) => ({
                    ...prev,
                    accountSection: {
                      ...prev.accountSection,
                      brideAccounts: prev.accountSection.brideAccounts.filter(
                        (_, i) => i !== index,
                      ),
                    },
                  }))
                }
              />
            ))}
            <button
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              onClick={() =>
                update((prev) => ({
                  ...prev,
                  accountSection: {
                    ...prev.accountSection,
                    brideAccounts: [
                      ...prev.accountSection.brideAccounts,
                      { name: "", account: "", bank: "", holder: "" } as AccountInfo,
                    ],
                  },
                }))
              }
            >
              신부측 계좌 추가
            </button>
          </div>
        </Section>
          </fieldset>

          <aside className="hidden xl:block">
            <div className="sticky top-4 rounded-xl border border-gray-200 bg-white p-4">
              <p className="mb-3 text-sm font-medium text-gray-700">모바일 실시간 미리보기</p>
              <MobileLivePreview content={content} />
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <span className="text-sm text-gray-600">변경사항을 저장해 주세요.</span>
          <button
            onClick={() => {
              void handleSave();
            }}
            disabled={saving || isReadOnly}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "저장 중..." : "전체 저장하기"}
          </button>
        </div>
      </div>

      <div
        className={`pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 transform transition-all duration-300 ${
          showSavedToast ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        <div className="rounded-[300px] bg-black px-6 py-3 text-sm font-medium text-white shadow-lg">
          저장이 완료되었어요!
        </div>
      </div>
    </main>
  );
}

function MobileLivePreview({ content }: { content: WeddingContent }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [frameLoaded, setFrameLoaded] = useState(false);

  const postPreviewContent = useCallback(() => {
    const frameWindow = iframeRef.current?.contentWindow;
    if (!frameWindow) return;
    frameWindow.postMessage(
      { type: "mariecard-live-preview", content },
      window.location.origin,
    );
  }, [content]);

  useEffect(() => {
    if (!frameLoaded) return;

    const delays = [0, 120, 320, 700];
    const timers = delays.map((delay) =>
      window.setTimeout(() => {
        postPreviewContent();
      }, delay),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [content, frameLoaded, postPreviewContent]);

  const previewFrameStyle = useMemo(
    () =>
      ({
        width: "min(100%, 393px, calc((100dvh - 180px) * 393 / 852))",
        aspectRatio: "393 / 852",
      }) as const,
    [],
  );

  return (
    <div
      className="mx-auto overflow-hidden rounded-[34px] border-[8px] border-gray-900 bg-white shadow-xl"
      style={previewFrameStyle}
    >
      <iframe
        ref={iframeRef}
        title="모바일 실시간 미리보기"
        src="/live-preview"
        className="h-full w-full border-0 bg-white"
        onLoad={() => {
          setFrameLoaded(true);
          postPreviewContent();
        }}
      />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-50 p-4 md:p-8" />}>
      <AdminPageContent />
    </Suspense>
  );
}

function AccountEditor({
  item,
  onChange,
  onDelete,
}: {
  item: AccountInfo;
  onChange: (next: AccountInfo) => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 space-y-2">
      <div className="grid gap-2 md:grid-cols-2">
        <TextInput
          placeholder="이름(예: 신랑 아버지)"
          value={item.name}
          onChange={(e) => onChange({ ...item, name: e.target.value })}
        />
        <select
          value={item.bank}
          onChange={(e) => onChange({ ...item, bank: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
        >
          {!BANK_OPTIONS.includes(item.bank) && item.bank !== "" && (
            <option value={item.bank}>{item.bank}</option>
          )}
          <option value="">은행 선택</option>
          {BANK_OPTIONS.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <TextInput
          placeholder="계좌번호"
          value={item.account}
          onChange={(e) => onChange({ ...item, account: e.target.value })}
        />
        <TextInput
          placeholder="예금주"
          value={item.holder}
          onChange={(e) => onChange({ ...item, holder: e.target.value })}
        />
      </div>
      <button className="text-xs text-red-600" onClick={onDelete}>
        삭제
      </button>
    </div>
  );
}
