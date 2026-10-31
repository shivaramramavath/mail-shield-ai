'use client';
import { useState } from 'react';

type Prediction = { label: string; spamProbability: number; hamProbability: number; durationMs: number; disclaimer: string };
type Overview = { total: number; spam: number; ham: number; avgDurationMs: number };
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const tabs = ['Analyze', 'Generate', 'Improve', 'Security', 'Batch', 'Analytics'] as const;
type Tab = typeof tabs[number];

export default function Home() {
 const [tab,setTab] = useState<Tab>('Analyze');
 const [text,setText] = useState('');
 const [tone,setTone] = useState('professional');
 const [result,setResult] = useState('');
 const [busy,setBusy] = useState(false);
 const [error,setError] = useState('');
 async function request(path: string, body?: unknown) {
   setBusy(true); setError(''); setResult('');
   try {
     const response = await fetch(`${API}/api/v1/${path}`, { method: body ? 'POST' : 'GET', headers: {'Content-Type':'application/json'}, ...(body ? {body: JSON.stringify(body)} : {}) });
     const data = await response.json();
     if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message || `HTTP ${response.status}`);
     if (path === 'email/analyze') {
       const p = data as Prediction;
       setResult(`${p.label.toUpperCase()} | Spam probability: ${(p.spamProbability*100).toFixed(1)}% | Ham probability: ${(p.hamProbability*100).toFixed(1)}% | ${p.durationMs} ms\n${p.disclaimer}`);
     } else if (data.content) setResult(data.content);
     else setResult(JSON.stringify(data,null,2));
   } catch(e) { setError(e instanceof Error ? e.message : 'Request failed'); }
   finally { setBusy(false); }
 }
 function submit() {
   if(tab === 'Analyze') return request('email/analyze',{text});
   if(tab === 'Generate') return request('email/generate',{prompt:text,tone});
   if(tab === 'Improve') return request('email/improve',{text});
   if(tab === 'Security') return request('email/security-scan',{text});
   if(tab === 'Batch') return request('email/batch-analyze',{emails:text.split('\n').map(x=>x.trim()).filter(Boolean)});
   return request('analytics/overview');
 }
 return <main className="max-w-5xl mx-auto p-6 md:p-12">
   <header className="mb-10"><p className="text-lime-300 font-bold tracking-widest">MAILSHIELD / AI</p><h1 className="text-4xl md:text-5xl font-bold mt-3">Email intelligence workspace</h1><p className="muted mt-3">Classify spam, generate emails, and inspect suspicious messages. No login required.</p></header>
   <nav className="flex flex-wrap gap-2 mb-6">{tabs.map(t=><button key={t} onClick={()=>{setTab(t);setResult('');setError('')}} className={`tab ${tab===t?'active':''}`}>{t}</button>)}</nav>
   <section className="card space-y-5"><div><h2 className="text-2xl font-semibold">{tab}</h2><p className="muted mt-1">{tab==='Batch'?'Enter one email per line (up to 100).':tab==='Generate'?'Describe the email you want AI to write.':tab==='Analytics'?'View anonymous aggregate statistics.':'Paste email content below.'}</p></div>
   {tab!=='Analytics'&&<textarea rows={9} value={text} onChange={e=>setText(e.target.value)} maxLength={tab==='Generate'?2000:20000} placeholder={tab==='Generate'?'Write a professional leave request...':'Paste your email here...'} />}
   {tab==='Generate'&&<select value={tone} onChange={e=>setTone(e.target.value)}><option value="professional">Professional</option><option value="formal">Formal</option><option value="casual">Casual</option></select>}
   <button disabled={busy || (tab!=='Analytics' && !text.trim())} onClick={submit}>{busy?'Processing...':tab==='Analytics'?'Refresh statistics':`Run ${tab}`}</button>
   {error&&<p role="alert" className="text-red-400">{error}</p>}
   {result&&<div className="bg-slate-950 p-5 rounded-xl"><h3 className="font-bold text-lime-300 mb-3">Result</h3><pre className="whitespace-pre-wrap break-words text-sm">{result}</pre></div>}
   </section><p className="muted text-sm mt-6">Demo classifier only. Do not rely on predictions for security decisions. Avoid pasting sensitive emails into third-party AI features.</p>
 </main>;
}
