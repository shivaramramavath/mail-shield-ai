"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowUpRight, LoaderCircle, ScanSearch, ShieldCheck } from "lucide-react";
import { api, type Overview, type RecentAnalysis } from "@/lib/api";
import { PageHeading } from "./page-heading";

export function DashboardOverview() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [recent, setRecent] = useState<RecentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function refresh() {
    setLoading(true); setError("");
    try {
      const [stats, rows] = await Promise.all([api.overview(), api.recent()]);
      setOverview(stats); setRecent(rows);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load analytics."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, []);
  return <div className="page-stack">
    <PageHeading eyebrow="WORKSPACE OVERVIEW" title="Email intelligence, clearly." description="A focused workspace for classification, AI-assisted writing, and email security review." />
    <div className="quick-grid">
      <Link href="/analyze" className="quick-card"><span className="quick-icon"><ScanSearch size={19} /></span><strong>Analyze an email</strong><p>Classify a message as spam or legitimate.</p><span className="quick-arrow"><ArrowUpRight size={16} /></span></Link>
      <Link href="/batch" className="quick-card"><span className="quick-icon"><Activity size={19} /></span><strong>Batch analysis</strong><p>Process up to 20 emails in one request.</p><span className="quick-arrow"><ArrowUpRight size={16} /></span></Link>
      <Link href="/security" className="quick-card"><span className="quick-icon"><ShieldCheck size={19} /></span><strong>Security scan</strong><p>Review suspicious language and tactics.</p><span className="quick-arrow"><ArrowUpRight size={16} /></span></Link>
    </div>
    <section className="surface analytics-surface">
      <div className="section-title"><div><p className="eyebrow">ANALYTICS</p><h2>Classification activity</h2></div><button className="secondary-button" onClick={refresh} disabled={loading}>{loading ? <LoaderCircle size={15} className="spin" /> : "Refresh"}</button></div>
      {error && <p className="field-error">{error}</p>}
      {overview ? <div className="stats-grid">
        <div className="stat"><span>Total analyzed</span><strong>{overview.total.toLocaleString()}</strong></div>
        <div className="stat"><span>Spam detected</span><strong>{overview.spam.toLocaleString()}</strong></div>
        <div className="stat"><span>Legitimate</span><strong>{overview.ham.toLocaleString()}</strong></div>
        <div className="stat"><span>Average inference</span><strong>{overview.avgDurationMs}<small> ms</small></strong></div>
      </div> : loading ? <div className="loading-line"><LoaderCircle size={17} className="spin" /> Loading analytics…</div> : <p className="muted-copy">Analytics are not available right now.</p>}
      {overview && <div className="distribution"><div className="distribution-head"><span>Classification distribution</span><strong>{overview.total ? `${(overview.spam / overview.total * 100).toFixed(1)}% spam` : "No data yet"}</strong></div><div className="distribution-track"><span style={{ width: `${overview.total ? overview.spam / overview.total * 100 : 0}%` }} /></div><div className="distribution-legend"><span>Spam <b>{overview.spam}</b></span><span>Ham <b>{overview.ham}</b></span></div></div>}
    </section>
    <section className="surface recent-surface">
      <div className="section-title"><div><p className="eyebrow">ACTIVITY</p><h2>Recent analyses</h2></div><Link href="/history" className="text-link">View history <ArrowUpRight size={14} /></Link></div>
      {recent.length ? <div className="recent-table">{recent.map(row => <div className="recent-row" key={row.id}><span className={`result-label ${row.label}`}>{row.label.toUpperCase()}</span><div className="recent-info"><strong>{row.label === "spam" ? "Spam classification" : "Legitimate classification"}</strong><small>{new Date(row.createdAt).toLocaleString()}</small></div><span className="recent-prob">{(row.spamProbability * 100).toFixed(1)}% spam</span><span className="recent-duration">{row.durationMs.toFixed(1)} ms</span></div>)}</div> : <p className="muted-copy">{loading ? "Loading recent activity…" : "No analysis history yet. Run your first email analysis."}</p>}
    </section>
  </div>;
}
