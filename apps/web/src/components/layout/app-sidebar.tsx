
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  FileText,
  History,
  LayoutDashboard,
  Mail,
  MailPlus,
  ScanSearch,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Analyze Email",
    href: "/analyze",
    icon: ScanSearch,
  },
  {
    label: "Generate Email",
    href: "/generate",
    icon: MailPlus,
  },
  {
    label: "Improve Email",
    href: "/improve",
    icon: Mail,
  },
  {
    label: "Security Scan",
    href: "/security",
    icon: ShieldCheck,
  },
  {
    label: "Batch Analysis",
    href: "/batch",
    icon: FileText,
  },
  {
    label: "History",
    href: "/history",
    icon: History,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-card md:flex">
      <Link
        href="/dashboard"
        className="flex h-16 items-center gap-3 border-b px-6"
      >
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="size-5" />
        </div>

        <div>
          <h1 className="font-bold tracking-tight">MailShield AI</h1>
          <p className="text-xs text-muted-foreground">
            Email Intelligence
          </p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>

        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Activity className="size-4" />
            <span className="text-sm font-medium">Workspace status</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Anonymous session
          </p>
        </div>
      </div>
    </aside>
  );
}
