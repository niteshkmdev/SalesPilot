"use client";

import Image from "next/image";
import Script from "next/script";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { submitPublicFormAction } from "@/app/(dashboard)/forms/actions";
import { PhoneInput } from "@/components/phone-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  PublicFormDto,
  PublicFormFieldDto,
} from "@/modules/lead-forms/dto/lead-form.dto";
import { optionalPhoneFieldError } from "@/shared/phone";

interface PublicLeadFormProps {
  orgSlug: string;
  formSlug: string;
  form: PublicFormDto;
}

declare global {
  interface Window {
    onSalesPilotTurnstile?: (token: string) => void;
  }
}

export function PublicLeadForm({
  orgSlug,
  formSlug,
  form,
}: PublicLeadFormProps) {
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const sortedFields = useMemo(
    () => [...form.fields].sort((a, b) => a.displayOrder - b.displayOrder),
    [form.fields],
  );

  const fieldRows = useMemo(() => buildFieldRows(sortedFields), [sortedFields]);

  const accent = form.branding.accentColor || form.branding.primaryColor;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values: Record<string, unknown> = {};
    const nextErrors: Record<string, string> = {};

    for (const field of sortedFields) {
      const raw = String(formData.get(field.key) ?? "");
      values[field.key] = raw;

      if (
        (field.key === "core:phone" || field.inputType === "tel") &&
        raw.trim()
      ) {
        const phoneError = optionalPhoneFieldError(raw);
        if (phoneError) {
          nextErrors[field.key] = phoneError;
        }
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});

    startTransition(async () => {
      const result = await submitPublicFormAction({
        orgSlug,
        formSlug,
        values,
        turnstileToken: turnstileToken || undefined,
      });
      if ("error" in result) {
        if (/phone/i.test(result.error)) {
          const phoneField = sortedFields.find(
            (f) => f.key === "core:phone" || f.inputType === "tel",
          );
          if (phoneField) {
            setFieldErrors({ [phoneField.key]: result.error });
            return;
          }
        }
        toast.error(result.error);
        return;
      }
      setSubmitted(true);
    });
  };

  if (submitted) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Thank you</h1>
        <p className="text-muted-foreground">{form.successMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        {form.brandingDisplay !== "NAME" && form.branding.logo ? (
          <Image
            src={form.branding.logo}
            alt={form.organizationName}
            width={160}
            height={40}
            unoptimized
            className="h-10 w-auto object-contain"
          />
        ) : null}
        {form.brandingDisplay !== "LOGO" || !form.branding.logo ? (
          <p className="text-sm font-medium text-muted-foreground">
            {form.organizationName}
          </p>
        ) : null}
        <div>
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={accent ? { color: accent } : undefined}
          >
            {form.name}
          </h1>
          {form.description ? (
            <p className="mt-2 text-muted-foreground">{form.description}</p>
          ) : null}
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {fieldRows.map((row) => {
          if (row.type === "pair") {
            return (
              <div
                key={`${row.left.key}-${row.right.key}`}
                className="grid gap-4 sm:grid-cols-2"
              >
                <PublicFieldControl
                  field={row.left}
                  pending={pending}
                  error={fieldErrors[row.left.key]}
                  onClearError={() =>
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next[row.left.key];
                      return next;
                    })
                  }
                />
                <PublicFieldControl
                  field={row.right}
                  pending={pending}
                  error={fieldErrors[row.right.key]}
                  onClearError={() =>
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next[row.right.key];
                      return next;
                    })
                  }
                />
              </div>
            );
          }
          return (
            <PublicFieldControl
              key={row.field.key}
              field={row.field}
              pending={pending}
              error={fieldErrors[row.field.key]}
              onClearError={() =>
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next[row.field.key];
                  return next;
                })
              }
            />
          );
        })}

        {form.turnstileSiteKey ? (
          <>
            <Script
              src="https://challenges.cloudflare.com/turnstile/v0/api.js"
              async
              defer
            />
            <div className="flex w-full justify-center">
              <div
                className="cf-turnstile"
                data-sitekey={form.turnstileSiteKey}
                data-callback="onSalesPilotTurnstile"
                ref={() => {
                  window.onSalesPilotTurnstile = setTurnstileToken;
                }}
              />
            </div>
          </>
        ) : null}

        <Button type="submit" disabled={pending} className="h-11 w-full">
          {pending ? "Submitting…" : "Submit"}
        </Button>
      </form>
    </div>
  );
}

type FieldRow =
  | { type: "single"; field: PublicFormFieldDto }
  | { type: "pair"; left: PublicFormFieldDto; right: PublicFormFieldDto };

function buildFieldRows(fields: PublicFormFieldDto[]): FieldRow[] {
  const firstName = fields.find((f) => f.key === "core:firstName");
  const lastName = fields.find((f) => f.key === "core:lastName");
  const canPair = Boolean(firstName && lastName);
  const rows: FieldRow[] = [];
  let paired = false;

  for (const field of fields) {
    if (
      canPair &&
      (field.key === "core:firstName" || field.key === "core:lastName")
    ) {
      if (!paired && firstName && lastName) {
        rows.push({ type: "pair", left: firstName, right: lastName });
        paired = true;
      }
      continue;
    }
    rows.push({ type: "single", field });
  }

  return rows;
}

function PublicFieldControl({
  field,
  pending,
  error,
  onClearError,
}: {
  field: PublicFormFieldDto;
  pending: boolean;
  error?: string;
  onClearError: () => void;
}) {
  const id = `public-${field.key}`;
  const isPhone = field.key === "core:phone" || field.inputType === "tel";

  if (field.inputType === "textarea") {
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>
          {field.label}
          {field.required ? " *" : ""}
        </Label>
        <Textarea
          id={id}
          name={field.key}
          required={field.required}
          placeholder={field.placeholder ?? undefined}
          disabled={pending}
          rows={4}
          className="min-h-28"
        />
        {field.helpText ? (
          <p className="text-xs text-muted-foreground">{field.helpText}</p>
        ) : null}
      </div>
    );
  }

  if (isPhone) {
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>
          {field.label}
          {field.required ? " *" : ""}
        </Label>
        <PhoneInput
          id={id}
          name={field.key}
          required={field.required}
          disabled={pending}
          size="lg"
          placeholder={field.placeholder ?? undefined}
          error={error ?? null}
          onErrorChange={(next) => {
            if (!next) onClearError();
          }}
        />
        {field.helpText ? (
          <p className="text-xs text-muted-foreground">{field.helpText}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {field.label}
        {field.required ? " *" : ""}
      </Label>
      <Input
        id={id}
        name={field.key}
        type={field.inputType}
        required={field.required}
        placeholder={field.placeholder ?? undefined}
        disabled={pending}
        className="h-11"
        aria-invalid={Boolean(error)}
      />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {field.helpText ? (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      ) : null}
    </div>
  );
}
