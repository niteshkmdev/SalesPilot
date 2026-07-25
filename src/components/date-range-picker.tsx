"use client";

import { CalendarDaysIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  DATE_RANGE_PRESET_LABELS,
  DateRangePreset,
  type DateRangePreset as DateRangePresetValue,
  formatIsoDate,
  parseIsoDate,
  resolveDateRange,
} from "@/shared/dates";

export interface DateRangeValue {
  preset: DateRangePresetValue;
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
  /** Show week/month/year/custom presets (dashboard). */
  showPresets?: boolean;
  /** Hidden input names for form POST (leads filters). */
  startName?: string;
  endName?: string;
  id?: string;
  className?: string;
  align?: "start" | "center" | "end";
  placeholder?: string;
}

function toCalendarRange(
  startDate: string,
  endDate: string,
): DateRange | undefined {
  const from = parseIsoDate(startDate) ?? undefined;
  const to = parseIsoDate(endDate) ?? undefined;
  if (!from && !to) return undefined;
  return { from, to };
}

export function DateRangePicker({
  value,
  onChange,
  showPresets = false,
  startName,
  endName,
  id,
  className,
  align = "end",
  placeholder = "Pick a date range",
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [draftPreset, setDraftPreset] = useState<DateRangePresetValue>(
    value.preset,
  );
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(() =>
    toCalendarRange(value.startDate, value.endDate),
  );

  const triggerLabel = useMemo(() => {
    if (value.preset !== DateRangePreset.CUSTOM && showPresets) {
      return DATE_RANGE_PRESET_LABELS[value.preset];
    }
    if (value.startDate && value.endDate) {
      return `${value.startDate} → ${value.endDate}`;
    }
    return placeholder;
  }, [value, showPresets, placeholder]);

  const openPopover = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraftPreset(value.preset);
      setDraftRange(toCalendarRange(value.startDate, value.endDate));
    }
    setOpen(nextOpen);
  };

  const applyPreset = (preset: DateRangePresetValue) => {
    setDraftPreset(preset);
    if (preset === DateRangePreset.CUSTOM) return;
    const resolved = resolveDateRange(preset);
    setDraftRange(toCalendarRange(resolved.startDate, resolved.endDate));
  };

  const apply = () => {
    if (showPresets && draftPreset !== DateRangePreset.CUSTOM) {
      const resolved = resolveDateRange(draftPreset);
      onChange({
        preset: resolved.preset,
        startDate: resolved.startDate,
        endDate: resolved.endDate,
      });
      setOpen(false);
      return;
    }

    const from = draftRange?.from;
    const to = draftRange?.to ?? draftRange?.from;
    if (!from || !to) return;

    const startDate = formatIsoDate(from);
    const endDate = formatIsoDate(to);
    const ordered =
      startDate <= endDate
        ? { startDate, endDate }
        : { startDate: endDate, endDate: startDate };

    onChange({
      preset: showPresets ? DateRangePreset.CUSTOM : DateRangePreset.CUSTOM,
      ...ordered,
    });
    setOpen(false);
  };

  const canApply =
    draftPreset !== DateRangePreset.CUSTOM
      ? true
      : Boolean(draftRange?.from && (draftRange.to || draftRange.from));

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {startName ? (
        <input type="hidden" name={startName} value={value.startDate} />
      ) : null}
      {endName ? (
        <input type="hidden" name={endName} value={value.endDate} />
      ) : null}

      <Popover open={open} onOpenChange={openPopover}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "justify-start font-normal",
              !value.startDate && "text-muted-foreground",
            )}
          >
            <CalendarDaysIcon data-icon="inline-start" />
            {triggerLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <div className="flex flex-col gap-3 p-3 sm:flex-row">
            {showPresets ? (
              <div className="flex flex-col gap-1 border-b pb-3 sm:w-36 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3">
                <Label className="px-2 text-xs text-muted-foreground">
                  Range
                </Label>
                {(
                  [
                    DateRangePreset.THIS_WEEK,
                    DateRangePreset.THIS_MONTH,
                    DateRangePreset.THIS_YEAR,
                    DateRangePreset.CUSTOM,
                  ] as const
                ).map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    size="sm"
                    variant={draftPreset === preset ? "secondary" : "ghost"}
                    className="justify-start"
                    onClick={() => applyPreset(preset)}
                  >
                    {DATE_RANGE_PRESET_LABELS[preset]}
                  </Button>
                ))}
              </div>
            ) : null}

            <div className="flex flex-col gap-3">
              {(draftPreset === DateRangePreset.CUSTOM || !showPresets) && (
                <Calendar
                  mode="range"
                  numberOfMonths={1}
                  selected={draftRange}
                  onSelect={setDraftRange}
                  defaultMonth={draftRange?.from ?? new Date()}
                />
              )}

              {showPresets && draftPreset !== DateRangePreset.CUSTOM ? (
                <p className="px-1 text-sm text-muted-foreground">
                  {resolveDateRange(draftPreset).startDate} →{" "}
                  {resolveDateRange(draftPreset).endDate}
                </p>
              ) : null}

              <div className="flex justify-end gap-2 border-t pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!canApply}
                  onClick={apply}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
