"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowUpRight, BarChart3, Check, ChevronRight,
  Clipboard, FileText, Gauge, LayoutDashboard, LoaderCircle, Mail,
  ScanSearch, ShieldCheck, Sparkles, WandSparkles, X,
} from "lucide-react";
import { mailshieldApi, type Overview, type Prediction, type RecentAnalysis } from "@/lib/api";

type Tool = "analyze" | "generate" | "improve" | "security" | "batch" | "analytics";
const tools: Array<{ id: Tool; label: string; description: string; icon: typeof Mail }> = [
  { id: "analyze", label: "Analyze email", description: "Detect spam and legitimate messages", icon: ScanSearch },
  { id: "generate", label: "Generate email", description: "Draft an email with AI", icon: WandSparkles },
  { id: "improve", label: "Improve writing", description: "Refine clarity and tone", icon: FileText },
  { id: "security", label: "Security scan", description: "Review phishing and social-engineering signals", icon: ShieldCheck },
  { id: "batch", label: "Batch analysis", description: "Analyze up to 20 emails", icon: Activity },
  { id: "analytics", label: "Analytics", description: "Anonymous aggregate activity", icon: BarChart3 },
];
const descriptions: Record<Tool, string> = {
  analyze: "Paste an email to estimate whether it resembles spam or legitimate mail.",
  generate: "Describe the message you need. The AI will draft it without sending anything.",
  improve: "Paste a draft to improve grammar, clarity, and structure while preserving its meaning.",
  security: "Review suspicious wording and social-engineering indicators. This is not a technical sender or URL verification.",
  batch: "Paste one email per line. The backend accepts up to 20 messages per request.",
  analytics: "View aggregate classification counts. Email bodies are not included in analytics.",
};
function Percent({ value }: { value: number }) { return <>{(Math.max(0, Math.min(1, value)) * 100).toFixed(1)}%</>; }
function ResultPanel({ children, title = "Result" }: { children: React.ReactNode; title?: string }) {
  return <div className="result-panel"><div className="result-heading"><span>{title}</span><span className="result-dot" /></div>{children}</div>;
}
function PredictionCard({ prediction }: { prediction: Prediction }) {
  const spam = prediction.label === "spam";
  return <div className="prediction-card">
    <div className="prediction-top"><div><p className="eyebrow">CLASSIFICATION</p><h3 className={`prediction-label ${spam ? "spam" : "ham"}`}>{spam ? "Likely spam" : "Likely legitimate"}</h3></div>
      <div className={`prediction-icon ${spam ? "danger" : "success"}`}>{spam ? <AlertTriangle size={22} /> : <ShieldCheck size={22} />}</div></div>
    <div className="probability-list">
      <div className="probability-row"><div className="probability-meta"><span>Spam probability</span><strong><Percent value={prediction.spamProbability} /></strong></div><div className="meter"><span className="meter-spam" style={{ width: `${prediction.spamProbability * 100}%` }} /></div></div>
      <div className="probability-row"><div className="probability-meta"><span>Ham probability</span><strong><Percent value={prediction.hamProbability} /></strong></div><div className="meter"><span className="meter-ham" style={{ width: `${prediction.hamProbability * 100}%` }} /></div></div>
    </div>
    <div className="prediction-footer"><span><Gauge size={14} /> {prediction.durationMs.toFixed(2)} ms</span>{prediction.modelVersion && <span>Model {prediction.modelVersion}</span>}</div>
  </div>;
}
function AnalyticsView({ overview, recent, loading, onRefresh }: { overview: Overview | null; recent: RecentAnalysis[]; loading: boolean; onRefresh: () => void }) {
  const spamRate = overview?.total ? (overview.spam / overview.total) * 100 : 0;
  return <div className="analytics-stack">
    <div className="section-head"><div><p className="eyebrow">OVERVIEW</p><h3>Classification activity</h3></div><button className="button button-secondary button-small" onClick={onRefresh} disabled={loading}>{loading ? <LoaderCircle className="spin" size={15} /> : <Activity size={15} />} Refresh</button></div>
    {overview ? <>
      <div className="stats-grid">
        <div className="stat-card"><span>Total analyzed</span><strong>{overview.total.toLocaleString()}</strong><small>All recorded analyses</small></div>
        <div className="stat-card"><span>Spam detected</span><strong>{overview.spam.toLocaleString()}</strong><small>Classified as spam</small></div>
        <div className="stat-card"><span>Legitimate</span><strong>{overview.ham.toLocaleString()}</strong><small>Classified as ham</small></div>
        <div className="stat-card"><span>Average latency</span><strong>{overview.avgDurationMs} <em>ms</em></strong><small>Prediction service duration</small></div>
      </div>
      <div className="chart-card"><div className="chart-title"><div><h4>Spam share</h4><p>Share of recorded classifications</p></div><strong>{spamRate.toFixed(1)}%</strong></div>
        <div className="stacked-meter"><span style={{ width: `${spamRate}%` }} /></div><div className="legend"><span><i className="legend-spam" /> Spam · {overview.spam}</span><span><i className="legend-ham" /> Ham · {overview.ham}</span></div></div>
    </> : <div className="empty-state">{loading ? "Loading analytics…" : "Analytics could not be loaded. Check the API connection and refresh."}</div>}
    <div className="recent-card"><div className="section-head"><div><p className="eyebrow">LATEST ACTIVITY</p><h3>Recent analyses</h3></div><span className="muted-label">Metadata only</span></div>
      {recent.length ? <div className="recent-list">{recent.map(item => <div className="recent-row" key={item.id}>
        <span className={`status-pill ${item.label}`}>{item.label}</span><div className="recent-main"><strong>{item.label === "spam" ? "Spam detected" : "Legitimate email"}</strong><small>{new Date(item.createdAt).toLocaleString()}</small></div>
        <span className="recent-score"><Percent value={item.spamProbability} /></span><span className="recent-time">{item.durationMs.toFixed(1)} ms</span>
      </div>)}</div> : <div className="empty-state compact">No analyses recorded yet.</div>}
    </div>
  </div>;
}
export default function Home() {
  const [activeTool, setActiveTool] = useState<Tool>("analyze");
  const [text, setText] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [output, setOutput] = useState("");
  const [batchOutput, setBatchOutput] = useState<Array<{ index: number; label?: string; spamProbability?: number; durationMs?: number; error?: string }> | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [recent, setRecent] = useState<RecentAnalysis[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const emailLines = useMemo(() => text.split(/\r?\n/).map(line => line.trim()).filter(Boolean), [text]);
  const resetResult = () => { setPrediction(null); setOutput(""); setBatchOutput(null); setError(""); };
  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true); setError("");
    try { const [summary, latest] = await Promise.all([mailshieldApi.overview(), mailshieldApi.recent()]); setOverview(summary); setRecent(latest); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load analytics."); }
    finally { setAnalyticsLoading(false); }
  }, []);
  useEffect(() => { if (activeTool === "analytics") void loadAnalytics(); }, [activeTool, loadAnalytics]);
  function changeTool(tool: Tool) { setActiveTool(tool); resetResult(); setText(""); }
  async function submit() {
    setBusy(true); resetResult();
    try {
      if (activeTool === "analyze") setPrediction(await mailshieldApi.analyze(text.trim()));
      else if (activeTool === "generate") setOutput((await mailshieldApi.generate(text.trim(), tone, length)).content);
      else if (activeTool === "improve") setOutput((await mailshieldApi.improve(text.trim())).content);
      else if (activeTool === "security") setOutput((await mailshieldApi.securityScan(text.trim())).report);
      else if (activeTool === "batch") setBatchOutput((await mailshieldApi.batchAnalyze(emailLines)).results);
    } catch (err) { setError(err instanceof Error ? err.message : "The request failed. Please try again."); }
    finally { setBusy(false); }
  }
  async function copyOutput() {
    const value = output || (prediction ? `${prediction.label}\nSpam: ${(prediction.spamProbability * 100).toFixed(1)}%\nHam: ${(prediction.hamProbability * 100).toFixed(1)}%` : "");
    if (!value) return;
    try { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
    catch { setError("Clipboard access is unavailable in this browser context."); }
  }
  const currentTool = tools.find(tool => tool.id === activeTool)!;
  const Icon = currentTool.icon;
  const maxLength = activeTool === "generate" ? 2000 : 20000;
  const validInput = activeTool === "batch"
    ? emailLines.length > 0 && emailLines.length <= 20 && emailLines.every(line => line.length >= 3)
    : text.trim().length >= (activeTool === "generate" ? 5 : 3) && text.length <= maxLength;
  return <main className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#"><span className="brand-mark"><ShieldCheck size={20} /></span><span>mailshield<span className="brand-ai">.ai</span></span></a>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="tool-nav" aria-label="Workspace tools">{tools.map(tool => { const ToolIcon = tool.icon; return <button key={tool.id} className={`nav-item ${activeTool === tool.id ? "selected" : ""}`} onClick={() => changeTool(tool.id)}><ToolIcon size={17} strokeWidth={1.8} /><span>{tool.label}</span>{activeTool === tool.id && <ChevronRight size={15} className="nav-chevron" />}</button>; })}</nav>
      <div className="sidebar-bottom"><div className="privacy-note"><ShieldCheck size={16} /><div><strong>Privacy by design</strong><p>Email bodies aren't stored in analytics.</p></div></div><span className="version-label">MAILSHIELD AI · DEMO</span></div>
    </aside>
    <section className="main-area">
      <header className="topbar"><div className="breadcrumb"><LayoutDashboard size={15} /><span>Workspace</span><ChevronRight size={13} /><strong>{currentTool.label}</strong></div><div className="api-status"><span className="status-indicator" /> API workspace</div></header>
      <div className="content-wrap">
        <div className="page-intro"><div><p className="eyebrow">EMAIL INTELLIGENCE</p><h1>{activeTool === "analytics" ? "Your activity, at a glance." : activeTool === "analyze" ? "Know what’s in your inbox." : activeTool === "generate" ? "Write with a little help." : activeTool === "improve" ? "Make every message clearer." : activeTool === "security" ? "Spot suspicious signals." : "Analyze more, one request."}</h1><p className="intro-copy">{descriptions[activeTool]}</p></div><div className="intro-mark"><ShieldCheck size={29} strokeWidth={1.4} /></div></div>
        {activeTool === "analytics" ? <AnalyticsView overview={overview} recent={recent} loading={analyticsLoading} onRefresh={loadAnalytics} /> :
          <div className="workspace-grid">
            <section className="composer-card">
              <div className="composer-heading"><div className="tool-icon"><Icon size={18} /></div><div><h2>{currentTool.label}</h2><p>{currentTool.description}</p></div></div>
              {activeTool === "generate" && <div className="options-grid"><label>Writing tone<select value={tone} onChange={event => setTone(event.target.value)}><option value="professional">Professional</option><option value="formal">Formal</option><option value="casual">Casual</option><option value="friendly">Friendly</option></select></label><label>Length<select value={length} onChange={event => setLength(event.target.value)}><option value="short">Short</option><option value="medium">Medium</option><option value="detailed">Detailed</option></select></label></div>}
              <label className="field-label" htmlFor="email-content">{activeTool === "generate" ? "What should the email say?" : activeTool === "batch" ? "Email messages" : "Email content"}</label>
              <textarea id="email-content" value={text} onChange={event => setText(event.target.value)} rows={activeTool === "batch" ? 12 : 11} maxLength={maxLength} placeholder={activeTool === "generate" ? "e.g. Write an email to my professor requesting an extension for the assignment due Friday…" : activeTool === "batch" ? "Paste one complete email per line. Maximum 20 emails." : activeTool === "security" ? "Paste the suspicious email, including its subject and visible sender details if available…" : activeTool === "improve" ? "Paste your email draft here…" : "Paste the email text you want to classify…"} />
              <div className="input-footer"><span>{activeTool === "batch" ? `${emailLines.length}/20 messages` : `${text.length.toLocaleString()}/${maxLength.toLocaleString()} characters`}</span><span>{activeTool === "batch" ? "One email per line" : "Sent only when you submit"}</span></div>
              {activeTool === "batch" && emailLines.length > 20 && <p className="inline-error">The batch endpoint accepts a maximum of 20 emails.</p>}
              <button className="button button-primary submit-button" onClick={submit} disabled={busy || !validInput}>{busy ? <><LoaderCircle size={17} className="spin" /> Working…</> : <><Sparkles size={16} /> {activeTool === "analyze" ? "Analyze email" : activeTool === "generate" ? "Generate email" : activeTool === "improve" ? "Improve email" : activeTool === "security" ? "Run security scan" : "Analyze batch"} <ArrowUpRight size={16} /></>}</button>
              <p className="privacy-footnote"><ShieldCheck size={13} /> Analytics stores classification metadata only, not email text.</p>
            </section>
            <section className="output-column">
              <div className="output-header"><div><p className="eyebrow">WORKSPACE OUTPUT</p><h2>Results</h2></div>{(output || prediction) && <button className="icon-button" title="Copy result" onClick={copyOutput}>{copied ? <Check size={16} /> : <Clipboard size={16} />}</button>}</div>
              {error && <div className="error-banner" role="alert"><AlertTriangle size={17} /><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><X size={15} /></button></div>}
              {busy ? <div className="loading-card"><LoaderCircle size={22} className="spin" /><strong>Working on your request</strong><span>This can take a few seconds depending on the service.</span></div> :
                prediction ? <PredictionCard prediction={prediction} /> :
                output ? <ResultPanel title={activeTool === "security" ? "Security assessment" : "AI response"}><div className="prose-output">{output}</div></ResultPanel> :
                batchOutput ? <ResultPanel title={`${batchOutput.length} batch results`}><div className="batch-list">{batchOutput.map(item => <div className="batch-row" key={item.index}><span className="batch-index">{item.index + 1}</span><div className="batch-detail"><strong>{item.error ? "Analysis failed" : item.label === "spam" ? "Likely spam" : "Likely legitimate"}</strong><small>{item.error || `Spam probability: ${((item.spamProbability || 0) * 100).toFixed(1)}% · ${Number(item.durationMs || 0).toFixed(1)} ms`}</small></div><span className={`status-pill ${item.error ? "error" : item.label}`}>{item.error ? "Error" : item.label}</span></div>)}</div></ResultPanel> :
                <div className="empty-output"><div className="empty-icon"><Icon size={23} /></div><strong>Your results will appear here</strong><p>Submit a request to see the output. Nothing is sent until you click the action button.</p></div>}
              <div className="disclaimer"><AlertTriangle size={14} /><p>AI and ML outputs can be wrong. Do not use this demo as the sole basis for security, financial, or account-access decisions.</p></div>
            </section>
          </div>}
        <footer className="page-footer"><span>MAILSHIELD AI</span><span>Built for safer, smarter email workflows.</span></footer>
      </div>
    </section>
  </main>;
}
