"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { createBlankWeddingContent } from "@/lib/content/blank";
import { mc } from "@/lib/mariecardStyles";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import type { AccountInfo, DetailItem, GalleryImageItem, ImageItem, WeddingContent } from "@/lib/content/types";

function Section({
  id,
  title,
  className,
  children,
}: {
  id?: string;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-40 ${className || ""}`}
    >
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
      className={`h-14 w-full rounded-lg border border-gray-300 px-4 text-base outline-none focus:border-black ${props.className || ""}`}
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

function StyledFileInput({
  accept,
  onSelect,
  disabled,
  className,
}: {
  accept: string;
  onSelect: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label
      className={`mt-2 flex w-full items-center gap-2 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${className || ""}`}
    >
      <span className={mc.secondaryButton}>파일 선택</span>
      <input
        type="file"
        accept={accept}
        disabled={disabled}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          onSelect(file);
        }}
      />
    </label>
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
const PLATFORM_DRAFT_STORAGE_KEY = "mariecard_platform_draft_v1";
const KAKAO_JS_KEY =
  process.env.NEXT_PUBLIC_KAKAO_APP_KEY || "";

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

type KakaoKeywordPlace = {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url?: string;
};

type KakaoMapsSearchApi = {
  load: (cb: () => void) => void;
  services: {
    Places: new () => {
      keywordSearch: (
        keyword: string,
        callback: (data: KakaoKeywordPlace[], status: string) => void,
      ) => void;
    };
    Status: {
      OK: string;
    };
  };
};

type KakaoMapsWindow = Window & {
  kakao?: {
    maps?: KakaoMapsSearchApi;
  };
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const idx = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** idx;
  const precision = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(precision)} ${units[idx]}`;
}

async function resolveRemoteSizeBytes(src: string): Promise<number | null> {
  if (!src) return null;
  if (src.startsWith("data:")) return null;
  try {
    if (src.startsWith("blob:")) {
      const blob = await fetch(src).then((r) => r.blob());
      return blob.size;
    }

    // Range request (0-0) to avoid downloading the whole file.
    const rangeRes = await fetch(src, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
      cache: "no-store",
    });
    const contentRange = rangeRes.headers.get("content-range");
    if (rangeRes.status === 206 && contentRange && contentRange.includes("/")) {
      const total = Number(contentRange.split("/").pop());
      if (Number.isFinite(total) && total > 0) return total;
    }

    const headRes = await fetch(src, { method: "HEAD", cache: "no-store" });
    const len = headRes.headers.get("content-length");
    const n = len ? Number(len) : NaN;
    if (Number.isFinite(n) && n > 0) return n;
  } catch {
    // ignore (CORS / network)
  }
  return null;
}

function ImagePreview({
  src,
  alt,
  meta,
  previewClassName,
}: {
  src: string;
  alt: string;
  meta?: { name?: string; sizeBytes?: number | null };
  previewClassName?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const [resolvedSize, setResolvedSize] = useState<number | null>(null);
  const sizeBytes = meta?.sizeBytes ?? resolvedSize;

  useEffect(() => {
    let cancelled = false;
    setHasError(false);
    setResolvedSize(null);
    if (!src || src.trim() === "" || src === PLACEHOLDER_SRC) return;
    if (meta?.sizeBytes != null) return;
    void (async () => {
      const size = await resolveRemoteSizeBytes(src);
      if (cancelled) return;
      setResolvedSize(size);
    })();
    return () => {
      cancelled = true;
    };
  }, [meta?.sizeBytes, src]);

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
          className={previewClassName || "h-28 w-20 rounded-md border border-gray-200 object-cover"}
          onError={() => setHasError(true)}
        />
      )}
      <div className="mt-1 text-[11px] leading-4 text-gray-500">
        <div>{sizeBytes != null ? formatBytes(sizeBytes) : "-"}</div>
      </div>
    </div>
  );
}

type SectionTab = {
  id: string;
  label: string;
};

type SectionCategory = {
  id: string;
  label: string;
  sections: SectionTab[];
};

const FIRST_SECTION_DEFAULT = {
  weddingDate: "2026년 2월 14일 토요일 오후 5시",
  weddingVenue: "서울신라호텔",
  groomSide: "홍길동 • 홍길동의 아들 민준",
  brideSide: "홍길동 • 홍길동의 딸 서연",
};

function parseFirstSectionTitle(title: string) {
  const lines = title.split("\n");
  return {
    weddingDate: (lines[0] || "").trim() || FIRST_SECTION_DEFAULT.weddingDate,
    weddingVenue: (lines[1] || "").trim() || FIRST_SECTION_DEFAULT.weddingVenue,
    groomSide: (lines[2] || "").trim() || FIRST_SECTION_DEFAULT.groomSide,
    brideSide: (lines[3] || "").trim() || FIRST_SECTION_DEFAULT.brideSide,
  };
}

function buildFirstSectionTitle(fields: {
  weddingDate: string;
  weddingVenue: string;
  groomSide: string;
  brideSide: string;
}) {
  return [
    fields.weddingDate,
    fields.weddingVenue,
    fields.groomSide,
    fields.brideSide,
  ].join("\n");
}

