"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateOrganizationAction } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OrganizationFormProps {
  name: string;
  slug: string;
}

export function OrganizationForm({ name, slug }: OrganizationFormProps) {
  const router = useRouter();
  const [orgName, setOrgName] = useState(name);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateOrganizationAction({ name: orgName });
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Organization updated");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="orgName">Organization Name</Label>
          <Input
            id="orgName"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
            minLength={2}
            maxLength={100}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="orgSlug">Slug</Label>
          <Input id="orgSlug" value={slug} disabled className="bg-muted" />
          <p className="text-sm text-muted-foreground">
            The slug is permanent for this workspace.
          </p>
        </div>
      </div>
      <Button type="submit" disabled={pending || orgName.trim().length < 2}>
        {pending ? "Saving…" : "Update Organization"}
      </Button>
    </form>
  );
}
