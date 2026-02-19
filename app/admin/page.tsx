"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { mc } from "@/lib/mariecardStyles";

const ADMIN_ID = "admin";
const ADMIN_PASSWORD = "123456";

type InvitationRow = {
  id: string;
  user_id: string;
  title: string;
  public_id: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  users?: { name?: string | null; email?: string | null } | null;
};

export default function SuperAdminPage() {
  const [loginId, setLoginId] = useState(ADMIN_ID);
  const [loginPassword, setLoginPassword] = useState("");
  const [activeKey, setActiveKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState<InvitationRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published" | "archived">("all");

  const headers = useMemo<Record<string, string>>(() => {
    const next: Record<string, string> = {};
    if (activeKey) {
      next["x-admin-key"] = activeKey;
    }
    return next;
  }, [activeKey]);

  useEffect(() => {
    const cached = window.sessionStorage.getItem("superAdminPin") || "";
    if (/^\d{6}$/.test(cached)) {
      setActiveKey(cached);
      setAuthed(true);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/invitations", {
        cache: "no-store",
        headers,
      });
      if (!res.ok) {
        setMessage("목록 조회 실패");
        setLoading(false);
        return;
      }
      const data = (await res.json()) as { invitations: InvitationRow[] };
      setRows(data.invitations || []);
      setLoading(false);
    } catch {
      setMessage("목록 조회 실패");
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    if (!authed || !activeKey) return;
    void load();
  }, [activeKey, authed, load]);

  const filteredRows = useMemo(() => {
    if (statusFilter === "all") return rows;
    return rows.filter((row) => row.status === statusFilter);
  }, [rows, statusFilter]);

  const statusLabel = (status: InvitationRow["status"]) => {
    if (status === "draft") return "초안";
    if (status === "published") return "활성";
    return "만료";
  };

  const onLogin = () => {
    if (loginId.trim() !== ADMIN_ID) {
      setMessage("아이디가 올바르지 않습니다.");
      return;
    }
    if (loginPassword !== ADMIN_PASSWORD) {
      setMessage("비밀번호가 올바르지 않습니다.");
      return;
    }
    setActiveKey(loginPassword);
    setAuthed(true);
    window.sessionStorage.setItem("superAdminPin", loginPassword);
  };

  const updateStatus = async (id: string, action: "expire" | "restore") => {
    setMessage("");
    const res = await fetch(`/api/admin/invitations/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      setMessage("상태 변경 실패");
      return;
    }
    await load();
  };

  if (!authed) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-6">
          <h1 className="text-2xl font-bold text-gray-900">슈퍼관리자</h1>
          <p className="mt-2 text-sm text-gray-600">전체 청첩장 링크 운영 페이지입니다.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="아이디"
            />
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="6자리 숫자 비밀번호"
            />
          </div>
          <button
            onClick={onLogin}
            className={`mt-4 ${mc.primaryButton}`}
          >
            로그인
          </button>
          {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-xl border border-gray-200 bg-white p-5">
          <h1 className="text-2xl font-bold text-gray-900">슈퍼관리자</h1>
          <p className="mt-1 text-sm text-gray-600">
            전체 사용자 청첩장 링크를 확인/접속/수정/만료/복구할 수 있습니다.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="/admin/sample-editor"
              className={mc.secondaryButton}
            >
              샘플청첩장 수정하기
            </a>
            <button
              onClick={() => void load()}
              className={mc.secondaryButton}
            >
              새로고침
            </button>
            <button
              onClick={() => {
                window.sessionStorage.removeItem("superAdminPin");
                setAuthed(false);
                setRows([]);
                setLoginPassword("");
                setActiveKey("");
              }}
              className={mc.secondaryButton}
            >
              로그아웃
            </button>
            {message && <span className="self-center text-sm text-gray-700">{message}</span>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => setStatusFilter("all")} className={statusFilter === "all" ? mc.primaryButton : mc.secondaryButton}>
              전체
            </button>
            <button onClick={() => setStatusFilter("draft")} className={statusFilter === "draft" ? mc.primaryButton : mc.secondaryButton}>
              초안
            </button>
            <button onClick={() => setStatusFilter("published")} className={statusFilter === "published" ? mc.primaryButton : mc.secondaryButton}>
              활성
            </button>
            <button onClick={() => setStatusFilter("archived")} className={statusFilter === "archived" ? mc.primaryButton : mc.secondaryButton}>
              만료
            </button>
          </div>
        </header>

        <section className="md:hidden space-y-3">
          {loading && <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">불러오는 중...</div>}
          {!loading && filteredRows.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">데이터가 없습니다.</div>
          )}
          {filteredRows.map((row) => {
            const link = row.public_id ? `/invitation/${row.public_id}` : "";
            return (
              <article key={row.id} className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
                <p className="text-xs text-gray-500">상태</p>
                <p className="font-medium text-gray-900">{statusLabel(row.status)}</p>
                <p className="mt-3 text-xs text-gray-500">유저</p>
                <p className="text-gray-700">
                  {row.users?.name || "-"} {row.users?.email ? `(${row.users.email})` : ""}
                </p>
                <p className="mt-3 text-xs text-gray-500">공개 링크</p>
                {row.public_id ? (
                  <a className="break-all text-blue-600 underline" href={link} target="_blank" rel="noreferrer">
                    {`https://mariecard.com${link}`}
                  </a>
                ) : (
                  <span className="text-gray-400">미발급</span>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {row.public_id && (
                    <a
                      href={`https://mariecard.com/invitation/${row.public_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className={mc.secondaryButtonSm}
                    >
                      접속
                    </a>
                  )}
                  <a href={`/admin/sample-editor?invitationId=${row.id}&super=1`} className={mc.secondaryButtonSm}>
                    수정
                  </a>
                  {row.status === "published" ? (
                    <button onClick={() => void updateStatus(row.id, "expire")} className={mc.secondaryButtonSm}>
                      만료
                    </button>
                  ) : (
                    <button onClick={() => void updateStatus(row.id, "restore")} className={mc.secondaryButtonSm}>
                      복구
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        <section className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white md:block">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">공개 링크</th>
                <th className="px-4 py-3">유저</th>
                <th className="px-4 py-3">초대장 ID</th>
                <th className="px-4 py-3">내보내기일</th>
                <th className="px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={6}>
                    불러오는 중...
                  </td>
                </tr>
              )}
              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={6}>
                    데이터가 없습니다.
                  </td>
                </tr>
              )}
              {filteredRows.map((row) => {
                const link = row.public_id ? `/invitation/${row.public_id}` : "";
                return (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{statusLabel(row.status)}</td>
                    <td className="px-4 py-3">
                      {row.public_id ? (
                        <a className="text-blue-600 underline" href={link} target="_blank" rel="noreferrer">
                          {`https://mariecard.com${link}`}
                        </a>
                      ) : (
                        <span className="text-gray-400">미발급</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {row.users?.name || "-"} {row.users?.email ? `(${row.users.email})` : ""}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.id}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {row.published_at ? new Date(row.published_at).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {row.public_id && (
                          <a
                            href={`https://mariecard.com/invitation/${row.public_id}`}
                            target="_blank"
                            rel="noreferrer"
                            className={mc.secondaryButtonSm}
                          >
                            접속
                          </a>
                        )}
                        <a
                          href={`/admin/sample-editor?invitationId=${row.id}&super=1`}
                          className={mc.secondaryButtonSm}
                        >
                          수정
                        </a>
                        <button
                          onClick={() => void updateStatus(row.id, "expire")}
                          className={mc.dangerButtonSm}
                        >
                          만료
                        </button>
                        <button
                          onClick={() => void updateStatus(row.id, "restore")}
                          className={mc.secondaryButtonSm}
                        >
                          복구
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
