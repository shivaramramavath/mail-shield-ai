
import Link from "next/link";
import {
  ArrowUpRight,
  FileText,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  {
    title: "Analyze Email",
    description: "Detect spam and legitimate messages.",
    href: "/analyze",
    icon: ShieldCheck,
  },
  {
    title: "Generate Email",
    description: "Create professional emails with AI.",
    href: "/generate",
    icon: Mail,
  },
  {
    title: "Batch Analysis",
    description: "Classify multiple emails.",
    href: "/batch",
    icon: FileText,
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-md border">
                  <Icon className="size-4" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {action.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>

              <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
