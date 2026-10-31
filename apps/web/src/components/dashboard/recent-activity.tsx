
"use client";

import { Clock, ShieldAlert, ShieldCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ClassificationBadge } from "@/components/email/classification-badge";

export interface ActivityItem {
  id: string;
  label: string;
  createdAt: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({
  activities,
}: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>

      <CardContent>
        {activities.length === 0 ? (
          <div className="py-8 text-center">
            <Clock className="mx-auto mb-3 size-7 text-muted-foreground" />
            <p className="text-sm font-medium">No recent activity</p>
            <p className="mt-1 text-xs text-muted-foreground">
              New analysis records will appear here when available.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border-b pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  {item.label.toLowerCase() === "spam" ? (
                    <ShieldAlert className="size-4" />
                  ) : (
                    <ShieldCheck className="size-4" />
                  )}

                  <div>
                    <ClassificationBadge label={item.label} />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
