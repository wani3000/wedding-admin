"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mc } from "@/lib/mariecardStyles";

type InvitationCardActionsProps = {
  invitationId: string;
  type: "active" | "inProgress";
};

export function InvitationCardActions({ invitationId, type }: InvitationCardActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleExpire = async () => {
    if (busy) return;
    const ok = window.confirm("이 초대장을 만료 처리할까요?");
    if (!ok) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/platform/invitations/${invitationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "expire" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        window.alert(body?.message || "만료 처리에 실패했습니다.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (busy) return;
    const ok = window.confirm("제작중인 초대장을 삭제할까요? 삭제 후 복구할 수 없습니다.");
    if (!ok) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/platform/invitations/${invitationId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        window.alert(body?.message || "삭제에 실패했습니다.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  if (type === "active") {
    return (
      <button
        type="button"
        onClick={handleExpire}
        disabled={busy}
        className={mc.dangerButton}
      >
        만료
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      className={mc.dangerButton}
    >
      삭제
    </button>
  );
}
