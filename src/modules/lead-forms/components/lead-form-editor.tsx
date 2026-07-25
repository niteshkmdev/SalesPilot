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
}

export function LeadFormEditor({
  initialData,
  customFields,
  managerOptions,
  canUpdate,
  canPublish,
  canArchive,
}: LeadFormEditorProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(initialData?.id);

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [successMessage, setSuccessMessage] = useState(
    initialData?.successMessage ?? "",
  );
  const [allowIndexing, setAllowIndexing] = useState(
    initialData?.allowIndexing ?? false,
  );
  const [managerId, setManagerId] = useState(
    initialData?.defaultAssignedManagerId ?? "none",
  );
  const [fields, setFields] = useState<FormFieldConfig[]>(
    initialData?.fields?.length ? initialData.fields : defaultFormFields(),
  );

  const selectedCustomIds = useMemo(
    () =>
      new Set(
        fields
          .filter((f) => f.kind === "custom" && f.customFieldId)
          .map((f) => f.customFieldId as string),
      ),
    [fields],
  );

  const toggleCore = (coreKey: (typeof formCoreKeys)[number]) => {
    setFields((prev) => {
      const existing = prev.find(
        (f) => f.kind === "core" && f.coreKey === coreKey,
      );
      if (existing) {
        if (coreKey === "firstName") {
          toast.error("First name is required on every form.");
          return prev;
        }
        return prev.filter((f) => f !== existing);
      }
      return [
        ...prev,
        {
          key: `core:${coreKey}`,
          kind: "core" as const,
          coreKey,
          required: coreKey === "email" || coreKey === "lastName",
          displayOrder: (prev.length + 1) * 10,
        },
      ];
    });
  };

  const toggleCustom = (fieldId: string) => {
    setFields((prev) => {
      const existing = prev.find(
        (f) => f.kind === "custom" && f.customFieldId === fieldId,
      );
      if (existing) {
        return prev.filter((f) => f !== existing);
      }
      return [
        ...prev,
        {
          key: `custom:${fieldId}`,
          kind: "custom" as const,
          customFieldId: fieldId,
          required: false,
          displayOrder: (prev.length + 1) * 10,
        },
      ];
    });
  };

  const setRequired = (key: string, required: boolean) => {
    setFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, required } : f)),
    );
  };

  const handleSave = () => {
    startTransition(async () => {
      const payload = {
        name,
        slug: slug || slugifyFormName(name),
        description,
        successMessage,
        allowIndexing,
        defaultAssignedManagerId: managerId === "none" ? "" : managerId,
        fields: fields.map((f, index) => ({
          ...f,
          displayOrder: (index + 1) * 10,
        })),
      };

      if (isEdit && initialData) {
        const result = await updateLeadFormAction(initialData.id, payload);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
        toast.success("Form saved");
        router.refresh();
        return;
      }

      const result = await createLeadFormAction(payload);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Form created");
      router.push(`/forms/edit/${result.formId}`);
      router.refresh();
    });
  };

  const handlePublish = () => {
    if (!initialData) return;
    startTransition(async () => {
      const result = await publishLeadFormAction(initialData.id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Form published");
      router.refresh();
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
      router.refresh();
    });
  };

  const copyPublicUrl = async () => {
    if (!initialData) return;
    const url = `${window.location.origin}${initialData.publicPath}`;
    await navigator.clipboard.writeText(url);
    toast.success("Public URL copied");
  };

  const readOnly = isEdit && !canUpdate;

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="form-name">Name</Label>
            <Input
              id="form-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!isEdit && !slug) {
                  setSlug(slugifyFormName(e.target.value));
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
              onChange={(e) => setSlug(e.target.value)}
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

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allowIndexing}
            onChange={(e) => setAllowIndexing(e.target.checked)}
            disabled={readOnly || pending}
          />
          Allow search engine indexing
        </label>

        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-medium">Core fields</h3>
            <p className="text-sm text-muted-foreground">
              Choose which standard lead fields appear on the public form.
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
              return (
                <div
                  key={coreKey}
                  className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleCore(coreKey)}
                      disabled={readOnly || pending || coreKey === "firstName"}
                    />
                    {coreFieldLabels[coreKey]}
                  </label>
                  {selected && config ? (
                    <label className="flex items-center gap-1 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={config.required}
                        onChange={(e) =>
                          setRequired(config.key, e.target.checked)
                        }
                        disabled={
                          readOnly || pending || coreKey === "firstName"
                        }
                      />
                      Required
                    </label>
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
                return (
                  <div
                    key={field.id}
                    className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleCustom(field.id)}
                        disabled={readOnly || pending}
                      />
                      {field.name}
                    </label>
                    {selected && config ? (
                      <label className="flex items-center gap-1 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={config.required}
                          onChange={(e) =>
                            setRequired(config.key, e.target.checked)
                          }
                          disabled={readOnly || pending}
                        />
                        Required
                      </label>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {initialData ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{initialData.status}</Badge>
            {initialData.status === "PUBLISHED" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyPublicUrl}
              >
                Copy public URL
              </Button>
            ) : null}
            <code className="text-xs text-muted-foreground">
              {initialData.publicPath}
            </code>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end gap-2 border-t">
        <Button type="button" variant="outline" asChild>
          <Link href="/forms">Cancel</Link>
        </Button>
        {!readOnly ? (
          <Button type="button" disabled={pending} onClick={handleSave}>
            {pending ? "Saving…" : isEdit ? "Save changes" : "Create form"}
          </Button>
        ) : null}
        {isEdit && canPublish && initialData?.status !== "PUBLISHED" ? (
          <Button type="button" disabled={pending} onClick={handlePublish}>
            Publish
          </Button>
        ) : null}
        {isEdit && canArchive && initialData?.status !== "ARCHIVED" ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={handleArchive}
          >
            Archive
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
