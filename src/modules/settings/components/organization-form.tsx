"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  updateOrganizationAction,
  updateOrganizationLogoAction,
} from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadImageViaPresign } from "@/modules/storage/client/upload-image";
import { UploadPurpose } from "@/modules/storage/dto/upload.dto";

interface OrganizationFormProps {
  name: string;
  slug: string;
  logo: string | null;
  canUpdateBranding: boolean;
}

export function OrganizationForm({
  name,
  slug,
  logo: initialLogo,
  canUpdateBranding,
}: OrganizationFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [orgName, setOrgName] = useState(name);
  const [logo, setLogo] = useState<string | null>(initialLogo);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

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

  const onSelectLogo = async (file: File | undefined) => {
    if (!file || !canUpdateBranding) return;
    setUploading(true);
    try {
      const publicUrl = await uploadImageViaPresign({
        file,
        purpose: UploadPurpose.ORG_LOGO,
      });
      const result = await updateOrganizationLogoAction(publicUrl);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      setLogo(publicUrl);
      toast.success("Logo updated");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload logo.",
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onRemoveLogo = () => {
    if (!canUpdateBranding) return;
    startTransition(async () => {
      const result = await updateOrganizationLogoAction(null);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      setLogo(null);
      toast.success("Logo removed");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {canUpdateBranding ? (
        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
            <CardDescription>
              Shown in the dashboard header and on public lead forms.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex size-16 items-center justify-center overflow-hidden rounded-full border bg-muted">
              {logo ? (
                <Image
                  src={logo}
                  alt={`${orgName} logo`}
                  width={64}
                  height={64}
                  className="size-16 object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  {orgName
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0]?.toUpperCase() ?? "")
                    .join("") || "OR"}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => void onSelectLogo(e.target.files?.[0])}
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading || pending}
                onClick={() => fileRef.current?.click()}
              >
                {uploading
                  ? "Uploading…"
                  : logo
                    ? "Change logo"
                    : "Upload logo"}
              </Button>
              {logo ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={uploading || pending}
                  onClick={onRemoveLogo}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Workspace name and permanent slug.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
            <Button
              type="submit"
              disabled={pending || orgName.trim().length < 2}
            >
              {pending ? "Saving…" : "Update Organization"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
