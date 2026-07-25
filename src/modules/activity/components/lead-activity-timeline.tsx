import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ActivityDto } from "@/modules/activity/dto/activity.dto";

interface LeadActivityTimelineProps {
  activities: ActivityDto[];
  error?: string | null;
}

export function LeadActivityTimeline({
  activities,
  error,
}: LeadActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>
          Who changed what and when for this lead.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No activity yet. Business events will appear here.
          </p>
        ) : (
          <ol className="flex flex-col gap-0">
            {activities.map((item, index) => {
              const created = new Date(item.createdAt);
              return (
                <li
                  key={item.id}
                  className={`flex flex-col gap-1 py-3 ${
                    index < activities.length - 1 ? "border-b" : ""
                  }`}
                >
                  <p className="text-sm font-medium leading-snug">
                    {item.summary}
                  </p>
                  <time
                    dateTime={item.createdAt}
                    title={format(created, "PPpp")}
                    className="text-xs text-muted-foreground"
                  >
                    {formatDistanceToNow(created, { addSuffix: true })}
                  </time>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