function EditorHeader({
  name,
  email,
  onLogout,
  center,
  actions,
}: {
  name: string;
  email: string;
  onLogout: () => Promise<void> | void;
  center?: ReactNode;
  actions?: ReactNode;
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
      <div className="flex h-16 w-full items-center gap-4 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="메뉴"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700"
          >
            <span className="sr-only">메뉴</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <a href="/" className="text-lg font-bold text-[#800532]">
            mariecard
          </a>
        </div>

        <div className="min-w-0 flex-1">
          {center ? (
            <div className="mx-auto flex w-full max-w-xl items-center justify-center">
              {center}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {actions}

          {email ? (
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
          ) : null}
        </div>
      </div>
    </header>
  );
}

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationId = searchParams.get("invitationId");
  const isCreateMode = searchParams.get("mode") === "create";
  const isPlatformMode = invitationId !== null && invitationId !== "";
  const isSuperMode = searchParams.get("super") === "1";

  const [content, setContent] = useState<WeddingContent>(() =>
    withFixedMapLinks(createBlankWeddingContent()),
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loginId, setLoginId] = useState(ADMIN_LOGIN_ID);
  const [loginPassword, setLoginPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeAdminKey, setActiveAdminKey] = useState("");
  const [backups, setBackups] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [invitationMeta, setInvitationMeta] = useState<InvitationMeta | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [reactivating, setReactivating] = useState(false);
  const [profileName, setProfileName] = useState("내 계정");
  const [profileEmail, setProfileEmail] = useState("");
  const [activeSection, setActiveSection] = useState("section-share");
  const [activeCategory, setActiveCategory] = useState("category-share");
  const [isLivePreviewVisible, setIsLivePreviewVisible] = useState(false);
  const [heroPreviewMeta, setHeroPreviewMeta] = useState<{ name: string; sizeBytes: number } | null>(null);
  const [shareOgPreviewMeta, setShareOgPreviewMeta] = useState<{ name: string; sizeBytes: number } | null>(null);
  const [shareKakaoPreviewMeta, setShareKakaoPreviewMeta] = useState<{ name: string; sizeBytes: number } | null>(null);
  const [placeSearchBusy, setPlaceSearchBusy] = useState(false);
  const [placeSearchResults, setPlaceSearchResults] = useState<KakaoKeywordPlace[]>([]);
  const placeSearchBoxRef = useRef<HTMLDivElement | null>(null);
  const suppressNextPlaceSearchRef = useRef(false);
  const placeSearchRequestSeqRef = useRef(0);
  const toastTimeoutRef = useRef<number | null>(null);

  const pushToast = useCallback((text: string) => {
    if (!text) return;
    setToastMessage(text);
    setShowSavedToast(true);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setShowSavedToast(false);
      toastTimeoutRef.current = null;
    }, 1800);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onOutsideClick = (event: MouseEvent) => {
      if (!placeSearchBoxRef.current) return;
      if (placeSearchBoxRef.current.contains(event.target as Node)) return;
      setPlaceSearchResults([]);
    };
    document.addEventListener("mousedown", onOutsideClick);
    return () => {
      document.removeEventListener("mousedown", onOutsideClick);
    };
  }, []);

  const placeSearchEndpoint = isPlatformMode
    ? isSuperMode
      ? "/api/admin/places/keyword"
      : "/api/platform/places/keyword"
    : "/api/admin/places/keyword";

  const searchByKakaoJsSdk = useCallback(async (query: string): Promise<KakaoKeywordPlace[]> => {
    if (typeof window === "undefined") return [];
    const w = window as KakaoMapsWindow;

    const ensureLoaded = async () => {
      if (w.kakao?.maps?.services) return;
      await new Promise<void>((resolve, reject) => {
        const existing = document.getElementById("kakao-maps-sdk-keyword") as HTMLScriptElement | null;
        if (existing) {
          existing.addEventListener("load", () => {
            w.kakao?.maps?.load(() => resolve());
          });
          existing.addEventListener("error", () => reject(new Error("Kakao JS SDK load failed")));
          return;
        }

        const script = document.createElement("script");
        script.id = "kakao-maps-sdk-keyword";
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services&autoload=false`;
        script.async = true;
        script.onload = () => {
          w.kakao?.maps?.load(() => resolve());
        };
        script.onerror = () => reject(new Error("Kakao JS SDK load failed"));
        document.head.appendChild(script);
      });
    };

    await ensureLoaded();
    if (!w.kakao?.maps?.services) return [];
    const maps = w.kakao.maps;

    return await new Promise<KakaoKeywordPlace[]>((resolve) => {
      const places = new maps.services.Places();
      places.keywordSearch(query, (data, status) => {
        if (status === maps.services.Status.OK && Array.isArray(data)) {
          resolve(data);
          return;
        }
        resolve([]);
      });
    });
  }, []);

  const applyPlaceResult = useCallback(
    (place: KakaoKeywordPlace) => {
      const pickedAddress = place.road_address_name || place.address_name || "";
      const queryText = (place.place_name || pickedAddress || "").trim();
      update((prev) => {
        const nextMapLinks = FIXED_MAP_LINKS.map((fixed, i) => ({
          name: fixed.name,
          icon: fixed.icon,
          url: prev.detailsSection.mapLinks[i]?.url || "",
        }));
        const kakaoUrl =
          Number.isFinite(Number(place.y)) && Number.isFinite(Number(place.x))
            ? `https://map.kakao.com/link/map/${encodeURIComponent(place.place_name || "선택한장소")},${place.y},${place.x}`
            : `https://map.kakao.com/link/search/${encodeURIComponent(queryText)}`;
        const naverUrl = `https://map.naver.com/v5/search/${encodeURIComponent(queryText)}`;
        const tmapUrl = `https://www.tmap.co.kr/tmap2/search?name=${encodeURIComponent(queryText)}`;

        nextMapLinks[0] = { ...nextMapLinks[0], url: kakaoUrl };
        nextMapLinks[1] = { ...nextMapLinks[1], url: naverUrl };
        nextMapLinks[2] = { ...nextMapLinks[2], url: tmapUrl };
        return {
          ...prev,
          detailsSection: {
            ...prev.detailsSection,
            venueName: place.place_name || prev.detailsSection.venueName,
            address: pickedAddress || prev.detailsSection.address,
            mapLinks: nextMapLinks,
          },
        };
      });
      suppressNextPlaceSearchRef.current = true;
      setPlaceSearchResults([]);
      pushToast("장소 검색 결과가 반영되었습니다.");
    },
    [pushToast],
  );

  const getAdminHeaders = useCallback((): Record<string, string> => {
    if (activeAdminKey === "") return {};
    if ((isPlatformMode || isCreateMode) && !isSuperMode) return {};
    return { "x-admin-key": activeAdminKey };
  }, [activeAdminKey, isCreateMode, isPlatformMode, isSuperMode]);

  const handleSearchPlaceByKeyword = useCallback(async () => {
    const query = content.detailsSection.venueName.trim();
    if (!query) {
      setPlaceSearchResults([]);
      return;
    }

    const requestSeq = ++placeSearchRequestSeqRef.current;
    setPlaceSearchBusy(true);
    try {
      const res = await fetch(`${placeSearchEndpoint}?q=${encodeURIComponent(query)}`, {
        cache: "no-store",
        headers: getAdminHeaders(),
      });
      if (!res.ok) {
        const errorBody = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(errorBody.message || "장소 검색에 실패했습니다.");
      }
      const data = (await res.json()) as { places?: KakaoKeywordPlace[] };
      const places = Array.isArray(data.places) ? data.places : [];
      if (requestSeq !== placeSearchRequestSeqRef.current) return;
      setPlaceSearchResults(places);
    } catch (error) {
      const serverMessage = error instanceof Error ? error.message : "장소 검색에 실패했습니다.";
      const fallbackPlaces = await searchByKakaoJsSdk(query);
      if (requestSeq !== placeSearchRequestSeqRef.current) return;
      if (fallbackPlaces.length > 0) {
        setPlaceSearchResults(fallbackPlaces);
        return;
      }
      pushToast(serverMessage);
      setPlaceSearchResults([]);
    } finally {
      if (requestSeq === placeSearchRequestSeqRef.current) {
        setPlaceSearchBusy(false);
      }
    }
  }, [
    content.detailsSection.venueName,
    getAdminHeaders,
    placeSearchEndpoint,
    pushToast,
    searchByKakaoJsSdk,
  ]);

  useEffect(() => {
    const keyword = content.detailsSection.venueName.trim();
    if (suppressNextPlaceSearchRef.current) {
      suppressNextPlaceSearchRef.current = false;
      return;
    }
    if (keyword.length < 1) {
      setPlaceSearchResults([]);
      return;
    }
    const timer = window.setTimeout(() => {
      void handleSearchPlaceByKeyword();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [content.detailsSection.venueName, handleSearchPlaceByKeyword]);

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
    : isCreateMode
      ? "/api/platform/invitations/publish"
      : "";
  const statusEndpoint = isPlatformMode
    ? isSuperMode
      ? `/api/admin/invitations/${invitationId}/status`
      : `/api/platform/invitations/${invitationId}/status`
    : "";
  const isReadOnly = isPlatformMode && invitationMeta?.status === "archived" && !isSuperMode;
  const sectionCategories = useMemo<SectionCategory[]>(
    () => [
      {
        id: "category-main",
        label: "메인",
        sections: [
          { id: "section-header", label: "헤더 영역" },
          { id: "section-hero", label: "대표이미지영역" },
          { id: "section-first", label: "첫번째영역" },
          { id: "section-carousel", label: "첫번째 캐러셀 이미지" },
          { id: "section-guide", label: "안내문구" },
          { id: "section-intro-image", label: "소개 섹션" },
        ],
      },
      {
        id: "category-gallery",
        label: "갤러리",
        sections: [{ id: "section-gallery", label: "갤러리" }],
      },
      {
        id: "category-extra",
        label: "추가글",
        sections: [
          { id: "section-location", label: "장소/오시는길" },
          { id: "section-account", label: "계좌번호" },
          { id: "section-footer", label: "푸터 영역" },
          ...(!isPlatformMode && !isCreateMode ? [{ id: "section-backup", label: "백업/복구" }] : []),
        ],
      },
      {
        id: "category-share",
        label: "공유하기",
        sections: [{ id: "section-share", label: "공유하기 문구" }],
      },
    ],
    [isCreateMode, isPlatformMode],
  );

  const sectionTabs = useMemo<SectionTab[]>(
    () => sectionCategories.flatMap((category) => category.sections),
    [sectionCategories],
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
  }, [invitationId, isPlatformMode, metaEndpoint, getAdminHeaders]);

  useEffect(() => {
    if ((isPlatformMode || isCreateMode) && !isSuperMode) {
      setIsAuthenticated(true);
      return;
    }

    const cachedPin = window.sessionStorage.getItem("adminPin") || "";
    if (/^\d{6}$/.test(cachedPin)) {
      setActiveAdminKey(cachedPin);
      setIsAuthenticated(true);
    }
  }, [isCreateMode, isPlatformMode, isSuperMode]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const run = async () => {
      if (isCreateMode && !isSuperMode && !isPlatformMode) {
        setLoading(true);
        try {
          const cachedDraft = window.localStorage.getItem(PLATFORM_DRAFT_STORAGE_KEY);
          const initial = cachedDraft ? (JSON.parse(cachedDraft) as WeddingContent) : createBlankWeddingContent();
          setContent(withFixedMapLinks(initial));
        } catch {
          setContent(withFixedMapLinks(createBlankWeddingContent()));
        } finally {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const contentPromise = fetch(contentEndpoint, {
          cache: "no-store",
          headers: getAdminHeaders(),
        });
        const metaPromise = isPlatformMode ? loadInvitationMeta() : loadBackups(activeAdminKey);
        const [res] = await Promise.all([contentPromise, metaPromise]);
        if (!res.ok) {
          pushToast(isPlatformMode ? "초대장 접근 권한이 없습니다." : "로그인 정보가 올바르지 않습니다.");
          if (!isPlatformMode) {
            setIsAuthenticated(false);
            window.sessionStorage.removeItem("adminPin");
          }
          setLoading(false);
          return;
        }
        const data = (await res.json()) as WeddingContent;
        setContent(withFixedMapLinks(data));
        setLoading(false);
      } catch {
        pushToast("관리자 데이터를 불러오지 못했습니다.");
        setLoading(false);
      }
    };
    run();
  }, [
    activeAdminKey,
    contentEndpoint,
    getAdminHeaders,
    isAuthenticated,
    isCreateMode,
    isPlatformMode,
    invitationId,
    isSuperMode,
    loadInvitationMeta,
    pushToast,
  ]);

  const update = (fn: (prev: WeddingContent) => WeddingContent) => {
    setContent((prev) => fn(prev));
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
      const body = await res.json().catch(() => ({}));
      const message = typeof body?.message === "string" ? body.message : "업로드 실패";
      throw new Error(`${message} (HTTP ${res.status})`);
    }

    const data = (await res.json()) as { src: string };
    return data.src;
  };

  const extractVideoPosterFile = async (videoFile: File): Promise<File> => {
    const videoUrl = URL.createObjectURL(videoFile);
    try {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("video metadata load failed"));
      });

      // First frame at t=0 is sometimes blank; grab a tiny offset.
      const targetTime = Math.min(0.1, Math.max(0, (video.duration || 0) - 0.1));
      video.currentTime = targetTime;

      await new Promise<void>((resolve, reject) => {
        video.onseeked = () => resolve();
        video.onerror = () => reject(new Error("video seek failed"));
      });

      const width = Math.max(1, video.videoWidth || 1);
      const height = Math.max(1, video.videoHeight || 1);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas context not available");
      ctx.drawImage(video, 0, 0, width, height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (!result) return reject(new Error("poster blob creation failed"));
            resolve(result);
          },
          "image/jpeg",
          0.9,
        );
      });

      return new File([blob], `poster-${Date.now()}.jpg`, { type: "image/jpeg" });
    } finally {
      URL.revokeObjectURL(videoUrl);
    }
  };

  const handleSave = async (nextContent?: WeddingContent): Promise<boolean> => {
    if (isReadOnly) {
      pushToast("만료된 초대장은 수정할 수 없습니다. 상단에서 다시 활성화해 주세요.");
      return false;
    }

    const basePayload = nextContent ?? content;
    if (!basePayload) return false;
    const payload = withFixedMapLinks(basePayload);

    setSaving(true);
    setMessage("");
    setErrors([]);
    try {
      if (isCreateMode && !isPlatformMode && !isSuperMode) {
        window.localStorage.setItem(PLATFORM_DRAFT_STORAGE_KEY, JSON.stringify(payload));
        setContent(payload);
        pushToast("임시저장이 완료되었습니다.");
        return true;
      }

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
      pushToast("저장 완료: 청첩장에 바로 반영됩니다.");
      if (!isPlatformMode && !isCreateMode) {
        await loadBackups(activeAdminKey);
      }
      return true;
    } catch (error) {
      const failMessage =
        error instanceof Error && error.message !== ""
          ? error.message
          : "저장 실패: 다시 시도해 주세요.";
      pushToast(failMessage);
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
      pushToast("초기화 완료: 기본 샘플 데이터로 되돌렸습니다.");
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
      pushToast(`복원 완료: ${name}`);
      await loadBackups(activeAdminKey);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "복원 실패");
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
      pushToast("미리보기 링크 생성에 실패했습니다.");
      return;
    }

    const data = (await res.json()) as { previewUrl: string };
    setPreviewUrl(data.previewUrl);
    window.open(data.previewUrl, "_blank", "noopener,noreferrer");
  };

  const handlePublish = async () => {
    if (isReadOnly) return;
    if ((!isPlatformMode && !isCreateMode) || !publishEndpoint) return;
    setMessage("");
    if (!content) return;
    const publishPayload = withFixedMapLinks(content);
    const saved = await handleSave(publishPayload);
    if (!saved) return;

    const publishBody = isCreateMode && !isPlatformMode ? JSON.stringify(publishPayload) : undefined;
    const res = await fetch(publishEndpoint, {
      method: "POST",
      headers: publishBody
        ? { "Content-Type": "application/json", ...getAdminHeaders() }
        : getAdminHeaders(),
      body: publishBody,
    });
    if (!res.ok) {
      pushToast("청첩장 내보내기에 실패했습니다.");
      return;
    }

    const data = (await res.json()) as { url: string; invitationId?: string };
    pushToast("내보내기 완료: 공개 링크가 생성되었습니다.");
    window.open(data.url, "_blank", "noopener,noreferrer");
    if (isCreateMode && data.invitationId) {
      window.localStorage.removeItem(PLATFORM_DRAFT_STORAGE_KEY);
      router.replace(`/dashboard/invitation/${data.invitationId}/admin`);
      return;
    }
    await loadInvitationMeta();
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
        pushToast("청첩장 재활성화에 실패했습니다.");
        return;
      }
      await loadInvitationMeta();
      pushToast("청첩장이 다시 활성화되었습니다.");
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
    setContent(withFixedMapLinks(createBlankWeddingContent()));
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

  const scrollToCategory = (categoryId: string) => {
    const category = sectionCategories.find((item) => item.id === categoryId);
    if (!category || category.sections.length === 0) return;
    setActiveCategory(categoryId);
    scrollToSection(category.sections[0].id);
  };

  useEffect(() => {
    if (!isAuthenticated || (!(isPlatformMode || isCreateMode)) || isSuperMode) {
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
  }, [isAuthenticated, isCreateMode, isPlatformMode, isSuperMode]);

  useEffect(() => {
    if (!isAuthenticated) return;

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
  }, [isAuthenticated, sectionTabs]);

  useEffect(() => {
    const hit = sectionCategories.find((category) =>
      category.sections.some((section) => section.id === activeSection),
    );
    if (!hit) return;
    setActiveCategory(hit.id);
  }, [activeSection, sectionCategories]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsLivePreviewVisible(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  const firstSectionFields = useMemo(
    () => parseFirstSectionTitle(content.heroSection.title || ""),
    [content.heroSection.title],
  );

  if (!isAuthenticated && (!(isPlatformMode || isCreateMode) || isSuperMode)) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="mx-auto max-w-3xl space-y-4 rounded-xl border border-gray-200 bg-white p-5 md:p-6">
          <h1 className="text-2xl font-bold text-gray-900">초대장 제작하기</h1>
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
            className={mc.primaryButton}
            onClick={handleLogin}
          >
            관리자 페이지 진입
          </button>
          {message && <p className="text-sm text-red-600">{message}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-[#f3f4f6]">
      <div className="sticky top-0 z-40 shrink-0 bg-white">
        <EditorHeader
          name={profileName}
          email={profileEmail}
          onLogout={handleHeaderLogout}
          actions={
            <div className="hidden items-center gap-2 md:flex">
                <button
                  onClick={() => {
                    void handleSave();
                  }}
                  disabled={loading || saving || isReadOnly}
                  className={mc.secondaryButton}
                >
                  {saving ? "저장 중..." : "임시저장"}
                </button>
              {(isPlatformMode || isCreateMode) && (
                <>
                  {!isLivePreviewVisible && isPlatformMode && (
                    <button
                      onClick={handleCreatePreview}
                      disabled={loading || saving || isReadOnly}
                      className={mc.secondaryButton}
                    >
                      청첩장 미리보기
                    </button>
                  )}
                  <button
                    onClick={handlePublish}
                    disabled={loading || saving || isReadOnly}
                    className={mc.primaryButton}
                  >
                    청첩장 내보내기
                  </button>
                  {isReadOnly && (
                    <button
                      onClick={handleReactivateInvitation}
                      disabled={loading || reactivating}
                      className={mc.primaryButton}
                    >
                      {reactivating ? "재활성화 중..." : "청첩장 다시 활성화"}
                    </button>
                  )}
                </>
              )}
              <button
                onClick={handleResetToDefault}
                disabled={loading || saving || isReadOnly}
                className={mc.secondaryButton}
              >
                초기화
              </button>
            </div>
          }
        />
        <div className="border-b border-gray-200 px-4 pb-0 pt-3 md:px-6">
          <div className="flex items-center gap-8 overflow-x-auto">
            {sectionCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => scrollToCategory(category.id)}
                className={`-mb-px shrink-0 border-b-[3px] pb-2 text-[17px] leading-none transition ${
                  activeCategory === category.id
                    ? "border-[#374151] font-semibold text-[#374151]"
                    : "border-transparent font-medium text-[#4b5563] hover:text-[#374151]"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2">
        <section className="min-h-0 border-b border-gray-200 bg-white lg:border-b-0 lg:border-r">
          <div className="h-full min-h-0 overflow-y-auto bg-white px-4 pb-[200px] pt-0 md:px-6 md:pb-[200px] md:pt-0">
            {(loading || errors.length > 0 || previewUrl || (isPlatformMode && isReadOnly)) && (
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
                {loading ? <p className="font-medium text-gray-800">관리자 데이터를 불러오는 중...</p> : null}
                {isPlatformMode && isReadOnly ? (
                  <p className="mt-2 font-medium text-[#800532]">
                    만료된 초대장입니다. 입력 필드는 비활성화되어 있으며 재활성화 후 수정할 수 있습니다.
                  </p>
                ) : null}
                {previewUrl ? (
                  <p className="mt-2 break-all">
                    미리보기 링크:{" "}
                    <a className="text-blue-600 underline" href={previewUrl} target="_blank" rel="noreferrer">
                      {previewUrl}
                    </a>
                  </p>
                ) : null}
                {errors.length > 0 && (
                  <ul className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errors.map((error, index) => (
                      <li key={`${error}-${index}`}>- {error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

          <fieldset disabled={loading || isReadOnly} className="mt-5 flex flex-col disabled:opacity-70">
        <h3 className="order-[16] text-left text-sm font-semibold text-gray-500">메인</h3>

        <div className="order-[65] -mx-4 my-[80px] border-t-[12px] border-gray-200 md:-mx-6" />
        <h3 className="order-[66] text-left text-sm font-semibold text-gray-500">갤러리</h3>

        <div className="order-[75] -mx-4 my-[80px] border-t-[12px] border-gray-200 md:-mx-6" />
        <h3 className="order-[76] text-left text-sm font-semibold text-gray-500">추가글</h3>

        <div className="order-[105] -mx-4 my-[80px] border-t-[12px] border-gray-200 md:-mx-6" />
        <h3 className="order-[106] text-left text-sm font-semibold text-gray-500">공유하기</h3>

        {!isPlatformMode && !isCreateMode && (
          <Section id="section-backup" title="백업/복구" className="order-[110] mt-20">
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
                    className={mc.secondaryButtonSm}
                    onClick={() => handleRestoreBackup(backup)}
                  >
                    복원
                  </button>
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section id="section-share" title="공유하기 문구" className="order-[107] mt-2">
          <Field label="제목">
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
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="기본 공유하기 이미지">
              <ImagePreview
                src={content.share.ogImageUrl || content.share.imageUrl}
                alt="share-og-preview"
                meta={shareOgPreviewMeta ?? undefined}
                previewClassName="h-24 w-40 rounded-md border border-gray-200 object-cover"
              />
              <p className="mt-2 text-xs text-gray-500">권장 사진 크기: 1000 x 630 (가로형 OG 이미지)</p>
              <StyledFileInput
                accept="image/*"
                onSelect={async (file) => {
                  if (!file) return;
                  setShareOgPreviewMeta({ name: file.name, sizeBytes: file.size });
                  const localUrl = URL.createObjectURL(file);
                  update((prev) => ({
                    ...prev,
                    share: {
                      ...prev.share,
                      ogImageUrl: localUrl,
                      imageUrl: localUrl,
                    },
                  }));
                  try {
                    const src = await uploadFile(file, "share");
                    update((prev) => ({
                      ...prev,
                      share: {
                        ...prev.share,
                        ogImageUrl: src,
                        imageUrl: src,
                      },
                    }));
                  } catch (error) {
                    pushToast(error instanceof Error ? error.message : "공유 이미지 업로드에 실패했습니다.");
                  }
                }}
              />
            </Field>

            <Field label="카카오톡 공유하기 이미지">
              <ImagePreview
                src={content.share.kakaoImageUrl || content.share.ogImageUrl || content.share.imageUrl}
                alt="share-kakao-preview"
                meta={shareKakaoPreviewMeta ?? undefined}
              />
              <p className="mt-2 text-xs text-gray-500">권장 사진 크기: 800 x 1200 (세로형 카카오 공유 이미지)</p>
              <StyledFileInput
                accept="image/*"
                onSelect={async (file) => {
                  if (!file) return;
                  setShareKakaoPreviewMeta({ name: file.name, sizeBytes: file.size });
                  const localUrl = URL.createObjectURL(file);
                  update((prev) => ({
                    ...prev,
                    share: { ...prev.share, kakaoImageUrl: localUrl },
                  }));
                  try {
                    const src = await uploadFile(file, "share");
                    update((prev) => ({
                      ...prev,
                      share: { ...prev.share, kakaoImageUrl: src },
                    }));
                  } catch (error) {
                    pushToast(error instanceof Error ? error.message : "카카오 공유 이미지 업로드에 실패했습니다.");
                  }
                }}
              />
            </Field>
          </div>
          <Field label="설명">
            <TextInput
              value={content.share.kakaoDescription}
              onChange={(e) =>
                update((prev) => ({
                  ...prev,
                  share: { ...prev.share, kakaoDescription: e.target.value },
                }))
              }
            />
          </Field>
        </Section>

        <Section id="section-header" title="헤더 영역" className="order-[17] mt-2">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="왼쪽 문장">
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
            <Field label="오른쪽 문장">
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

        <Section id="section-first" title="첫번째 영역" className="order-[30] mt-20">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="첫번째 문장">
              <TextInput
                value={firstSectionFields.weddingDate}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    heroSection: {
                      ...prev.heroSection,
                      title: buildFirstSectionTitle({
                        ...firstSectionFields,
                        weddingDate: e.target.value,
                      }),
                    },
                  }))
                }
              />
            </Field>
            <Field label="두번째 문장">
              <TextInput
                value={firstSectionFields.weddingVenue}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    heroSection: {
                      ...prev.heroSection,
                      title: buildFirstSectionTitle({
                        ...firstSectionFields,
                        weddingVenue: e.target.value,
                      }),
                    },
                  }))
                }
              />
            </Field>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="세번째 문장">
              <TextInput
                value={firstSectionFields.groomSide}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    heroSection: {
                      ...prev.heroSection,
                      title: buildFirstSectionTitle({
                        ...firstSectionFields,
                        groomSide: e.target.value,
                      }),
                    },
                  }))
                }
              />
            </Field>
            <Field label="네번째 문장">
              <TextInput
                value={firstSectionFields.brideSide}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    heroSection: {
                      ...prev.heroSection,
                      title: buildFirstSectionTitle({
                        ...firstSectionFields,
                        brideSide: e.target.value,
                      }),
                    },
                  }))
                }
              />
            </Field>
          </div>
        </Section>

        <Section id="section-hero" title="대표이미지 영역(히어로이미지)" className="order-[20] mt-20">
          <Field label="타입">
            <select
              value={content.heroMedia.type}
              onChange={(e) =>
                update((prev) => ({
                  ...prev,
                  heroMedia: {
                    ...prev.heroMedia,
                    type: e.target.value as "video" | "image",
                    // 포스터는 일반 유저 UI에서 수정하지 않는 고정값. (비디오일 때만 사용)
                    poster:
                      (e.target.value as "video" | "image") === "video"
                        ? prev.heroMedia.poster || PLACEHOLDER_SRC
                        : prev.heroMedia.poster,
                  },
                }))
              }
              className="h-14 w-full rounded-lg border border-gray-300 pl-4 pr-12 text-base"
            >
              <option value="video">비디오</option>
              <option value="image">이미지</option>
            </select>
          </Field>
          <Field label="파일">
            <ImagePreview
              src={content.heroMedia.mobileSrc}
              alt="hero-source-preview"
              meta={heroPreviewMeta ?? undefined}
            />
            <StyledFileInput
              accept={content.heroMedia.type === "video" ? "video/*" : "image/*"}
              onSelect={async (file) => {
                if (!file) return;
                setHeroPreviewMeta({ name: file.name, sizeBytes: file.size });
                // Show immediate local preview while uploading.
                const localUrl = URL.createObjectURL(file);
                update((prev) => ({
                  ...prev,
                  heroMedia: {
                    ...prev.heroMedia,
                    mobileSrc: localUrl,
                    desktopSrc: localUrl,
                    poster:
                      prev.heroMedia.type === "image" ? localUrl : prev.heroMedia.poster,
                  },
                }));
                try {
                  const src = await uploadFile(file, "hero");
                  let poster = content.heroMedia.poster;
                  if (content.heroMedia.type === "image") {
                    // 이미지: 포스터는 업로드 이미지로 자동 동일
                    poster = src;
                  } else {
                    // 비디오: 첫 프레임을 캡처해서 포스터로 업로드
                    const posterFile = await extractVideoPosterFile(file);
                    poster = await uploadFile(posterFile, "hero");
                  }
                  update((prev) => ({
                    ...prev,
                    heroMedia: {
                      ...prev.heroMedia,
                      mobileSrc: src,
                      desktopSrc: src,
                      poster: poster || PLACEHOLDER_SRC,
                    },
                  }));
                  pushToast("대표 이미지가 반영되었습니다.");
                } catch (error) {
                  const message =
                    error instanceof Error && error.message ? error.message : "대표 이미지 업로드에 실패했습니다.";
                  pushToast(message);
                }
              }}
            />
            <p className="mt-2 text-xs text-gray-500">
              {content.heroMedia.type === "video"
                ? "권장 영상 크기: 1080 x 1920 (세로형), 10~15초"
                : "권장 사진 크기: 1080 x 1920 (세로형)"}
            </p>
            <button
              type="button"
              className={`mt-2 ${mc.secondaryButton}`}
              onClick={() => {
                setHeroPreviewMeta(null);
                update((prev) => ({
                  ...prev,
                  heroMedia: {
                    ...prev.heroMedia,
                    mobileSrc: PLACEHOLDER_SRC,
                    desktopSrc: PLACEHOLDER_SRC,
                    poster: PLACEHOLDER_SRC,
                  },
                }));
              }}
            >
              파일 삭제
            </button>
          </Field>
        </Section>

        <Section id="section-guide" title="안내문구 영역" className="order-[50] mt-20">
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

        <Section id="section-location" title="장소/오시는길" className="order-[80] mt-2">
          <Field label="장소명">
            <div ref={placeSearchBoxRef} className="relative">
              <TextInput
                value={content.detailsSection.venueName}
                onChange={(e) => {
                  setPlaceSearchResults([]);
                  update((prev) => ({
                    ...prev,
                    detailsSection: { ...prev.detailsSection, venueName: e.target.value },
                  }));
                }}
                className="h-14 w-full text-[18px]"
              />
              {placeSearchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-44 space-y-1 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                  {placeSearchResults.map((place) => (
                    <button
                      key={place.id}
                      type="button"
                      className="w-full rounded-md px-2 py-2 text-left hover:bg-gray-50"
                      onClick={() => applyPlaceResult(place)}
                    >
                      <p className="text-sm font-semibold text-gray-900">{place.place_name}</p>
                      <p className="mt-0.5 text-xs text-gray-600">{place.road_address_name || place.address_name}</p>
                    </button>
                  ))}
                </div>
              )}
              {placeSearchBusy ? <p className="mt-1 text-xs text-gray-500">검색 중...</p> : null}
            </div>
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="주소">
              <TextInput
                value={content.detailsSection.address}
                disabled
                className="bg-gray-100 text-gray-500"
              />
            </Field>
            <Field label="상세주소">
              <TextInput
                value={content.detailsSection.detailAddress}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    detailsSection: { ...prev.detailsSection, detailAddress: e.target.value },
                  }))
                }
              />
            </Field>
          </div>
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
              className={mc.secondaryButton}
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

        <Section id="section-carousel" title="첫번째 캐러셀 이미지" className="order-[40] mt-20">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">히어로 캐러셀 이미지</p>
            {content.heroSection.images.map((img, index) => (
              <div key={`hero-${index}`} className="rounded-lg border border-gray-200 p-3 space-y-2">
                <ImagePreview src={img.src} alt={img.alt} />
                <StyledFileInput
                  accept="image/*"
                  className="mt-0"
                  onSelect={async (file) => {
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
                <p className="text-xs text-gray-500">권장 사진 크기: 1200 x 1800 (세로형 2:3)</p>
                <div className="flex gap-2 text-xs">
                  <button
                    className={mc.dangerButtonSm}
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
                    className={mc.secondaryButtonSm}
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
                    className={mc.secondaryButtonSm}
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
                    className={mc.dangerButtonSm}
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
              className={mc.secondaryButton}
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

        <Section id="section-intro-image" title="소개 섹션 이미지" className="order-[60] mt-20">
          <Field label="소개 섹션 이미지">
            <ImagePreview
              src={content.introSection.image.src}
              alt={content.introSection.image.alt}
            />
            <StyledFileInput
              accept="image/*"
              className="mt-3"
              onSelect={async (file) => {
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
            <p className="mt-2 text-xs text-gray-500">권장 사진 크기: 1200 x 1800 (세로형 2:3)</p>
            <button
              className={`mt-2 ${mc.dangerButtonSm}`}
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
        </Section>

        <Section id="section-gallery" title="갤러리 이미지" className="order-[70] mt-2">
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

          <div className="grid gap-4 md:grid-cols-2">
            {content.gallerySection.images.map((img, index) => (
              <div key={`gallery-${index}`} className="rounded-lg border border-gray-200 p-3 space-y-2">
                <ImagePreview src={img.src} alt={img.alt} />
                <StyledFileInput
                  accept="image/*"
                  className="mt-0"
                  onSelect={async (file) => {
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
                <p className="text-xs text-gray-500">권장 사진 크기: 1200 x 1800 (세로형 2:3)</p>
                <div className="flex gap-2 text-xs">
                  <button
                    className={mc.dangerButtonSm}
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
                    className={mc.secondaryButtonSm}
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
                    className={mc.secondaryButtonSm}
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
                    className={mc.dangerButtonSm}
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
          </div>

          <button
            className={mc.secondaryButton}
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

        <Section id="section-account" title="계좌번호 영역" className="order-[90] mt-20">
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

        <Section id="section-footer" title="푸터 영역" className="order-[100] mt-20">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="이름 문구">
              <TextInput
                value={content.footer.nameLine}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, nameLine: e.target.value },
                  }))
                }
              />
            </Field>
            <Field label="날짜 문구">
              <TextInput
                value={content.footer.dateLine}
                onChange={(e) =>
                  update((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, dateLine: e.target.value },
                  }))
                }
              />
            </Field>
          </div>
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
          </fieldset>
          </div>
        </section>

        <aside className="hidden min-h-0 bg-gray-200 px-6 py-8 lg:block">
          <div className="sticky top-6 mx-auto w-full max-w-[560px]">
            <MobileLivePreview content={content} />
          </div>
        </aside>
      </div>

      <div
        className={`pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 transform transition-all duration-300 ${
          showSavedToast ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        <div className="rounded-[300px] bg-[#230603] px-6 py-3 text-sm font-medium text-white shadow-lg">
          {toastMessage || "저장이 완료되었어요!"}
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
        width: "min(100%, 430px, calc((100dvh - 220px) * 430 / 932))",
        aspectRatio: "430 / 932",
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
          className="h-14 w-full rounded-lg border border-gray-300 pl-4 pr-12 text-base outline-none focus:border-black"
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
