"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  createLeadAction,
  updateLeadAction,
} from "@/app/(dashboard)/leads/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  LeadDetailDto,
  LeadSourceDto,
  LeadStatusDto,
} from "@/server/dto/lead.dto";

interface LeadFormProps {
  initialData?: LeadDetailDto;
  statuses: LeadStatusDto[];
  sources: LeadSourceDto[];
}

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

export function LeadForm({ initialData, statuses, sources }: LeadFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = Boolean(initialData?.id);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      company: String(formData.get("company") ?? ""),
      jobTitle: String(formData.get("jobTitle") ?? ""),
      website: String(formData.get("website") ?? ""),
      statusId: String(formData.get("statusId") ?? ""),
      sourceId: String(formData.get("sourceId") ?? ""),
      description: String(formData.get("description") ?? ""),
    };

    try {
      if (initialData?.id) {
        await updateLeadAction(initialData.id, data);
        toast.success("Lead updated successfully");
        router.push(`/leads/${initialData.id}`);
        router.refresh();
      } else {
        const res = await createLeadAction(data);
        toast.success("Lead created successfully");
        router.push(`/leads/${res.leadId}`);
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

  const defaultStatusId =
    initialData?.statusId ||
    statuses.find((status) => status.isDefault)?.id ||
    statuses[0]?.id ||
    "";

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader className="border-b">
        <CardTitle>{isEdit ? "Lead details" : "Lead details"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Update contact info, status, and notes for this lead."
            : "Capture contact info and place the lead in your pipeline."}
        </CardDescription>
      </CardHeader>
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
              <select
                id="statusId"
                name="statusId"
                defaultValue={defaultStatusId}
                className={selectClassName}
                required
                disabled={isLoading || statuses.length === 0}
              >
                {statuses.length === 0 ? (
                  <option value="">No statuses configured</option>
                ) : (
                  statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sourceId">Source</Label>
              <select
                id="sourceId"
                name="sourceId"
                defaultValue={initialData?.sourceId ?? ""}
                className={selectClassName}
                disabled={isLoading}
              >
                <option value="">Unspecified</option>
                {sources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
