"use client";

import { buildMonthCalendar, WEEKDAY_LABELS } from "@/lib/calendar/calendarUtils";
import type { WeddingContent } from "@/lib/content/types";

function toCompactDateLabel(dateIso: string): string {
  const d = new Date(`${dateIso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function createIcsContent(content: WeddingContent): string {
  const selectedDate = content.calendarSection.selectedDate || "2026-01-01";
  const start = selectedDate.replaceAll("-", "");
  const endDate = new Date(`${selectedDate}T00:00:00`);
  endDate.setDate(endDate.getDate() + 1);
  const end = `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, "0")}${String(endDate.getDate()).padStart(2, "0")}`;

  const summary = content.share.kakaoTitle || content.couple.displayName || "초대장 일정";
  const location = [content.detailsSection.venueName, content.detailsSection.address, content.detailsSection.detailAddress]
    .filter((v) => v && v.trim() !== "")
    .join(" ");
  const description = content.share.kakaoDescription || `${toCompactDateLabel(selectedDate)} ${location}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MarieCard//Invitation Calendar//KO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@mariecard.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${summary.replace(/\n/g, " ")}`,
    `LOCATION:${location.replace(/\n/g, " ")}`,
    `DESCRIPTION:${description.replace(/\n/g, " ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function CalendarSection({ content }: { content: WeddingContent }) {
  const selectedDate = content.calendarSection.selectedDate;
  const { monthLabel, cells } = buildMonthCalendar(selectedDate);

  const handleAddToCalendar = () => {
    const icsContent = createIcsContent(content);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mariecard-invitation.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="bg-white px-4 py-8 md:px-8 md:py-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-[16px] text-gray-600">{monthLabel}</p>

        <div className="mx-auto mt-6 max-w-2xl px-3 pt-7 pb-0 md:px-6 md:pt-8 md:pb-0">
          <div className="grid grid-cols-7 text-center text-[12px] font-semibold text-gray-800">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className={label === "일" ? "text-red-500" : ""}>
                {label}
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-7 gap-y-2 text-center text-[35px] leading-none">
            {cells.map((cell, idx) => (
              <div
                key={`${cell.date.toISOString()}-${idx}`}
                className={`flex items-center justify-center ${
                  cell.isCurrentMonth ? "h-12 md:h-16" : "h-0 md:h-0"
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center rounded-full ${
                    cell.isCurrentMonth ? "h-10 w-10 text-[12px] md:h-12 md:w-12 md:text-[21px]" : "h-0 w-0 text-transparent"
                  } ${
                    !cell.isCurrentMonth
                      ? "text-transparent"
                      : cell.isSelected
                        ? "bg-[#800532] text-white"
                        : cell.isHoliday || cell.isSunday
                          ? "text-red-500"
                          : "text-gray-800"
                  }`}
                >
                  {cell.isCurrentMonth ? cell.day : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-[10px] mb-[20px] flex justify-center">
          <button
            type="button"
            onClick={handleAddToCalendar}
            className="flex items-center gap-2 rounded-full bg-gray-100 px-5 py-3 text-sm font-medium text-black transition-colors hover:bg-gray-200"
          >
            내 캘린더에 추가하기
          </button>
        </div>
      </div>
    </section>
  );
}
