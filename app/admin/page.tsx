"use client";

import { useEffect, useMemo, useState } from "react";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import type { AccountInfo, DetailItem, GalleryImageItem, ImageItem, MapLink, WeddingContent } from "@/lib/content/types";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 md:p-6">
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

export default function AdminPage() {
  const [content, setContent] = useState<WeddingContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [activeAdminKey, setActiveAdminKey] = useState("");
  const [backups, setBackups] = useState<string[]>([]);

  const getAdminHeaders = () =>
    activeAdminKey !== "" ? { "x-admin-key": activeAdminKey } : {};

  const loadBackups = async (currentKey: string) => {
    const res = await fetch("/api/admin/backups", {
      headers: currentKey !== "" ? { "x-admin-key": currentKey } : {},
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = (await res.json()) as { backups: string[] };
    setBackups(data.backups);
  };

  useEffect(() => {
    const cachedKey = window.localStorage.getItem("adminAccessKey") || "";
    setAdminKeyInput(cachedKey);
    setActiveAdminKey(cachedKey);
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/admin/content", {
          cache: "no-store",
          headers:
            activeAdminKey !== "" ? { "x-admin-key": activeAdminKey } : {},
        });
        if (!res.ok) {
          setMessage("관리자 인증키를 확인해 주세요.");
          setLoading(false);
          return;
        }
        const data = (await res.json()) as WeddingContent;
        setContent(data);
        await loadBackups(activeAdminKey);
        setLoading(false);
      } catch {
        setMessage("관리자 데이터를 불러오지 못했습니다.");
        setLoading(false);
      }
    };
    run();
  }, [activeAdminKey]);

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

    const res = await fetch("/api/admin/upload", {
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

  const handleSave = async () => {
    if (!content) return;

    setSaving(true);
    setMessage("");
    setErrors([]);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAdminHeaders() },
        body: JSON.stringify(content),
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
      setContent(saved);
      setMessage("저장 완료: 청첩장에 바로 반영됩니다.");
      await loadBackups(activeAdminKey);
    } catch (error) {
      const failMessage =
        error instanceof Error && error.message !== ""
          ? error.message
          : "저장 실패: 다시 시도해 주세요.";
      setMessage(failMessage);
    } finally {
      setSaving(false);
    }
  };

  const moveItem = <T,>(arr: T[], index: number, direction: "up" | "down") => {
    const next = [...arr];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return next;
    [next[index], next[target]] = [next[target], next[index]];
    return next;
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

  if (!ready || !content) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="mx-auto max-w-3xl space-y-4 rounded-xl border border-gray-200 bg-white p-5 md:p-6">
          <h1 className="text-2xl font-bold text-gray-900">청첩장 관리자</h1>
          <p className="text-sm text-gray-600">
            {loading
              ? "관리자 데이터 불러오는 중..."
              : "관리자 인증키를 입력하고 적용해 주세요."}
          </p>
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <TextInput
              type="password"
              placeholder="관리자 인증키 (ADMIN_ACCESS_KEY)"
              value={adminKeyInput}
              onChange={(e) => setAdminKeyInput(e.target.value)}
            />
            <button
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
              onClick={() => {
                window.localStorage.setItem("adminAccessKey", adminKeyInput);
                setActiveAdminKey(adminKeyInput);
                setLoading(true);
                setMessage("인증키 저장 완료");
              }}
            >
              인증키 저장
            </button>
          </div>
          {message && <p className="text-sm text-gray-700">{message}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-xl border border-gray-200 bg-white p-5 md:p-6">
          <h1 className="text-2xl font-bold text-gray-900">청첩장 관리자</h1>
          <p className="mt-2 text-sm text-gray-600">
            이 페이지에서 콘텐츠를 수정하고 저장하면 메인 청첩장에 반영됩니다.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <TextInput
              type="password"
              placeholder="관리자 인증키 (ADMIN_ACCESS_KEY)"
              value={adminKeyInput}
              onChange={(e) => setAdminKeyInput(e.target.value)}
            />
            <button
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
              onClick={() => {
                window.localStorage.setItem("adminAccessKey", adminKeyInput);
                setActiveAdminKey(adminKeyInput);
                setMessage("인증키 저장 완료");
              }}
            >
              인증키 저장
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "저장 중..." : "전체 저장"}
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
            >
              청첩장 보기
            </a>
            {message && <span className="self-center text-sm text-gray-700">{message}</span>}
          </div>
          {errors.length > 0 && (
            <ul className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.map((error, index) => (
                <li key={`${error}-${index}`}>- {error}</li>
              ))}
            </ul>
          )}
        </header>

        <Section title="백업/복구">
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

        <Section title="신랑/신부 이름 및 날짜">
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

        <Section title="공유 문구">
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

        <Section title="히어로 비디오/이미지">
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

        <Section title="안내문구(타이틀/설명)">
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

        <Section title="장소/오시는 길">
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
            {content.detailsSection.mapLinks.map((item, index) => (
              <div key={`map-${index}`} className="rounded-lg border border-gray-200 p-3 space-y-2">
                <div className="grid gap-2 md:grid-cols-3">
                  <TextInput
                    placeholder="이름"
                    value={item.name}
                    onChange={(e) =>
                      update((prev) => {
                        const next = [...prev.detailsSection.mapLinks];
                        next[index] = { ...next[index], name: e.target.value };
                        return {
                          ...prev,
                          detailsSection: { ...prev.detailsSection, mapLinks: next },
                        };
                      })
                    }
                  />
                  <TextInput
                    placeholder="아이콘 경로"
                    value={item.icon}
                    onChange={(e) =>
                      update((prev) => {
                        const next = [...prev.detailsSection.mapLinks];
                        next[index] = { ...next[index], icon: e.target.value };
                        return {
                          ...prev,
                          detailsSection: { ...prev.detailsSection, mapLinks: next },
                        };
                      })
                    }
                  />
                  <TextInput
                    placeholder="링크 URL"
                    value={item.url}
                    onChange={(e) =>
                      update((prev) => {
                        const next = [...prev.detailsSection.mapLinks];
                        next[index] = { ...next[index], url: e.target.value };
                        return {
                          ...prev,
                          detailsSection: { ...prev.detailsSection, mapLinks: next },
                        };
                      })
                    }
                  />
                </div>
                <button
                  className="text-xs text-red-600"
                  onClick={() =>
                    update((prev) => ({
                      ...prev,
                      detailsSection: {
                        ...prev.detailsSection,
                        mapLinks: prev.detailsSection.mapLinks.filter((_, i) => i !== index),
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
                    mapLinks: [
                      ...prev.detailsSection.mapLinks,
                      { name: "", icon: "/icon/kakaomap.png", url: "" } as MapLink,
                    ],
                  },
                }))
              }
            >
              지도 링크 추가
            </button>
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

        <Section title="각 섹션 이미지(추가/삭제/변경)">
          <Field label="소개 섹션 이미지 경로">
            <TextInput
              value={content.introSection.image.src}
              onChange={(e) =>
                update((prev) => ({
                  ...prev,
                  introSection: {
                    ...prev.introSection,
                    image: { ...prev.introSection.image, src: e.target.value },
                  },
                }))
              }
            />
            <input
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-xs"
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
          </Field>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">히어로 캐러셀 이미지</p>
            {content.heroSection.images.map((img, index) => (
              <div key={`hero-${index}`} className="rounded-lg border border-gray-200 p-3 space-y-2">
                <div className="grid gap-2 md:grid-cols-2">
                  <TextInput
                    placeholder="이미지 경로"
                    value={img.src}
                    onChange={(e) =>
                      update((prev) => {
                        const next = [...prev.heroSection.images];
                        next[index] = { ...next[index], src: e.target.value };
                        return {
                          ...prev,
                          heroSection: { ...prev.heroSection, images: next },
                        };
                      })
                    }
                  />
                  <TextInput
                    placeholder="대체 텍스트"
                    value={img.alt}
                    onChange={(e) =>
                      update((prev) => {
                        const next = [...prev.heroSection.images];
                        next[index] = { ...next[index], alt: e.target.value };
                        return {
                          ...prev,
                          heroSection: { ...prev.heroSection, images: next },
                        };
                      })
                    }
                  />
                </div>
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
                    images: [...prev.heroSection.images, { src: "", alt: "" } as ImageItem],
                  },
                }))
              }
            >
              히어로 이미지 추가
            </button>
          </div>
        </Section>

        <Section title="갤러리 (추가/삭제/순서변경/변경)">
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
              <div className="grid gap-2 md:grid-cols-2">
                <TextInput
                  placeholder="이미지 경로"
                  value={img.src}
                  onChange={(e) =>
                    update((prev) => {
                      const next = [...prev.gallerySection.images];
                      next[index] = { ...next[index], src: e.target.value };
                      return {
                        ...prev,
                        gallerySection: { ...prev.gallerySection, images: next },
                      };
                    })
                  }
                />
                <TextInput
                  placeholder="이미지 제목"
                  value={img.title}
                  onChange={(e) =>
                    update((prev) => {
                      const next = [...prev.gallerySection.images];
                      next[index] = { ...next[index], title: e.target.value };
                      return {
                        ...prev,
                        gallerySection: { ...prev.gallerySection, images: next },
                      };
                    })
                  }
                />
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <TextInput
                  placeholder="대체 텍스트"
                  value={img.alt}
                  onChange={(e) =>
                    update((prev) => {
                      const next = [...prev.gallerySection.images];
                      next[index] = { ...next[index], alt: e.target.value };
                      return {
                        ...prev,
                        gallerySection: { ...prev.gallerySection, images: next },
                      };
                    })
                  }
                />
                <TextInput
                  placeholder="비율 클래스 (기본: aspect-[2/3])"
                  value={img.aspect || ""}
                  onChange={(e) =>
                    update((prev) => {
                      const next = [...prev.gallerySection.images];
                      next[index] = { ...next[index], aspect: e.target.value };
                      return {
                        ...prev,
                        gallerySection: { ...prev.gallerySection, images: next },
                      };
                    })
                  }
                />
              </div>
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
                    { src: "", alt: "", title: "", aspect: "aspect-[2/3]" } as GalleryImageItem,
                  ],
                },
              }))
            }
          >
            갤러리 이미지 추가
          </button>
        </Section>

        <Section title="계좌번호 (입력/수정/삭제)">
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
      </div>
    </main>
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
        <TextInput
          placeholder="은행"
          value={item.bank}
          onChange={(e) => onChange({ ...item, bank: e.target.value })}
        />
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
