"use client";

import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LeadListItemDto } from "@/server/dto/lead.dto";

export function LeadTable({ leads }: { leads: LeadListItemDto[] }) {
  const router = useRouter();

  if (!leads.length) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed bg-card">
        <div className="flex flex-col items-center gap-1 px-6 text-center">
          <p className="text-sm font-medium">No leads found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting filters or create a new lead.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/leads/${lead.id}`)}
            >
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {lead.firstName} {lead.lastName}
                  </span>
                  {lead.email ? (
                    <span className="text-xs text-muted-foreground">
                      {lead.email}
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>{lead.company || "—"}</TableCell>
              <TableCell>
                {lead.status ? (
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: `${lead.status.color}20`,
                      color: lead.status.color,
                      borderColor: lead.status.color,
                    }}
                  >
                    {lead.status.name}
                  </Badge>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>{lead.source?.name || "—"}</TableCell>
              <TableCell>{lead.assignedMember?.name || "Unassigned"}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(lead.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
