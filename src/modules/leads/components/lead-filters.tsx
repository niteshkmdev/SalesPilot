"use client";

import { ListFilter } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  DateRangePicker,
  type DateRangeValue,
} from "@/components/date-range-picker";
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
import type {
  LeadAssigneeOptionDto,
  LeadSourceDto,
  LeadStatusDto,
} from "@/modules/leads";
import { DateRangePreset } from "@/shared/dates";

interface LeadFiltersProps {
  statuses: LeadStatusDto[];
  sources: LeadSourceDto[];
  memberOptions: LeadAssigneeOptionDto[];
  managerOptions: LeadAssigneeOptionDto[];
  canFilterAssignees?: boolean;
  q?: string;
  statusId?: string;
  sourceId?: string;
  assignedMemberId?: string;
  assignedManagerId?: string;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  isDuplicate?: boolean;
  sort?: string;
  order?: string;
  limit?: number;
}

function countActiveFilters(props: {
  statusId?: string;
  sourceId?: string;
  assignedMemberId?: string;
  assignedManagerId?: string;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  isDuplicate?: boolean;
  canFilterAssignees: boolean;
}): number {
  let count = 0;
  if (props.statusId) count += 1;
  if (props.sourceId) count += 1;
  if (props.canFilterAssignees && props.assignedMemberId) count += 1;
  if (props.canFilterAssignees && props.assignedManagerId) count += 1;
  if (props.createdFrom) count += 1;
  if (props.createdTo) count += 1;
  if (props.updatedFrom) count += 1;
  if (props.updatedTo) count += 1;
  if (props.isDuplicate !== undefined) count += 1;
  return count;
}

export function LeadFilters({
  statuses,
  sources,
  memberOptions,
  managerOptions,
  canFilterAssignees = false,
  q = "",
  statusId = "",
  sourceId = "",
  assignedMemberId = "",
  assignedManagerId = "",
  createdFrom = "",
  createdTo = "",
  updatedFrom = "",
  updatedTo = "",
  isDuplicate,
  sort = "updatedAt",
  order = "desc",
  limit = 25,
}: LeadFiltersProps) {
  const activeCount = countActiveFilters({
    statusId,
    sourceId,
    assignedMemberId: canFilterAssignees ? assignedMemberId : undefined,
    assignedManagerId: canFilterAssignees ? assignedManagerId : undefined,
    createdFrom,
    createdTo,
    updatedFrom,
    updatedTo,
    isDuplicate,
    canFilterAssignees,
  });

  const [statusValue, setStatusValue] = useState(statusId || "all");
  const [sourceValue, setSourceValue] = useState(sourceId || "all");
  const [memberValue, setMemberValue] = useState(assignedMemberId || "all");
  const [managerValue, setManagerValue] = useState(assignedManagerId || "all");
  const [duplicateValue, setDuplicateValue] = useState(
    isDuplicate === undefined ? "all" : isDuplicate ? "true" : "false",
  );
  const [createdRange, setCreatedRange] = useState<DateRangeValue>({
    preset: DateRangePreset.CUSTOM,
    startDate: createdFrom,
    endDate: createdTo,
  });
  const [updatedRange, setUpdatedRange] = useState<DateRangeValue>({
    preset: DateRangePreset.CUSTOM,
    startDate: updatedFrom,
    endDate: updatedTo,
  });

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
            <SheetTitle>Filter leads</SheetTitle>
            <SheetDescription>
              Narrow the list by status, ownership, dates, and more.
            </SheetDescription>
          </SheetHeader>

          <form
            method="get"
            className="flex min-h-0 flex-1 flex-col"
            id="lead-filters-form"
          >
            <input type="hidden" name="q" value={q} />
            <input type="hidden" name="sort" value={sort} />
            <input type="hidden" name="order" value={order} />
            <input type="hidden" name="limit" value={String(limit)} />
            <input
              type="hidden"
              name="statusId"
              value={statusValue === "all" ? "" : statusValue}
            />
            <input
              type="hidden"
              name="sourceId"
              value={sourceValue === "all" ? "" : sourceValue}
            />
            <input
              type="hidden"
              name="assignedMemberId"
              value={
                canFilterAssignees && memberValue !== "all" ? memberValue : ""
              }
            />
            <input
              type="hidden"
              name="assignedManagerId"
              value={
                canFilterAssignees && managerValue !== "all" ? managerValue : ""
              }
            />
            <input
              type="hidden"
              name="isDuplicate"
              value={duplicateValue === "all" ? "" : duplicateValue}
            />

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="statusId">Status</Label>
                <Select value={statusValue} onValueChange={setStatusValue}>
                  <SelectTrigger id="statusId" className="w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All statuses</SelectItem>
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
                <Select value={sourceValue} onValueChange={setSourceValue}>
                  <SelectTrigger id="sourceId" className="w-full">
                    <SelectValue placeholder="All sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All sources</SelectItem>
                      {sources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {canFilterAssignees ? (
                <>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="assignedManagerId">Assigned manager</Label>
                    <Select
                      value={managerValue}
                      onValueChange={setManagerValue}
                    >
                      <SelectTrigger id="assignedManagerId" className="w-full">
                        <SelectValue placeholder="Anyone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">Anyone</SelectItem>
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
                    <Select value={memberValue} onValueChange={setMemberValue}>
                      <SelectTrigger id="assignedMemberId" className="w-full">
                        <SelectValue placeholder="Anyone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">Anyone</SelectItem>
                          {memberOptions.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : null}

              <div className="flex flex-col gap-2">
                <Label htmlFor="isDuplicate">Duplicate</Label>
                <Select
                  value={duplicateValue}
                  onValueChange={setDuplicateValue}
                >
                  <SelectTrigger id="isDuplicate" className="w-full">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">Duplicates only</SelectItem>
                      <SelectItem value="false">Non-duplicates</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="created-range">Created range</Label>
                  <DateRangePicker
                    id="created-range"
                    align="start"
                    startName="createdFrom"
                    endName="createdTo"
                    placeholder="Any created dates"
                    value={createdRange}
                    onChange={setCreatedRange}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="updated-range">Updated range</Label>
                  <DateRangePicker
                    id="updated-range"
                    align="start"
                    startName="updatedFrom"
                    endName="updatedTo"
                    placeholder="Any updated dates"
                    value={updatedRange}
                    onChange={setUpdatedRange}
                  />
                </div>
              </div>
            </div>

            <SheetFooter className="border-t">
              {activeCount > 0 ? (
                <Button type="button" variant="outline" asChild>
                  <Link
                    href={q ? `/leads?q=${encodeURIComponent(q)}` : "/leads"}
                  >
                    Clear filters
                  </Link>
                </Button>
              ) : null}
              <Button type="submit">Apply filters</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {activeCount > 0 ? (
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link href={q ? `/leads?q=${encodeURIComponent(q)}` : "/leads"}>
            Clear
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
