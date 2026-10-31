const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/v1/${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
    });
  } catch {
    throw new Error(`Cannot connect to NestJS at ${API_BASE}. Check that the backend is running.`);
  }

  const type = response.headers.get("content-type") || "";
  const data = type.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof data === "object" && data !== null
      ? (Array.isArray(data.message) ? data.message.join(", ") : data.message || data.error)
      : data;
    throw new Error(String(message || `Request failed (${response.status})`));
  }
  return data as T;
}

const post = <T,>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });

export type Prediction = {
  label: "spam" | "ham";
  spamProbability: number;
  hamProbability: number;
  durationMs: number;
  modelVersion?: string | null;
};
export type Overview = { total: number; spam: number; ham: number; avgDurationMs: number };
export type RecentAnalysis = {
  id: string;
  label: "spam" | "ham";
  spamProbability: number;
  durationMs: number;
  createdAt: string;
};
export type BatchItem = (Prediction & { index: number }) | { index: number; error: string };

export const api = {
  analyze: (text: string) => post<Prediction>("email/analyze", { text }),
  generate: (prompt: string, tone: string, length: string) =>
    post<{ content: string }>("email/generate", { prompt, tone, length }),
  improve: (text: string) => post<{ content: string }>("email/improve", { text }),
  security: (text: string) => post<{ report: string }>("email/security-scan", { text }),
  batch: (emails: string[]) => post<{ total: number; results: BatchItem[] }>("email/batch-analyze", { emails }),
  overview: () => request<Overview>("analytics/overview"),
  recent: () => request<RecentAnalysis[]>("analytics/recent"),
};
