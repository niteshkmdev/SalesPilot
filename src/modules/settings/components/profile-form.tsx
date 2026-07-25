"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { setPasswordAction } from "@/app/(dashboard)/settings/actions";
import { PhoneInput } from "@/components/phone-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import {
  genderFromSelectValue,
  normalizeGenderSelectValue,
  USER_GENDER_OPTIONS,
} from "@/modules/settings/constants/gender";
import { uploadImageViaPresign } from "@/modules/storage/client/upload-image";
import { UploadPurpose } from "@/modules/storage/dto/upload.dto";
import { optionalPhoneFieldError } from "@/shared/phone";

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    image: string | null;
    phone: string | null;
    gender: string | null;
  };
  hasCredential: boolean;
  hasGoogle: boolean;
  canUnlinkGoogle: boolean;
}

function initialsFromName(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

export function ProfileForm({
  user,
  hasCredential: initialHasCredential,
  hasGoogle: initialHasGoogle,
  canUnlinkGoogle: initialCanUnlinkGoogle,
}: ProfileFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [gender, setGender] = useState(normalizeGenderSelectValue(user.gender));
  const [image, setImage] = useState<string | null>(user.image);
  const [uploading, setUploading] = useState(false);

  const [hasCredential, setHasCredential] = useState(initialHasCredential);
  const [hasGoogle, setHasGoogle] = useState(initialHasGoogle);
  const [canUnlinkGoogle, setCanUnlinkGoogle] = useState(
    initialCanUnlinkGoogle,
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [linkBusy, setLinkBusy] = useState(false);

  const onSelectAvatar = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const publicUrl = await uploadImageViaPresign({
        file,
        purpose: UploadPurpose.USER_AVATAR,
      });
      const { error } = await authClient.updateUser({ image: publicUrl });
      if (error) {
        toast.error(error.message || "Failed to save photo.");
        return;
      }
      setImage(publicUrl);
      toast.success("Photo updated");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload photo.",
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onRemoveAvatar = () => {
    startTransition(async () => {
      const { error } = await authClient.updateUser({ image: null });
      if (error) {
        toast.error(error.message || "Failed to remove photo.");
        return;
      }
      setImage(null);
      toast.success("Photo removed");
      router.refresh();
    });
  };

  const onSaveBasics = (event: React.FormEvent) => {
    event.preventDefault();
    const phoneErr = optionalPhoneFieldError(phone);
    if (phoneErr) {
      setPhoneError(phoneErr);
      toast.error(phoneErr);
      return;
    }

    startTransition(async () => {
      const genderValue = genderFromSelectValue(gender);
      const { error } = await authClient.updateUser({
        name: name.trim(),
        phone: phone.trim() || null,
        gender: genderValue,
      });
      if (error) {
        toast.error(error.message || "Failed to update profile.");
        return;
      }
      toast.success("Profile updated");
      router.refresh();
    });
  };

  const onChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setPasswordBusy(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });
      if (error) {
        toast.error(error.message || "Failed to change password.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
    } catch {
      toast.error("Failed to change password.");
    } finally {
      setPasswordBusy(false);
    }
  };

  const onSetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setPasswordBusy(true);
    try {
      const result = await setPasswordAction(newPassword);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      setHasCredential(true);
      setCanUnlinkGoogle(true);
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password set. You can sign in with email too.");
      router.refresh();
    } catch {
      toast.error("Failed to set password.");
    } finally {
      setPasswordBusy(false);
    }
  };

  const onLinkGoogle = async () => {
    setLinkBusy(true);
    try {
      const { error } = await authClient.linkSocial({
        provider: "google",
        callbackURL: "/settings/profile",
      });
      if (error) {
        toast.error(
          error.message ||
            "Could not link Google. Use the same email as this account.",
        );
        setLinkBusy(false);
      }
      // Redirect expected on success
    } catch {
      toast.error("Could not start Google linking.");
      setLinkBusy(false);
    }
  };

  const onUnlinkGoogle = async () => {
    if (!canUnlinkGoogle) {
      toast.error(
        "Set a password before disconnecting Google so you can still sign in.",
      );
      return;
    }
    setLinkBusy(true);
    try {
      const { error } = await authClient.unlinkAccount({
        providerId: "google",
      });
      if (error) {
        toast.error(error.message || "Failed to disconnect Google.");
        return;
      }
      setHasGoogle(false);
      toast.success("Google disconnected");
      router.refresh();
    } catch {
      toast.error("Failed to disconnect Google.");
    } finally {
      setLinkBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Photo</CardTitle>
          <CardDescription>
            Shown in the sidebar. Google photo is used until you upload your
            own.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="size-16" size="lg">
            {image ? <AvatarImage src={image} alt={name} /> : null}
            <AvatarFallback className="text-base">
              {initialsFromName(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => void onSelectAvatar(e.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading || pending}
              onClick={() => fileRef.current?.click()}
            >
              {uploading
                ? "Uploading…"
                : image
                  ? "Change photo"
                  : "Upload photo"}
            </Button>
            {image ? (
              <Button
                type="button"
                variant="ghost"
                disabled={uploading || pending}
                onClick={onRemoveAvatar}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
          <CardDescription>
            How teammates see your name and contact details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSaveBasics} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                Used for login. It cannot be changed here.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                minLength={1}
                maxLength={100}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <PhoneInput
                id="phone"
                defaultValue={user.phone}
                onValueChange={setPhone}
                error={phoneError}
                onErrorChange={setPhoneError}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender" className="w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {USER_GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={pending || !name.trim()}>
              {pending ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            {hasCredential
              ? "Change the password for email sign-in."
              : "Add a password so you can sign in without Google."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={hasCredential ? onChangePassword : onSetPassword}
            className="flex flex-col gap-4"
          >
            {hasCredential ? (
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="newPassword">
                {hasCredential ? "New password" : "Password"}
              </Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                maxLength={128}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                maxLength={128}
              />
            </div>
            <Button type="submit" disabled={passwordBusy}>
              {passwordBusy
                ? "Saving…"
                : hasCredential
                  ? "Change password"
                  : "Set password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Google</CardTitle>
          <CardDescription>
            Connect Google with the same email as this account. Disconnect is
            blocked if it would leave you with no sign-in method.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {hasGoogle ? "Google is connected." : "Google is not connected."}
          </p>
          <div className="flex flex-wrap gap-2">
            {hasGoogle ? (
              <Button
                type="button"
                variant="outline"
                disabled={linkBusy || !canUnlinkGoogle}
                onClick={() => void onUnlinkGoogle()}
              >
                {linkBusy ? "Working…" : "Disconnect"}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                disabled={linkBusy}
                onClick={() => void onLinkGoogle()}
              >
                {linkBusy ? "Redirecting…" : "Connect Google"}
              </Button>
            )}
          </div>
          {hasGoogle && !canUnlinkGoogle ? (
            <p className="text-sm text-muted-foreground sm:basis-full">
              Set a password before disconnecting Google.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
