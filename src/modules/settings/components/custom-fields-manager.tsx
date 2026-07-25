"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createCustomFieldAction,
  deactivateCustomFieldAction,
  updateCustomFieldAction,
} from "@/app/(dashboard)/settings/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type CustomFieldDto,
  type MvpCustomFieldType,
  mvpCustomFieldTypes,
} from "@/modules/custom-fields/dto/custom-field.dto";

const typeLabels: Record<MvpCustomFieldType, string> = {
  TEXT: "Text",
  TEXTAREA: "Long text",
  EMAIL: "Email",
  PHONE: "Phone",
  NUMBER: "Number",
};

interface CustomFieldsManagerProps {
  fields: CustomFieldDto[];
  canManage: boolean;
}

export function CustomFieldsManager({
  fields,
  canManage,
}: CustomFieldsManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<MvpCustomFieldType>("TEXT");
  const [required, setRequired] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [helpText, setHelpText] = useState("");

  const resetCreate = () => {
    setName("");
    setType("TEXT");
    setRequired(false);
    setPlaceholder("");
    setHelpText("");
  };

  const handleCreate = () => {
    startTransition(async () => {
      const result = await createCustomFieldAction({
        name,
        type,
        required,
        placeholder,
        helpText,
      });
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Custom field created");
      setCreateOpen(false);
      resetCreate();
      router.refresh();
    });
  };

  const handleToggleActive = (field: CustomFieldDto) => {
    startTransition(async () => {
      const result = field.active
        ? await deactivateCustomFieldAction(field.id)
        : await updateCustomFieldAction(field.id, { active: true });
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(field.active ? "Field deactivated" : "Field reactivated");
      router.refresh();
    });
  };

  const handleToggleRequired = (field: CustomFieldDto) => {
    startTransition(async () => {
      const result = await updateCustomFieldAction(field.id, {
        required: !field.required,
      });
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Field updated");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Define extra fields that appear on leads and can be added to public
          forms.
        </p>
        {canManage ? (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button type="button">Add field</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New custom field</DialogTitle>
                <DialogDescription>
                  Choose a label and type. Type cannot be changed after create.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cf-name">Name</Label>
                  <Input
                    id="cf-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Industry"
                    maxLength={80}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cf-type">Type</Label>
                  <Select
                    value={type}
                    onValueChange={(value) =>
                      setType(value as MvpCustomFieldType)
                    }
                  >
                    <SelectTrigger id="cf-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {mvpCustomFieldTypes.map((option) => (
                          <SelectItem key={option} value={option}>
                            {typeLabels[option]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cf-placeholder">Placeholder</Label>
                  <Input
                    id="cf-placeholder"
                    value={placeholder}
                    onChange={(e) => setPlaceholder(e.target.value)}
                    maxLength={160}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cf-help">Help text</Label>
                  <Input
                    id="cf-help"
                    value={helpText}
                    onChange={(e) => setHelpText(e.target.value)}
                    maxLength={280}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={required}
                    onChange={(e) => setRequired(e.target.checked)}
                  />
                  Required
                </label>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={pending || name.trim().length < 1}
                  onClick={handleCreate}
                >
                  {pending ? "Creating…" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      {fields.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No custom fields yet.
          {canManage ? " Add one to collect extra lead details." : ""}
        </p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Status</TableHead>
                {canManage ? (
                  <TableHead className="text-right">Actions</TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <div className="font-medium">{field.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {field.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    {typeLabels[field.type as MvpCustomFieldType] ?? field.type}
                  </TableCell>
                  <TableCell>
                    {canManage ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        onClick={() => handleToggleRequired(field)}
                      >
                        {field.required ? "Yes" : "No"}
                      </Button>
                    ) : field.required ? (
                      "Yes"
                    ) : (
                      "No"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={field.active ? "secondary" : "outline"}>
                      {field.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() => handleToggleActive(field)}
                      >
                        {field.active ? "Deactivate" : "Reactivate"}
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
