export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

const KOREAN_FIXED_HOLIDAYS = new Set([
  "01-01",
  "03-01",
  "05-05",
  "06-06",
  "08-15",
  "10-03",
  "10-09",
  "12-25",
]);

export type CalendarCell = {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isHoliday: boolean;
  isSunday: boolean;
  isSelected: boolean;
};

function toMonthDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

export function isHolidayDate(date: Date): boolean {
  return KOREAN_FIXED_HOLIDAYS.has(toMonthDay(date));
}

export function getDateFromIso(iso: string): Date {
  const parsed = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return new Date();
  return parsed;
}

export function buildMonthCalendar(selectedDateIso: string): {
  year: number;
  month: number;
  monthLabel: string;
  cells: CalendarCell[];
} {
  const selectedDate = getDateFromIso(selectedDateIso);
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const monthLabel = `${year}년 ${month + 1}월`;

  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay();
  const startDate = new Date(year, month, 1 - startDayOfWeek);

  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);

    const isCurrentMonth = current.getMonth() === month;
    const isSunday = current.getDay() === 0;
    const isSelected = current.toDateString() === selectedDate.toDateString();

    cells.push({
      date: current,
      day: current.getDate(),
      isCurrentMonth,
      isHoliday: isHolidayDate(current),
      isSunday,
      isSelected,
    });
  }

  return { year, month, monthLabel, cells };
}
