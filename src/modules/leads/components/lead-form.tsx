"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createLeadAction,
  updateLeadAction,
} from "@/app/(dashboard)/leads/actions";
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
  CustomFieldsFormSection,
  collectCustomValuesFromFormData,
} from "@/modules/custom-fields/components/custom-fields-form-section";
import type {
  LeadAssigneeOptionDto,
  LeadDetailDto,
  LeadSourceDto,
  LeadStatusDto,
} from "@/modules/leads/dto/lead.dto";

interface LeadFormProps {
  initialData?: LeadDetailDto;
  statuses: LeadStatusDto[];
  sources: LeadSourceDto[];
  memberOptions?: LeadAssigneeOptionDto[];
  managerOptions?: LeadAssigneeOptionDto[];
  canAssign?: boolean;
  customFields?: CustomFieldDto[];
}

export function LeadForm({
  initialData,
  statuses,
  sources,
  memberOptions = [],
  managerOptions = [],
  canAssign = false,
  customFields = [],
}: LeadFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = Boolean(initialData?.id);

  const defaultStatusId =
    initialData?.statusId ||
    statuses.find((status) => status.isDefault)?.id ||
    statuses[0]?.id ||
    "";

  const [statusId, setStatusId] = useState(defaultStatusId);
  const [sourceId, setSourceId] = useState(initialData?.sourceId ?? "none");
  const [assignedMemberId, setAssignedMemberId] = useState(
    initialData?.assignedMemberId ?? "none",
  );
  const [assignedManagerId, setAssignedManagerId] = useState(
    initialData?.assignedManagerId ?? "none",
  );

  const initialCustomValues = useMemo(() => {
    const map: Record<string, unknown> = {};
    for (const entry of initialData?.customValues ?? []) {
      map[entry.fieldId] = entry.value;
    }
    return map;
  }, [initialData?.customValues]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const customValues = collectCustomValuesFromFormData(formData);
    const data = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      company: String(formData.get("company") ?? ""),
      jobTitle: String(formData.get("jobTitle") ?? ""),
      website: String(formData.get("website") ?? ""),
      statusId,
      sourceId: sourceId === "none" ? "" : sourceId,
      description: String(formData.get("description") ?? ""),
      customValues,
      ...(canAssign
        ? {
            assignedMemberId:
              assignedMemberId === "none" ? "" : assignedMemberId,
            assignedManagerId:
              assignedManagerId === "none" ? "" : assignedManagerId,
          }
        : {}),
    };

    try {
      if (initialData?.id) {
        const result = await updateLeadAction(initialData.id, data);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
        toast.success("Lead updated successfully");
        router.push(`/leads/${initialData.id}`);
        router.refresh();
      } else {
        const result = await createLeadAction(data);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
        toast.success("Lead created successfully");
        router.push(`/leads/${result.leadId}`);
        router.refresh();
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-6 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Avery"
                defaultValue={initialData?.firstName}
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Brooks"
                defaultValue={initialData?.lastName}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="avery@company.com"
                defaultValue={initialData?.email ?? ""}
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 555 0100"
                defaultValue={initialData?.phone ?? ""}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                placeholder="Northstar Labs"
                defaultValue={initialData?.company ?? ""}
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="jobTitle">Job title</Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                placeholder="Head of Growth"
                defaultValue={initialData?.jobTitle ?? ""}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://example.com"
              defaultValue={initialData?.website ?? ""}
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="statusId">Status</Label>
              <Select
                value={statusId}
                onValueChange={setStatusId}
                disabled={isLoading || statuses.length === 0}
                required
              >
                <SelectTrigger id="statusId" className="w-full">
                  <SelectValue
                    placeholder={
                      statuses.length === 0
                        ? "No statuses configured"
                        : "Select status"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sourceId">Source</Label>
              <Select
                value={sourceId}
                onValueChange={setSourceId}
                disabled={isLoading}
              >
                <SelectTrigger id="sourceId" className="w-full">
                  <SelectValue placeholder="Unspecified" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">Unspecified</SelectItem>
                    {sources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {canAssign ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="assignedManagerId">Assigned manager</Label>
                <Select
                  value={assignedManagerId}
                  onValueChange={setAssignedManagerId}
                  disabled={isLoading}
                >
                  <SelectTrigger id="assignedManagerId" className="w-full">
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
                <Label htmlFor="assignedMemberId">Assigned member</Label>
                <Select
                  value={assignedMemberId}
                  onValueChange={setAssignedMemberId}
                  disabled={isLoading}
                >
                  <SelectTrigger id="assignedMemberId" className="w-full">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {memberOptions.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}

          <CustomFieldsFormSection
            fields={customFields}
            initialValues={initialCustomValues}
            disabled={isLoading}
          />

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Notes</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Context, next steps, or anything the team should know..."
              defaultValue={initialData?.description ?? ""}
              rows={5}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t">
          <Button type="button" variant="outline" asChild>
            <Link
              href={initialData?.id ? `/leads/${initialData.id}` : "/leads"}
            >
              Cancel
            </Link>
          </Button>
          <Button type="submit" disabled={isLoading || statuses.length === 0}>
            {isLoading ? "Saving..." : isEdit ? "Save changes" : "Create lead"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
