"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  archiveLeadFormAction,
  createLeadFormAction,
  publishLeadFormAction,
  updateLeadFormAction,
} from "@/app/(dashboard)/forms/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CustomFieldDto } from "@/modules/custom-fields/dto/custom-field.dto";
import {
  coreFieldLabels,
  defaultFormFields,
  type FormFieldConfig,
  formCoreKeys,
  type LeadFormDetailDto,
  normalizeFormFieldsOrder,
  slugifyFormName,
} from "@/modules/lead-forms/dto/lead-form.dto";
import type { LeadAssigneeOptionDto } from "@/modules/leads/dto/lead.dto";

interface LeadFormEditorProps {
  initialData?: LeadFormDetailDto;
  customFields: CustomFieldDto[];
  managerOptions: LeadAssigneeOptionDto[];
  canUpdate: boolean;
  canPublish: boolean;
  canArchive: boolean;
  organizationLogo?: string | null;
}

const lockedCoreKeys = new Set(["firstName", "email"]);

export function LeadFormEditor({
  initialData,
  customFields,
  managerOptions,
  canUpdate,
  canPublish,
  canArchive,
  organizationLogo = null,
}: LeadFormEditorProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(initialData?.id);
  const status = initialData?.status ?? "DRAFT";
  const isPublished = status === "PUBLISHED";
  const isArchived = status === "ARCHIVED";
  const isDraftLike = !isEdit || status === "DRAFT";

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [successMessage, setSuccessMessage] = useState(
    initialData?.successMessage ?? "",
  );
  const [allowIndexing, setAllowIndexing] = useState(
    initialData?.allowIndexing ?? false,
  );
  const hasOrgLogo = Boolean(organizationLogo ?? initialData?.organizationLogo);
  const [brandingDisplay, setBrandingDisplay] = useState<
    "LOGO" | "NAME" | "BOTH"
  >(() => {
    const initial = initialData?.brandingDisplay ?? "BOTH";
    if (!hasOrgLogo && initial !== "NAME") return "NAME";
    return initial;
  });
  const [managerId, setManagerId] = useState(
    initialData?.defaultAssignedManagerId ?? "none",
  );
  const [fields, setFields] = useState<FormFieldConfig[]>(() => {
    const base = initialData?.fields?.length
      ? initialData.fields
      : defaultFormFields();
    return ensureLockedCoreFields(base);
  });

  const selectedCustomIds = useMemo(
    () =>
      new Set(
        fields
          .filter((f) => f.kind === "custom" && f.customFieldId)
          .map((f) => f.customFieldId as string),
      ),
    [fields],
  );

  const cancelHref = initialData ? `/forms/view/${initialData.id}` : "/forms";
  const readOnly = (isEdit && !canUpdate) || isArchived;

  const buildPayload = () => ({
    name,
    slug: slug || slugifyFormName(name),
    description,
    successMessage,
    allowIndexing,
    brandingDisplay: hasOrgLogo ? brandingDisplay : "NAME",
    defaultAssignedManagerId: managerId === "none" ? "" : managerId,
    fields: normalizeFormFieldsOrder(ensureLockedCoreFields(fields)),
  });

  const goToDetail = (formId: string) => {
    router.push(`/forms/view/${formId}`);
    router.refresh();
  };

  const saveDraftOrUpdate = (andPublish: boolean) => {
    startTransition(async () => {
      const payload = buildPayload();

      if (isEdit && initialData) {
        const result = await updateLeadFormAction(initialData.id, payload);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }

        if (andPublish && canPublish && status !== "PUBLISHED") {
          const published = await publishLeadFormAction(initialData.id);
          if ("error" in published) {
            toast.error(published.error);
            return;
          }
          toast.success("Form published");
        } else {
          toast.success(isPublished ? "Form saved" : "Draft saved");
        }
        goToDetail(initialData.id);
        return;
      }

      const created = await createLeadFormAction(payload);
      if ("error" in created) {
        toast.error(created.error);
        return;
      }

      if (andPublish && canPublish) {
        const published = await publishLeadFormAction(created.formId);
        if ("error" in published) {
          toast.error(published.error);
          goToDetail(created.formId);
          return;
        }
        toast.success("Form published");
      } else {
        toast.success("Draft saved");
      }
      goToDetail(created.formId);
    });
  };

  const handleArchive = () => {
    if (!initialData) return;
    startTransition(async () => {
      const result = await archiveLeadFormAction(initialData.id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Form archived");
      goToDetail(initialData.id);
    });
  };

  const toggleCore = (coreKey: (typeof formCoreKeys)[number]) => {
    if (lockedCoreKeys.has(coreKey)) return;
    setFields((prev) => {
      const existing = prev.find(
        (f) => f.kind === "core" && f.coreKey === coreKey,
      );
      if (existing) {
        return normalizeFormFieldsOrder(prev.filter((f) => f !== existing));
      }
      return normalizeFormFieldsOrder([
        ...prev,
        {
          key: `core:${coreKey}`,
          kind: "core" as const,
          coreKey,
          required: coreKey === "lastName",
          displayOrder: 0,
        },
      ]);
    });
  };

  const toggleCustom = (fieldId: string) => {
    setFields((prev) => {
      const existing = prev.find(
        (f) => f.kind === "custom" && f.customFieldId === fieldId,
      );
      if (existing) {
        return normalizeFormFieldsOrder(prev.filter((f) => f !== existing));
      }
      return normalizeFormFieldsOrder([
        ...prev,
        {
          key: `custom:${fieldId}`,
          kind: "custom" as const,
          customFieldId: fieldId,
          required: false,
          displayOrder: 0,
        },
      ]);
    });
  };

  const setRequired = (key: string, required: boolean) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.key !== key) return f;
        if (f.kind === "core" && f.coreKey && lockedCoreKeys.has(f.coreKey)) {
          return { ...f, required: true };
        }
        return { ...f, required };
      }),
    );
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 pt-6">
        {initialData ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{initialData.status}</Badge>
            <code className="text-xs text-muted-foreground">
              {initialData.publicPath}
            </code>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="form-name">Name</Label>
            <Input
              id="form-name"
              value={name}
              onChange={(e) => {
                const nextName = e.target.value;
                setName(nextName);
                if (!isEdit && !slugManual) {
                  setSlug(slugifyFormName(nextName));
                }
              }}
              disabled={readOnly || pending}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="form-slug">Slug</Label>
            <Input
              id="form-slug"
              value={slug}
              onChange={(e) => {
                setSlugManual(true);
                setSlug(e.target.value);
              }}
              disabled={readOnly || pending}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="form-description">Description</Label>
          <Textarea
            id="form-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={readOnly || pending}
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="branding-display">Public branding</Label>
          <Select
            value={brandingDisplay}
            onValueChange={(value) =>
              setBrandingDisplay(value as "LOGO" | "NAME" | "BOTH")
            }
            disabled={readOnly || pending}
          >
            <SelectTrigger id="branding-display" className="w-full sm:max-w-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="NAME">Organization name only</SelectItem>
                <SelectItem value="LOGO" disabled={!hasOrgLogo}>
                  Logo only
                </SelectItem>
                <SelectItem value="BOTH" disabled={!hasOrgLogo}>
                  Logo and name
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {hasOrgLogo
              ? "Choose how your organization appears on the public form."
              : "Upload an organization logo in Settings to enable logo branding."}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="form-manager">Default assigned manager</Label>
          <Select
            value={managerId}
            onValueChange={setManagerId}
            disabled={readOnly || pending}
          >
            <SelectTrigger id="form-manager" className="w-full">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="none">Unassigned</SelectItem>
                {managerOptions.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="form-success">Success message</Label>
          <Textarea
            id="form-success"
            value={successMessage}
            onChange={(e) => setSuccessMessage(e.target.value)}
            disabled={readOnly || pending}
            rows={2}
            placeholder="Thank you! Our team will contact you soon."
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Checkbox
            id="form-allow-indexing"
            checked={allowIndexing}
            onCheckedChange={(checked) => setAllowIndexing(checked === true)}
            disabled={readOnly || pending}
          />
          <Label htmlFor="form-allow-indexing">
            Allow search engine indexing
          </Label>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-medium">Core fields</h3>
            <p className="text-sm text-muted-foreground">
              First name and email are always required for duplicate detection.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {formCoreKeys.map((coreKey) => {
              const selected = fields.some(
                (f) => f.kind === "core" && f.coreKey === coreKey,
              );
              const config = fields.find(
                (f) => f.kind === "core" && f.coreKey === coreKey,
              );
              const locked = lockedCoreKeys.has(coreKey);
              const selectId = `core-select-${coreKey}`;
              const requiredId = `core-required-${coreKey}`;
              return (
                <div
                  key={coreKey}
                  className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={selectId}
                      checked={selected}
                      onCheckedChange={() => toggleCore(coreKey)}
                      disabled={readOnly || pending || locked}
                    />
                    <Label htmlFor={selectId}>{coreFieldLabels[coreKey]}</Label>
                  </div>
                  {selected && config ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Checkbox
                        id={requiredId}
                        checked={config.required}
                        onCheckedChange={(checked) =>
                          setRequired(config.key, checked === true)
                        }
                        disabled={readOnly || pending || locked}
                      />
                      <Label htmlFor={requiredId}>Required</Label>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-medium">Custom fields</h3>
            <p className="text-sm text-muted-foreground">
              Include active organization custom fields.
            </p>
          </div>
          {customFields.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active custom fields.{" "}
              <Link href="/settings/custom-fields" className="underline">
                Manage custom fields
              </Link>
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {customFields.map((field) => {
                const selected = selectedCustomIds.has(field.id);
                const config = fields.find(
                  (f) => f.kind === "custom" && f.customFieldId === field.id,
                );
                const selectId = `custom-select-${field.id}`;
                const requiredId = `custom-required-${field.id}`;
                return (
                  <div
                    key={field.id}
                    className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={selectId}
                        checked={selected}
                        onCheckedChange={() => toggleCustom(field.id)}
                        disabled={readOnly || pending}
                      />
                      <Label htmlFor={selectId}>{field.name}</Label>
                    </div>
                    {selected && config ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Checkbox
                          id={requiredId}
                          checked={config.required}
                          onCheckedChange={(checked) =>
                            setRequired(config.key, checked === true)
                          }
                          disabled={readOnly || pending}
                        />
                        <Label htmlFor={requiredId}>Required</Label>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end gap-2 border-t">
        <Button type="button" variant="outline" asChild>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
        {!readOnly && isDraftLike ? (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => saveDraftOrUpdate(false)}
            >
              {pending ? "Saving…" : "Save Draft"}
            </Button>
            {canPublish ? (
              <Button
                type="button"
                disabled={pending}
                onClick={() => saveDraftOrUpdate(true)}
              >
                {pending ? "Publishing…" : "Publish"}
              </Button>
            ) : null}
          </>
        ) : null}
        {!readOnly && isPublished ? (
          <>
            <Button
              type="button"
              disabled={pending}
              onClick={() => saveDraftOrUpdate(false)}
            >
              {pending ? "Saving…" : "Save"}
            </Button>
            {canArchive ? (
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={handleArchive}
              >
                Archive
              </Button>
            ) : null}
          </>
        ) : null}
      </CardFooter>
    </Card>
  );
}

function ensureLockedCoreFields(fields: FormFieldConfig[]): FormFieldConfig[] {
  const next = [...fields];
  for (const coreKey of ["firstName", "email"] as const) {
    const existing = next.find(
      (f) => f.kind === "core" && f.coreKey === coreKey,
    );
    if (!existing) {
      next.unshift({
        key: `core:${coreKey}`,
        kind: "core",
        coreKey,
        required: true,
        displayOrder: coreKey === "firstName" ? 10 : 30,
      });
    } else {
      existing.required = true;
    }
  }
  return next;
}
