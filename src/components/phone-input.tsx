"use client";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  clampNationalNumber,
  DEFAULT_PHONE_COUNTRY,
  filterPhoneCountries,
  getNationalMaxLength,
  getPhoneCountry,
  normalizeToE164,
  optionalPhoneFieldError,
  PHONE_COUNTRIES,
  parseStoredPhone,
} from "@/shared/phone";

export type PhoneInputSize = "default" | "lg";

interface PhoneInputProps {
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  defaultValue?: string | null;
  onValueChange?: (e164: string) => void;
  error?: string | null;
  onErrorChange?: (error: string | null) => void;
  size?: PhoneInputSize;
  className?: string;
  placeholder?: string;
}

export function PhoneInput({
  id,
  name = "phone",
  disabled = false,
  required = false,
  defaultValue,
  onValueChange,
  error: controlledError,
  onErrorChange,
  size = "default",
  className,
  placeholder,
}: PhoneInputProps) {
  const initial = useMemo(
    () => parseStoredPhone(defaultValue ?? ""),
    [defaultValue],
  );

  const [iso2, setIso2] = useState(initial.iso2 || DEFAULT_PHONE_COUNTRY);
  const [national, setNational] = useState(initial.national);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [internalError, setInternalError] = useState<string | null>(null);

  const error = controlledError !== undefined ? controlledError : internalError;
  const country = getPhoneCountry(iso2);
  const maxLength = getNationalMaxLength(iso2);
  const tall = size === "lg";

  const submittedValue =
    national.length === 0
      ? ""
      : (normalizeToE164(national, iso2) ?? `+${country.dialCode}${national}`);

  const filtered = useMemo(
    () => filterPhoneCountries(search, PHONE_COUNTRIES),
    [search],
  );

  const setError = (next: string | null) => {
    setInternalError(next);
    onErrorChange?.(next);
  };

  const emit = (nextNational: string, nextIso2: string) => {
    const next =
      nextNational.length === 0
        ? ""
        : (normalizeToE164(nextNational, nextIso2) ?? "");
    onValueChange?.(next);
  };

  const handleNationalChange = (raw: string) => {
    const next = clampNationalNumber(raw, iso2);
    setNational(next);
    setError(null);
    emit(next, iso2);
  };

  const handleCountrySelect = (nextIso2: string) => {
    const next = clampNationalNumber(national, nextIso2);
    setIso2(nextIso2);
    setNational(next);
    setOpen(false);
    setSearch("");
    setError(null);
    emit(next, nextIso2);
  };

  const handleBlur = () => {
    if (!national && !required) {
      setError(null);
      return;
    }
    if (!national && required) {
      setError("Phone number is required");
      return;
    }
    const message = optionalPhoneFieldError(
      normalizeToE164(national, iso2) ?? `+${country.dialCode}${national}`,
    );
    setError(message);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              aria-label="Select country code"
              className={cn(
                "shrink-0 justify-between gap-1 px-2.5 font-normal",
                tall ? "h-11 min-w-[5.5rem]" : "h-9 min-w-[5rem]",
              )}
            >
              <span>+{country.dialCode}</span>
              <ChevronsUpDownIcon
                className="opacity-50"
                data-icon="inline-end"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-72 p-2"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country or code"
              className="h-9"
              autoComplete="off"
            />
            <ul className="mt-2 max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <li className="px-2 py-3 text-sm text-muted-foreground">
                  No countries found
                </li>
              ) : (
                filtered.map((item) => {
                  const selected = item.iso2 === iso2;
                  return (
                    <li key={item.iso2}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent",
                          selected && "bg-accent",
                        )}
                        onClick={() => handleCountrySelect(item.iso2)}
                      >
                        <span className="w-12 shrink-0 tabular-nums text-muted-foreground">
                          +{item.dialCode}
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          {item.name}
                        </span>
                        {selected ? (
                          <CheckIcon className="size-4 shrink-0" />
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </PopoverContent>
        </Popover>

        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          disabled={disabled}
          required={required}
          value={national}
          maxLength={maxLength}
          placeholder={
            placeholder ?? (iso2 === "IN" ? "9876543210" : "Phone number")
          }
          onChange={(e) => handleNationalChange(e.target.value)}
          onBlur={handleBlur}
          aria-invalid={Boolean(error)}
          className={cn("min-w-0 flex-1", tall && "h-11")}
        />
      </div>

      <input type="hidden" name={name} value={submittedValue} readOnly />

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
