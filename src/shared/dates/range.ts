import {
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
} from "date-fns";

export const DateRangePreset = {
  THIS_WEEK: "this_week",
  THIS_MONTH: "this_month",
  THIS_YEAR: "this_year",
  CUSTOM: "custom",
} as const;

export type DateRangePreset =
  (typeof DateRangePreset)[keyof typeof DateRangePreset];

export const DATE_RANGE_PRESET_VALUES = [
  DateRangePreset.THIS_WEEK,
  DateRangePreset.THIS_MONTH,
  DateRangePreset.THIS_YEAR,
  DateRangePreset.CUSTOM,
] as const;

export const DATE_RANGE_PRESET_LABELS: Record<DateRangePreset, string> = {
  [DateRangePreset.THIS_WEEK]: "This week",
  [DateRangePreset.THIS_MONTH]: "This month",
  [DateRangePreset.THIS_YEAR]: "This year",
  [DateRangePreset.CUSTOM]: "Custom",
};

export interface ResolvedDateRange {
  preset: DateRangePreset;
  startDate: string;
  endDate: string;
  label: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function formatIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseIsoDate(value: string): Date | null {
  if (!ISO_DATE.test(value)) return null;
  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function isValidIsoDate(value: string): boolean {
  return parseIsoDate(value) !== null;
}

/** Monday-based week bounds, local calendar. */
export function resolveDateRange(
  preset: DateRangePreset,
  customStart?: string | null,
  customEnd?: string | null,
  now: Date = new Date(),
): ResolvedDateRange {
  if (preset === DateRangePreset.CUSTOM) {
    const start =
      customStart && isValidIsoDate(customStart) ? customStart : null;
    const end = customEnd && isValidIsoDate(customEnd) ? customEnd : null;
    if (!start || !end) {
      return resolveDateRange(DateRangePreset.THIS_MONTH, null, null, now);
    }
    const ordered =
      start <= end
        ? { startDate: start, endDate: end }
        : { startDate: end, endDate: start };
    return {
      preset: DateRangePreset.CUSTOM,
      ...ordered,
      label: `${ordered.startDate} → ${ordered.endDate}`,
    };
  }

  if (preset === DateRangePreset.THIS_WEEK) {
    const startDate = formatIsoDate(startOfWeek(now, { weekStartsOn: 1 }));
    const endDate = formatIsoDate(endOfWeek(now, { weekStartsOn: 1 }));
    return {
      preset,
      startDate,
      endDate,
      label: DATE_RANGE_PRESET_LABELS[preset],
    };
  }

  if (preset === DateRangePreset.THIS_YEAR) {
    return {
      preset,
      startDate: formatIsoDate(startOfYear(now)),
      endDate: formatIsoDate(endOfYear(now)),
      label: DATE_RANGE_PRESET_LABELS[preset],
    };
  }

  return {
    preset: DateRangePreset.THIS_MONTH,
    startDate: formatIsoDate(startOfMonth(now)),
    endDate: formatIsoDate(endOfMonth(now)),
    label: DATE_RANGE_PRESET_LABELS[DateRangePreset.THIS_MONTH],
  };
}

export function previousEqualLengthRange(
  startDate: string,
  endDate: string,
): { startDate: string; endDate: string } | null {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!start || !end || start > end) return null;
  const days = differenceInCalendarDays(end, start);
  const prevEnd = subDays(start, 1);
  const prevStart = subDays(prevEnd, days);
  return {
    startDate: formatIsoDate(prevStart),
    endDate: formatIsoDate(prevEnd),
  };
}

export function parseDayStart(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function parseDayEnd(value: string): Date {
  return new Date(`${value}T23:59:59.999Z`);
}

export const MAX_DASHBOARD_RANGE_DAYS = 366;

export function assertValidDateRange(
  startDate: string,
  endDate: string,
): { startDate: string; endDate: string } {
  if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate)) {
    throw new Error("Invalid date range.");
  }
  if (startDate > endDate) {
    throw new Error("Start date must be on or before end date.");
  }
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!start || !end) {
    throw new Error("Invalid date range.");
  }
  if (differenceInCalendarDays(end, start) > MAX_DASHBOARD_RANGE_DAYS) {
    throw new Error(
      `Date range cannot exceed ${MAX_DASHBOARD_RANGE_DAYS} days.`,
    );
  }
  return { startDate, endDate };
}
