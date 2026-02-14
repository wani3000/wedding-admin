"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type DashboardHeaderProps = {
  name: string;
  email: string;
};

export function DashboardHeader({ name, email }: DashboardHeaderProps) {
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
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/auth/login");
      router.refresh();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  const initial = (name || email || "M").trim().charAt(0).toUpperCase();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="text-lg font-bold text-gray-900">
          mariecard
        </Link>

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
            <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
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
