"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity, BarChart3, FileText, History, LayoutDashboard, Mail,
  Moon, ScanSearch, Settings2, ShieldCheck, Sun, WandSparkles,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/analyze", label: "Analyze email", icon: ScanSearch },
  { href: "/batch", label: "Batch analysis", icon: Activity },
  { href: "/generate", label: "Generate email", icon: WandSparkles },
  { href: "/improve", label: "Improve writing", icon: FileText },
  { href: "/security", label: "Security scan", icon: ShieldCheck },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem("mailshield-theme");
    const initial = saved === "light" ? "light" : "dark";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("mailshield-theme", next);
  }

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand">
          <span className="brand-icon"><ShieldCheck size={19} /></span>
          <span>mailshield<span className="brand-muted">.ai</span></span>
        </Link>
        <div className="side-caption">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
            return (
              <Link href={href} key={href} className={`side-link ${active ? "active" : ""}`}>
                <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-card"><ShieldCheck size={16} /><div><strong>Privacy first</strong><p>Analytics stores classification metadata, not email bodies.</p></div></div>
          <div className="sidebar-foot">MAILSHIELD AI <span>·</span> PERSONAL WORKSPACE</div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="topbar-label"><span className="live-dot" /> EMAIL INTELLIGENCE</div>
          <button className="theme-button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
        </header>
        <main className="page-content">{children}</main>
      </section>
    </div>
  );
}
