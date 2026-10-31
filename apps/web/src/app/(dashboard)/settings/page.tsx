"use client";
import { useEffect, useState } from "react";
import { Moon, ShieldCheck, Sun } from "lucide-react";
import { PageHeading } from "../_components/page-heading";
export default function SettingsPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => { setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark"); }, []);
  function choose(next: "dark" | "light") { setTheme(next); document.documentElement.dataset.theme = next; localStorage.setItem("mailshield-theme", next); }
  return <div className="page-stack"><PageHeading eyebrow="PREFERENCES" title="Settings" description="Manage the appearance and understand how this demo handles submitted content." />
    <section className="surface settings-surface"><div className="settings-heading"><div><p className="eyebrow">APPEARANCE</p><h2>Color theme</h2><p>Dark mode is enabled by default. Your choice is saved in this browser.</p></div></div>
      <div className="theme-options"><button className={`theme-option ${theme === "dark" ? "chosen" : ""}`} onClick={() => choose("dark")}><Moon size={18} /><span><strong>Dark</strong><small>Black background, white text</small></span></button><button className={`theme-option ${theme === "light" ? "chosen" : ""}`} onClick={() => choose("light")}><Sun size={18} /><span><strong>Light</strong><small>White background, black text</small></span></button></div>
    </section>
    <section className="surface settings-surface"><div className="settings-heading"><ShieldCheck size={20} /><div><p className="eyebrow">DATA HANDLING</p><h2>Privacy notes</h2></div></div><ul className="privacy-list"><li>Classification analytics stores labels, probabilities, inference duration, and timestamps.</li><li>The frontend does not save submitted email bodies in local storage.</li><li>AI generation, improvement, and security scan content is sent to your configured backend and AI provider.</li><li>Avoid submitting passwords, bank details, private keys, or other sensitive information.</li></ul></section>
  </div>;
}
