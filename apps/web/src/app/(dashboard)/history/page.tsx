"use client";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { api, type RecentAnalysis } from "@/lib/api";
import { PageHeading } from "../_components/page-heading";
export default function HistoryPage() {
  const [rows, setRows] = useState<RecentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { api.recent().then(setRows).catch(e => setError(e instanceof Error ? e.message : "Could not load history.")).finally(() => setLoading(false)); }, []);
  return <div className="page-stack"><PageHeading eyebrow="ACTIVITY LOG" title="Analysis history" description="Recent classification records. Stored records contain metadata, not the original email body." />
    <section className="surface recent-surface"><div className="section-title"><div><p className="eyebrow">RECENT RECORDS</p><h2>Past analyses</h2></div><span className="subtle-count">{rows.length} records</span></div>
      {loading ? <div className="loading-line"><LoaderCircle size={17} className="spin" /> Loading history…</div> : error ? <p className="field-error">{error}</p> : rows.length ? <div className="recent-table">{rows.map(row => <div className="recent-row" key={row.id}><span className={`result-label ${row.label}`}>{row.label.toUpperCase()}</span><div className="recent-info"><strong>{row.label === "spam" ? "Spam classification" : "Legitimate classification"}</strong><small>{new Date(row.createdAt).toLocaleString()}</small></div><span className="recent-prob">{(row.spamProbability * 100).toFixed(1)}% spam</span><span className="recent-duration">{row.durationMs.toFixed(1)} ms</span></div>)}</div> : <p className="muted-copy">No history is available yet.</p>}
    </section>
  </div>;
}
