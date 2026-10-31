"use client";

import { useMemo, useState } from "react";
import { AlertCircle, ArrowUpRight, Check, Clipboard, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";
import { api, type Prediction, type BatchItem } from "@/lib/api";
import { MarkdownResult } from "@/components/markdown-result";
import { PageHeading } from "./page-heading";

type Mode = "analyze" | "batch" | "generate" | "improve" | "security";
const config: Record<Mode, { eyebrow: string; title: string; description: string; field: string; placeholder: string; action: string }> = {
  analyze: { eyebrow: "CLASSIFICATION", title: "Analyze an email", description: "Check whether an email resembles spam or legitimate correspondence.", field: "EMAIL CONTENT", placeholder: "Paste the subject and body of the email here…", action: "Analyze email" },
  batch: { eyebrow: "BATCH CLASSIFICATION", title: "Analyze multiple emails", description: "Submit up to 20 email messages in one request. Put each email on a separate line.", field: "EMAIL MESSAGES", placeholder: "Paste one email per line…", action: "Analyze batch" },
  generate: { eyebrow: "AI WRITING", title: "Generate an email", description: "Describe the email you need. Review the generated draft before using it.", field: "WHAT SHOULD THE EMAIL SAY?", placeholder: "e.g. Write a polite email requesting a project review meeting…", action: "Generate email" },
  improve: { eyebrow: "AI WRITING", title: "Improve an email", description: "Improve clarity, grammar, and tone while keeping the original meaning.", field: "YOUR EMAIL DRAFT", placeholder: "Paste your draft here…", action: "Improve writing" },
  security: { eyebrow: "EMAIL SECURITY", title: "Security scan", description: "Review suspicious wording and social-engineering signals. This is an AI assessment, not technical sender verification.", field: "EMAIL TO REVIEW", placeholder: "Paste the suspicious email here…", action: "Run security scan" },
};

function PredictionResult({ result }: { result: Prediction }) {
  const spam = result.label === "spam";
  return <div className="prediction-result">
    <div className="result-topline"><span className="eyebrow">MODEL PREDICTION</span><span className={`result-label ${spam ? "spam" : "ham"}`}>{spam ? "LIKELY SPAM" : "LIKELY LEGITIMATE"}</span></div>
    <div className="probability-block">
      <div className="probability-line"><span>Spam probability</span><strong>{(result.spamProbability * 100).toFixed(1)}%</strong></div>
      <div className="probability-track"><span className="spam-fill" style={{ width: `${result.spamProbability * 100}%` }} /></div>
    </div>
    <div className="probability-block">
      <div className="probability-line"><span>Ham probability</span><strong>{(result.hamProbability * 100).toFixed(1)}%</strong></div>
      <div className="probability-track"><span className="ham-fill" style={{ width: `${result.hamProbability * 100}%` }} /></div>
    </div>
    <div className="result-meta"><span>Inference {result.durationMs.toFixed(2)} ms</span>{result.modelVersion && <span>{result.modelVersion}</span>}</div>
    <p className="result-disclaimer">This is a statistical prediction, not a guarantee. Review suspicious messages independently.</p>
  </div>;
}

export function WorkspaceTool({ mode }: { mode: Mode }) {
  const item = config[mode];
  const [text, setText] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [batch, setBatch] = useState<BatchItem[] | null>(null);
  const [copied, setCopied] = useState(false);
  const emails = useMemo(() => text.split(/\r?\n/).map(v => v.trim()).filter(Boolean), [text]);

  function clearResult() { setError(""); setPrediction(null); setMarkdown(""); setBatch(null); }

  async function submit() {
    setBusy(true); clearResult();
    try {
      if (mode === "analyze") setPrediction(await api.analyze(text.trim()));
      if (mode === "batch") {
        const result = await api.batch(emails);
        setBatch(result.results);
      }
      if (mode === "generate") setMarkdown((await api.generate(text.trim(), tone, length)).content);
      if (mode === "improve") setMarkdown((await api.improve(text.trim())).content);
      if (mode === "security") setMarkdown((await api.security(text.trim())).report);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The request failed.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    const value = markdown || (prediction ? `${prediction.label}\nSpam: ${prediction.spamProbability}\nHam: ${prediction.hamProbability}` : "");
    if (!value) return;
    try { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }
    catch { setError("Could not access the clipboard."); }
  }

  const valid = mode === "batch"
    ? emails.length > 0 && emails.length <= 20 && emails.every(v => v.length >= 3)
    : text.trim().length >= (mode === "generate" ? 5 : 3) && text.length <= (mode === "generate" ? 2000 : 20000);
  const hasOutput = Boolean(prediction || markdown || batch);

  return <div className="page-stack">
    <PageHeading eyebrow={item.eyebrow} title={item.title} description={item.description} />
    <div className="tool-layout">
      <section className="surface input-surface">
        <div className="surface-heading"><div className="surface-icon"><Sparkles size={17} /></div><div><h2>Input</h2><p>Your content is only submitted when you run the action.</p></div></div>
        {mode === "generate" && <div className="field-grid">
          <label className="field-label">TONE<select value={tone} onChange={e => setTone(e.target.value)}><option value="professional">Professional</option><option value="formal">Formal</option><option value="friendly">Friendly</option><option value="casual">Casual</option></select></label>
          <label className="field-label">LENGTH<select value={length} onChange={e => setLength(e.target.value)}><option value="short">Short</option><option value="medium">Medium</option><option value="detailed">Detailed</option></select></label>
        </div>}
        <label className="field-label" htmlFor={`mail-${mode}`}>{item.field}</label>
        <textarea id={`mail-${mode}`} value={text} onChange={e => setText(e.target.value)} rows={mode === "batch" ? 13 : 12} maxLength={mode === "generate" ? 2000 : 20000} placeholder={item.placeholder} />
        <div className="input-meta"><span>{mode === "batch" ? `${emails.length} / 20 messages` : `${text.length.toLocaleString()} characters`}</span><span>{mode === "batch" ? "One email per line" : "No browser-side history"}</span></div>
        {mode === "batch" && emails.length > 20 && <p className="field-error">Maximum batch size is 20 emails.</p>}
        <button className="primary-button" onClick={submit} disabled={!valid || busy}>
          {busy ? <LoaderCircle size={16} className="spin" /> : <ArrowUpRight size={16} />}
          {busy ? "Processing…" : item.action}
        </button>
        <p className="privacy-hint"><ShieldCheck size={14} /> Avoid submitting passwords, financial details, or other sensitive information.</p>
      </section>

      <section className="result-column">
        <div className="result-heading"><div><p className="eyebrow">OUTPUT</p><h2>Result</h2></div>{hasOutput && <button className="icon-button" onClick={copy} aria-label="Copy result">{copied ? <Check size={16} /> : <Clipboard size={16} />}</button>}</div>
        {error && <div className="error-message" role="alert"><AlertCircle size={16} /><span>{error}</span></div>}
        {busy ? <div className="surface result-empty"><LoaderCircle size={23} className="spin" /><strong>Working on your request</strong><p>Waiting for the backend response.</p></div> :
          prediction ? <PredictionResult result={prediction} /> :
          markdown ? <div className="surface result-surface"><div className="result-topline"><span className="eyebrow">AI RESPONSE</span><span className="result-label neutral">MARKDOWN</span></div><MarkdownResult content={markdown} /></div> :
          batch ? <div className="surface result-surface"><div className="result-topline"><span className="eyebrow">BATCH RESULTS</span><span className="result-label neutral">{batch.length} ITEMS</span></div><div className="batch-results">{batch.map(item => {
            const failed = "error" in item;
            return <div className="batch-result-row" key={item.index}><span className="batch-number">{String(item.index + 1).padStart(2, "0")}</span><div className="batch-result-main"><strong>{failed ? "Analysis failed" : item.label === "spam" ? "Likely spam" : "Likely legitimate"}</strong><small>{failed ? item.error : `Spam probability ${(item.spamProbability * 100).toFixed(1)}% · ${item.durationMs.toFixed(2)} ms`}</small></div><span className={`result-label ${failed ? "neutral" : item.label}`}>{failed ? "ERROR" : item.label.toUpperCase()}</span></div>;
          })}</div></div> :
          <div className="surface result-empty"><div className="empty-symbol"><ShieldCheck size={22} /></div><strong>Your result will appear here</strong><p>Submit the input to see the analysis or generated content.</p></div>}
        <div className="result-note"><AlertCircle size={14} /><span>AI-generated content and spam predictions can be inaccurate. Verify important information independently.</span></div>
      </section>
    </div>
  </div>;
}
