"use client";

import Image from "next/image";
import Script from "next/script";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { submitPublicFormAction } from "@/app/(dashboard)/forms/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PublicFormDto } from "@/modules/lead-forms/dto/lead-form.dto";

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

  const sortedFields = useMemo(
    () => [...form.fields].sort((a, b) => a.displayOrder - b.displayOrder),
    [form.fields],
  );

  const accent = form.branding.accentColor || form.branding.primaryColor;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values: Record<string, unknown> = {};
    for (const field of sortedFields) {
      values[field.key] = String(formData.get(field.key) ?? "");
    }

    startTransition(async () => {
      const result = await submitPublicFormAction({
        orgSlug,
        formSlug,
        values,
        turnstileToken: turnstileToken || undefined,
      });
      if ("error" in result) {
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
        {form.branding.logo ? (
          <Image
            src={form.branding.logo}
            alt=""
            width={160}
            height={40}
            unoptimized
            className="h-10 w-auto object-contain"
          />
        ) : (
          <p className="text-sm font-medium text-muted-foreground">
            {form.organizationName}
          </p>
        )}
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
        {sortedFields.map((field) => {
          const id = `public-${field.key}`;
          if (field.inputType === "textarea") {
            return (
              <div key={field.key} className="flex flex-col gap-2">
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
                />
                {field.helpText ? (
                  <p className="text-xs text-muted-foreground">
                    {field.helpText}
                  </p>
                ) : null}
              </div>
            );
          }

          return (
            <div key={field.key} className="flex flex-col gap-2">
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
              />
              {field.helpText ? (
                <p className="text-xs text-muted-foreground">
                  {field.helpText}
                </p>
              ) : null}
            </div>
          );
        })}

        {form.turnstileSiteKey ? (
          <>
            <Script
              src="https://challenges.cloudflare.com/turnstile/v0/api.js"
              async
              defer
            />
            <div
              className="cf-turnstile"
              data-sitekey={form.turnstileSiteKey}
              data-callback="onSalesPilotTurnstile"
              ref={() => {
                window.onSalesPilotTurnstile = setTurnstileToken;
              }}
            />
          </>
        ) : null}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Submitting…" : "Submit"}
        </Button>
      </form>
    </div>
  );
}
