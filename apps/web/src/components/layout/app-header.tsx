
"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { MobileSidebar } from "./mobile-sidebar";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/analyze": "Analyze Email",
  "/generate": "Generate Email",
  "/improve": "Improve Email",
  "/security": "Security Scanner",
  "/batch": "Batch Analysis",
  "/history": "History",
  "/settings": "Settings",
};

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/90 px-5 backdrop-blur md:px-8">
      <MobileSidebar />
      <div>
        <p className="text-sm font-semibold">
          {titles[pathname] || "MailShield AI"}
        </p>
        <p className="text-xs text-muted-foreground">
          AI-powered email protection
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-muted-foreground sm:block">
          No account required
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
