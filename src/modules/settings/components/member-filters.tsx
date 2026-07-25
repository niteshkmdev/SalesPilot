"use client";

import { ListFilter } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { RoleOptionDto } from "@/modules/organizations/dto/member.dto";

interface MemberFiltersProps {
  roles: RoleOptionDto[];
  q?: string;
  roleId?: string;
}

export function MemberFilters({
  roles,
  q = "",
  roleId = "",
}: MemberFiltersProps) {
  const activeCount = roleId ? 1 : 0;
  const [roleValue, setRoleValue] = useState(roleId || "all");
  const clearHref = q
    ? `/settings/members?q=${encodeURIComponent(q)}`
    : "/settings/members";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button type="button" variant="outline">
            <ListFilter data-icon="inline-start" />
            Filters
            {activeCount > 0 ? (
              <Badge variant="secondary" className="ml-1">
                {activeCount}
              </Badge>
            ) : null}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-hidden p-0 sm:max-w-md"
        >
          <SheetHeader>
            <SheetTitle>Filter members</SheetTitle>
            <SheetDescription>
              Narrow the list by organization role.
            </SheetDescription>
          </SheetHeader>

          <form
            method="get"
            action="/settings/members"
            className="flex min-h-0 flex-1 flex-col"
            id="member-filters-form"
          >
            <input type="hidden" name="q" value={q} />
            <input
              type="hidden"
              name="roleId"
              value={roleValue === "all" ? "" : roleValue}
            />

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="roleId">Role</Label>
                <Select value={roleValue} onValueChange={setRoleValue}>
                  <SelectTrigger id="roleId" className="w-full">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All roles</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SheetFooter className="border-t">
              {activeCount > 0 ? (
                <Button type="button" variant="outline" asChild>
                  <Link href={clearHref}>Clear filters</Link>
                </Button>
              ) : null}
              <Button type="submit">Apply filters</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {activeCount > 0 ? (
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link href={clearHref}>Clear</Link>
        </Button>
      ) : null}
    </div>
  );
}
